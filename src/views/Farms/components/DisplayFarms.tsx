/** @jsxImportSource theme-ui */
import React from 'react'
import { Text, Svg } from '@apeswapfinance/uikit'
import { TagVariants, useModal } from '@ape.swap/uikit'
import { Box } from 'theme-ui'
import ListView from 'components/ListView'
import { ExtendedListViewProps } from 'components/ListView/types'
import ListViewContent from 'components/ListViewContent'
import { Farm, Tag } from 'state/types'
import { getBalanceNumber } from 'utils/formatBalance'
import BigNumber from 'bignumber.js'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import CalcButton from 'components/RoiCalculator/CalcButton'
import { useTranslation } from 'contexts/Localization'
import useIsMobile from 'hooks/useIsMobile'
import { Field, selectCurrency } from 'state/swap/actions'
import { useAppDispatch } from 'state'
import CardActions from './CardActions'
import { Container, FarmButton, NextArrow } from './styles'
import HarvestAction from './CardActions/HarvestAction'
import { ActionContainer, StyledTag } from './CardActions/styles'
import DualLiquidityModal from 'components/DualAddLiquidity/DualLiquidityModal'
import { selectOutputCurrency } from 'state/zap/actions'
import { Svg as Icon } from '@ape.swap/uikit'
import Tooltip from 'components/Tooltip/Tooltip'

