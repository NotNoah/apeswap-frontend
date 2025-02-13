import { IconButton, Text, Flex, TagVariants, Svg } from '@ape.swap/uikit'
import { Box } from 'theme-ui'
import BigNumber from 'bignumber.js'
import ListView from 'components/ListView'
import { ExtendedListViewProps } from 'components/ListView/types'
import ListViewContent from 'components/ListViewContent'
import { useLocation } from 'react-router-dom'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useIsMobile from 'hooks/useIsMobile'
import React from 'react'
import { JungleFarm, Tag } from 'state/types'
import { getBalanceNumber } from 'utils/formatBalance'
import { NextArrow } from 'views/Farms/components/styles'
import { useTranslation } from 'contexts/Localization'
import Actions from './Actions'
import HarvestAction from './Actions/HarvestAction'
import { Container, StyledButton, ActionContainer } from './styles'
import { StyledTag } from '../../Pools/components/styles'
import CalcButton from 'components/RoiCalculator/CalcButton'
import useAddLiquidityModal from '../../../components/DualAddLiquidity/hooks/useAddLiquidityModal'
import { ZapType } from '@ape.swap/sdk'
import Tooltip from 'components/Tooltip/Tooltip'
import { BLOCK_EXPLORER } from '../../../config/constants/chains'

