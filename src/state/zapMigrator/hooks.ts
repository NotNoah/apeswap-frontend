import { Currency, CurrencyAmount, JSBI, Pair, Percent, SmartRouter, TokenAmount } from '@ape.swap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { usePair } from 'hooks/usePairs'
import { useTranslation } from 'contexts/Localization'
import useTotalSupply from 'hooks/useTotalSupply'

import { AppDispatch, AppState } from '../index'
import { tryParseAmount } from '../swap/hooks'
import { useTokenBalances } from '../wallet/hooks'
import { Field, typeInput, setMigrator, MigratorZap } from './actions'
import { useLastZapMigratorRouter, useUserSlippageTolerance } from 'state/user/hooks'
import { calculateSlippageAmount } from 'utils'

export function useZapMigratorState(): AppState['zapMigrator'] {
  return useSelector<AppState, AppState['zapMigrator']>((state) => state.zapMigrator)
}

export function useDerivedZapMigratorInfo(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): {
  pair?: Pair | null
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: CurrencyAmount
    [Field.CURRENCY_B]?: CurrencyAmount
  }
  zapMigrate: MigratorZap
  error?: string
} {
  const { account, chainId } = useActiveWeb3React()

  const { independentField, typedValue, smartRouter } = useZapMigratorState()
  const [zapMigratorRouter] = useLastZapMigratorRouter()
  const [allowedSlippage] = useUserSlippageTolerance()

  // pair + totalsupply
  const [, pair] = usePair(currencyA, currencyB, smartRouter || zapMigratorRouter)
  const { t } = useTranslation()

  // balances
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [pair?.liquidityToken])
  const userLiquidity: undefined | TokenAmount = relevantTokenBalances?.[pair?.liquidityToken?.address ?? '']

  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
  const tokens = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
    [Field.LIQUIDITY]: pair?.liquidityToken,
  }

  // liquidity values
  const totalSupply = useTotalSupply(pair?.liquidityToken)
  const liquidityValueA =
    pair &&
    totalSupply &&
    userLiquidity &&
    tokenA &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? new TokenAmount(tokenA, pair.getLiquidityValue(tokenA, totalSupply, userLiquidity, false).raw)
      : undefined
  const liquidityValueB =
    pair &&
    totalSupply &&
    userLiquidity &&
    tokenB &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? new TokenAmount(tokenB, pair.getLiquidityValue(tokenB, totalSupply, userLiquidity, false).raw)
      : undefined
  const liquidityValues: { [Field.CURRENCY_A]?: TokenAmount; [Field.CURRENCY_B]?: TokenAmount } = {
    [Field.CURRENCY_A]: liquidityValueA,
    [Field.CURRENCY_B]: liquidityValueB,
  }

  let percentToRemove: Percent = new Percent('0', '100')
  // user specified a %
  if (independentField === Field.LIQUIDITY_PERCENT) {
    percentToRemove = new Percent(typedValue, '100')
  }
  // user specified a specific amount of liquidity tokens
  else if (independentField === Field.LIQUIDITY) {
    if (pair?.liquidityToken) {
      const independentAmount = tryParseAmount(typedValue, pair.liquidityToken)
      if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity)) {
        percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw)
      }
    }
  }
  // user specified a specific amount of token a or b
  else if (tokens[independentField]) {
    const independentAmount = tryParseAmount(typedValue, tokens[independentField])
    const liquidityValue = liquidityValues[independentField]
    if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
      percentToRemove = new Percent(independentAmount.raw, liquidityValue.raw)
    }
  }

  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: TokenAmount
    [Field.CURRENCY_B]?: TokenAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
      userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
        ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
        : undefined,
    [Field.CURRENCY_A]:
      tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
        ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
        : undefined,
    [Field.CURRENCY_B]:
      tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
        ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
        : undefined,
  }

  // Get the min amount to remove

  const amountsMinRemove = {
    [Field.CURRENCY_A]: parsedAmounts?.CURRENCY_A
      ? calculateSlippageAmount(parsedAmounts.CURRENCY_A, allowedSlippage)[0]
      : '0',
    [Field.CURRENCY_B]: parsedAmounts?.CURRENCY_B
      ? calculateSlippageAmount(parsedAmounts.CURRENCY_B, allowedSlippage)[0]
      : '0',
  }

  // Get the min amount to add

  const amountsMinAdd = {
    [Field.CURRENCY_A]: parsedAmounts?.CURRENCY_A
      ? calculateSlippageAmount(
          new TokenAmount(parsedAmounts?.CURRENCY_A.token, amountsMinRemove[Field.CURRENCY_A]),
          allowedSlippage,
        )[0]
      : '0',
    [Field.CURRENCY_B]: parsedAmounts?.CURRENCY_B
      ? calculateSlippageAmount(
          new TokenAmount(parsedAmounts?.CURRENCY_B.token, amountsMinRemove[Field.CURRENCY_B]),
          allowedSlippage,
        )[0]
      : '0',
  }

  const zapMigrate = {
    chainId,
    zapLp: pair,
    amount: parsedAmounts?.LIQUIDITY?.raw.toString(),
    amountAMinRemove: amountsMinRemove[Field.CURRENCY_A]?.toString(),
    amountBMinRemove: amountsMinRemove[Field.CURRENCY_B]?.toString(),
    amountAMinAdd: amountsMinAdd[Field.CURRENCY_A]?.toString(),
    amountBMinAdd: amountsMinAdd[Field.CURRENCY_B]?.toString(),
  }

  let error: string | undefined
  if (!account) {
    error = t('Connect Wallet')
  }

  if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? t('Enter an amount')
  }

  return { pair, parsedAmounts, zapMigrate, error }
}

export function useZapMigratorActionHandlers(): {
  onUserInput: (field: Field, typedValue: string) => void
  onUserSetMigrator: (pairAddress: string, smartRouter: SmartRouter) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch],
  )

  const onUserSetMigrator = useCallback(
    (pairAddress: string, smartRouter: SmartRouter) => {
      dispatch(setMigrator({ pairAddress, smartRouter }))
    },
    [dispatch],
  )

  return {
    onUserInput,
    onUserSetMigrator,
  }
}