const DisplayFarms: React.FC<{ farms: Farm[]; openPid?: number; farmTags: Tag[]; v2Flag: boolean }> = ({
  farms,
  openPid,
  farmTags,
  v2Flag,
}) => {
  const { chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const dispatch = useAppDispatch()

  const [onPresentAddLiquidityModal] = useModal(<DualLiquidityModal />, true, true, 'liquidityWidgetModal')

  const showLiquidity = (token, quoteToken, farm) => {
    dispatch(
      selectCurrency({
        field: Field.INPUT,
        currencyId: token,
      }),
    )
    dispatch(
      selectCurrency({
        field: Field.OUTPUT,
        currencyId: quoteToken,
      }),
    )
    dispatch(
      selectOutputCurrency({
        currency1: farm.tokenAddresses[chainId],
        currency2: farm.quoteTokenAdresses[chainId],
      }),
    )
    onPresentAddLiquidityModal()
  }

  const farmsListView = farms.map((farm) => {
    const [token1, token2] = farm.lpSymbol.split('-')
    const userAllowance = farm?.userData?.allowance
    const userEarnings = getBalanceNumber(farm?.userData?.earnings || new BigNumber(0))?.toFixed(2)
    const userEarningsUsd = `$${(
      getBalanceNumber(farm?.userData?.earnings || new BigNumber(0)) * farm.bananaPrice
    ).toFixed(2)}`
    const userTokenBalance = `${getBalanceNumber(farm?.userData?.tokenBalance || new BigNumber(0))?.toFixed(6)} LP`
    const userTokenBalanceUsd = `$${(
      getBalanceNumber(farm?.userData?.tokenBalance || new BigNumber(0)) * farm?.lpValueUsd
    ).toFixed(2)}`
    const fTag = farmTags?.find((tag) => tag.pid === farm.pid)
    const tagColor = fTag?.color as TagVariants

    return {
      tag: (
        <>
          {fTag?.pid === farm.pid && (
            <Box sx={{ marginRight: '5px', mt: '1px' }}>
              <StyledTag key={fTag?.pid} variant={tagColor}>
                {fTag?.text}
              </StyledTag>
            </Box>
          )}
        </>
      ),
      tokens: { token1: farm.pid === 184 ? 'NFTY2' : token1, token2, token3: 'BANANA' },
      stakeLp: true,
      title: <Text bold>{farm.lpSymbol}</Text>,
      open: farm.pid === openPid,
      id: farm.pid,
      infoContent: (
        <Tooltip
          valueTitle={t('Multiplier')}
          valueContent={farm?.multiplier}
          secondURL={farm?.projectLink}
          secondURLTitle={t('Learn More')}
          tokenContract={farm?.lpAddresses[chainId]}
        />
      ),
      infoContentPosition: 'translate(8%, 0%)',
      toolTipIconWidth: isMobile && '20px',
      toolTipStyle: isMobile && { marginTop: '5px', marginRight: '10px' },
      cardContent: (
        <>
          <ListViewContent
            title={t('APY')}
            value={parseFloat(farm?.apy) > 1000000 ? `>1,000,000%` : `${farm?.apy}%`}
            width={isMobile ? 90 : 150}
            ml={20}
            toolTip={t(
              'APY includes annualized BANANA rewards and rewards for providing liquidity (DEX swap fees), compounded daily.',
            )}
            toolTipPlacement="bottomLeft"
            toolTipTransform="translate(8%, 0%)"
          />
          <ListViewContent
            title={t('APR')}
            value={`${farm?.apr}%`}
            value2={`${farm?.lpApr}%`}
            value2Icon={
              <span style={{ marginRight: '7px' }}>
                <Svg icon="swap" width={13} color="text" />
              </span>
            }
            valueIcon={
              <span style={{ marginRight: '5px' }}>
                <Svg icon="banana_token" width={15} color="text" />
              </span>
            }
            width={isMobile ? 100 : 180}
            toolTip={t(
              'BANANA reward APRs are calculated in real time. DEX swap fee APRs are calculated based on previous 24 hours of trading volume. Note: APRs are provided for your convenience. APRs are constantly changing and do not represent guaranteed returns.',
            )}
            toolTipPlacement="bottomLeft"
            toolTipTransform="translate(8%, 0%)"
            aprCalculator={
              <CalcButton
                label={farm.lpSymbol}
                rewardTokenName="BANANA"
                rewardTokenPrice={farm.bananaPrice}
                apr={parseFloat(farm?.apr)}
                lpApr={parseFloat(farm?.lpApr)}
                apy={parseFloat(farm?.apy)}
                lpAddress={farm.lpAddresses[chainId]}
                isLp
                tokenAddress={farm.tokenAddresses[chainId]}
                quoteTokenAddress={farm.quoteTokenSymbol === 'BNB' ? 'ETH' : farm.quoteTokenAdresses[chainId]}
                lpCurr1={farm?.tokenAddresses[chainId]}
                lpCurr2={farm?.quoteTokenAdresses[chainId]}
              />
            }
          />
          <ListViewContent
            title={t('Liquidity')}
            value={`$${Number(farm?.totalLpStakedUsd).toLocaleString(undefined)}`}
            width={isMobile ? 100 : 180}
            toolTip={t('The total value of the LP tokens currently staked in this farm.')}
            toolTipPlacement={isMobile ? 'bottomRight' : 'bottomLeft'}
            toolTipTransform={isMobile ? 'translate(13%, 0%)' : 'translate(23%, 0%)'}
          />
          <ListViewContent title={t('Earned')} value={userEarnings} width={isMobile ? 65 : 120} />
        </>
      ),
      expandedContent: (
        <>
          <ActionContainer>
            {isMobile && (
              <ListViewContent
                title={t('Available LP')}
                value={userTokenBalance}
                value2={userTokenBalanceUsd}
                value2Secondary
                width={100}
                height={50}
                lineHeight={15}
                ml={10}
              />
            )}
            <FarmButton
              onClick={() =>
                showLiquidity(
                  farm.tokenAddresses[chainId],
                  farm.quoteTokenSymbol === 'BNB' ? 'ETH' : farm.quoteTokenAdresses[chainId],
                  farm,
                )
              }
            >
              {t('GET LP')} <Icon icon="ZapIcon" color="primaryBright" />
            </FarmButton>
            {!isMobile && (
              <ListViewContent
                title={t('Available LP')}
                value={userTokenBalance}
                value2={userTokenBalanceUsd}
                value2Secondary
                width={100}
                height={50}
                lineHeight={15}
                ml={10}
              />
            )}
          </ActionContainer>
          {!isMobile && <NextArrow />}
          <CardActions
            allowance={userAllowance?.toString()}
            stakedBalance={farm?.userData?.stakedBalance?.toString()}
            stakingTokenBalance={farm?.userData?.tokenBalance?.toString()}
            stakeLpAddress={farm.lpAddresses[chainId]}
            lpValueUsd={farm.lpValueUsd}
            pid={farm.pid}
            v2Flag={v2Flag}
          />
          {!isMobile && <NextArrow />}
          <HarvestAction
            pid={farm.pid}
            disabled={userEarnings === '0.00'}
            userEarningsUsd={userEarningsUsd}
            v2Flag={v2Flag}
          />
        </>
      ),
    } as ExtendedListViewProps
  })

  return (
    <Container>
      <ListView listViews={farmsListView} />
    </Container>
  )
}

export default React.memo(DisplayFarms)