const DisplayJungleFarms: React.FC<{ jungleFarms: JungleFarm[]; openId?: number; jungleFarmTags: Tag[] }> = ({
  jungleFarms,
  openId,
  jungleFarmTags,
}) => {
  const { chainId } = useActiveWeb3React()
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const isActive = !pathname.includes('history')

  const onAddLiquidityModal = useAddLiquidityModal(ZapType.ZAP_LP_POOL)

  const jungleFarmsListView = jungleFarms.map((farm) => {
    const isZapable = !farm?.unZapable
    const [token1, token2] = farm.tokenName.split('-')
    const totalDollarAmountStaked = Math.round(getBalanceNumber(farm?.totalStaked) * farm?.stakingToken?.price)

    const userEarnings = getBalanceNumber(
      farm?.userData?.pendingReward || new BigNumber(0),
      farm?.rewardToken?.decimals[chainId],
    )
    const userEarningsUsd = `$${(userEarnings * farm.rewardToken?.price).toFixed(2)}`
    const userTokenBalance = `${getBalanceNumber(farm?.userData?.stakingTokenBalance || new BigNumber(0))?.toFixed(6)}`
    const userTokenBalanceUsd = `$${(
      getBalanceNumber(farm?.userData?.stakingTokenBalance || new BigNumber(0)) * farm?.stakingToken?.price
    ).toFixed(2)}`
    const jTag = jungleFarmTags?.find((tag) => tag.pid === farm.jungleId)
    const tagColor = jTag?.color as TagVariants
    const explorerLink = BLOCK_EXPLORER[chainId]
    const stakingContractURL = `${explorerLink}/address/${farm?.contractAddress[chainId]}`

    return {
      tag: (
        <>
          {jTag?.pid === farm.jungleId && (
            <Box sx={{ marginRight: '5px', marginTop: ['0px', '2px'] }}>
              <StyledTag key={jTag?.pid} variant={tagColor}>
                {jTag?.text}
              </StyledTag>
            </Box>
          )}
        </>
      ),
      tokens: {
        token1: token1 === 'LC' ? 'LC2' : token1,
        token2,
        token3: farm?.rewardToken?.symbol === 'LC' ? 'LC2' : farm?.rewardToken?.symbol,
      },
      stakeLp: true,
      title: <Text bold>{farm?.tokenName}</Text>,
      id: farm.jungleId,
      infoContent: (
        <Tooltip
          jungleFarm={farm}
          tokenContract={farm?.rewardToken?.address[chainId]}
          secondURL={stakingContractURL}
          secondURLTitle={t('View Farm Contract')}
          projectLink={farm?.projectLink}
          twitter={farm?.twitter}
          audit={farm?.audit}
        />
      ),
      infoContentPosition: 'translate(8%, 0%)',
      toolTipIconWidth: isMobile && '20px',
      toolTipStyle: isMobile && { marginTop: '10px', marginRight: '10px' },
      open: openId === farm.jungleId,
      cardContent: (
        <>
          <Flex sx={{ width: '90px', height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            {!isMobile && (
              <>
                {farm.projectLink && (
                  <a href={farm.projectLink} target="_blank" rel="noreferrer">
                    <IconButton icon="website" color="primaryBright" width={20} style={{ padding: '8.5px 10px' }} />
                  </a>
                )}
                {farm?.twitter && (
                  <a href={farm?.twitter} target="_blank" rel="noreferrer">
                    <IconButton icon="twitter" color="primaryBright" width={20} />
                  </a>
                )}
              </>
            )}
          </Flex>
          <ListViewContent
            title={t('APR')}
            value={`${isActive ? farm?.apr?.toFixed(2) : '0.00'}%`}
            width={isMobile ? 95 : 80}
            height={50}
            toolTip={t(
              'APRs are calculated in real time. Note: APRs are provided for your convenience. APRs are constantly changing and do not represent guaranteed returns.',
            )}
            toolTipPlacement="bottomLeft"
            toolTipTransform="translate(8%, 0%)"
            aprCalculator={
              <CalcButton
                label={farm.tokenName}
                rewardTokenName={farm?.rewardToken?.symbol}
                rewardTokenPrice={farm?.rewardToken?.price}
                apr={farm?.apr}
                lpAddress={farm?.stakingToken?.address[chainId]}
                isLp
                lpPrice={farm?.stakingToken?.price}
                tokenAddress={farm?.lpTokens?.token?.address[chainId]}
                quoteTokenAddress={
                  farm?.lpTokens?.quoteToken?.address[chainId] === 'TLOS'
                    ? 'ETH'
                    : farm?.lpTokens?.quoteToken?.address[chainId]
                }
                lpCurr1={farm?.lpTokens?.token?.address[chainId]}
                lpCurr2={farm?.lpTokens?.quoteToken?.address[chainId]}
              />
            }
          />
          <ListViewContent
            title={t('Liquidity')}
            value={`$${totalDollarAmountStaked.toLocaleString(undefined)}`}
            width={isMobile ? 160 : 110}
            height={50}
            toolTip={t('The total value of the LP tokens currently staked in this farm.')}
            toolTipPlacement={(isMobile && 'bottomRight') || 'bottomLeft'}
            toolTipTransform={(isMobile && 'translate(13%, 0%)') || 'translate(23%, 0%)'}
          />
          <ListViewContent title={t('Earned')} value={userEarningsUsd} height={50} width={isMobile ? 80 : 150} />
        </>
      ),
      expandedContent: (
        <>
          <ActionContainer>
            {isMobile && (
              <ListViewContent
                title={`${t('Available LP')}`}
                value={userTokenBalance}
                value2={userTokenBalanceUsd}
                value2Secondary
                width={190}
                height={50}
                lineHeight={15}
                ml={10}
              />
            )}

            <StyledButton
              onClick={() =>
                onAddLiquidityModal(
                  farm?.lpTokens?.token,
                  farm?.lpTokens?.quoteToken,
                  farm?.contractAddress[chainId],
                  farm?.jungleId?.toString(),
                  isZapable,
                )
              }
            >
              {t('GET LP')} <Svg icon="ZapIcon" color="primaryBright" />
            </StyledButton>

            {!isMobile && (
              <ListViewContent
                title={`${t('Available LP')}`}
                value={userTokenBalance}
                value2={userTokenBalanceUsd}
                value2Secondary
                width={190}
                height={50}
                lineHeight={15}
                ml={10}
              />
            )}
          </ActionContainer>
          {!isMobile && <NextArrow />}
          <Actions farm={farm} />
          {!isMobile && <NextArrow />}
          <HarvestAction
            jungleId={farm?.jungleId}
            disabled={userEarnings <= 0}
            userEarnings={userEarnings}
            earnTokenSymbol={farm?.rewardToken?.symbol || farm?.tokenName}
          />
        </>
      ),
    } as ExtendedListViewProps
  })
  return (
    <Container>
      <ListView listViews={jungleFarmsListView} />
    </Container>
  )
}

export default React.memo(DisplayJungleFarms)
