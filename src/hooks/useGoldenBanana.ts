import { useCallback } from 'react'
import { useTreasury } from 'hooks/useContract'
import BigNumber from 'bignumber.js'
import track from 'utils/track'

export const buy = async (contract, amount) => {
  try {
    return contract.buy(new BigNumber(amount).times(new BigNumber(10).pow(18)).toString()).then((tx) => {
      return tx.hash
    })
  } catch (err) {
    return console.warn(err)
  }
}

export const sell = async (contract, amount) => {
  try {
    return contract.sell(new BigNumber(amount).times(new BigNumber(10).pow(18)).toString()).then((tx) => {
      return tx.hash
    })
  } catch (err) {
    return console.warn(err)
  }
}

export const useSellGoldenBanana = (tokenValue: number) => {
  const treasuryContract = useTreasury()

  const handleSell = useCallback(
    async (amount: string) => {
      try {
        const txHash = await sell(treasuryContract, amount)
        track({
          event: 'gnana',
          chain: 56,
          data: {
            amount,
            cat: 'sell',
            usdAmount: parseFloat(amount) * tokenValue,
          },
        })
        return txHash
      } catch (e) {
        return false
      }
    },
    [tokenValue, treasuryContract],
  )

  return { handleSell }
}

export const useBuyGoldenBanana = (tokenValue: number) => {
  const treasuryContract = useTreasury()

  const handleBuy = useCallback(
    async (amount: string) => {
      try {
        const txHash = await buy(treasuryContract, amount)
        track({
          event: 'gnana',
          chain: 56,
          data: {
            amount,
            cat: 'buy',
            usdAmount: parseFloat(amount) * tokenValue,
          },
        })
        return txHash
      } catch (e) {
        return false
      }
    },
    [tokenValue, treasuryContract],
  )

  return { handleBuy }
}
