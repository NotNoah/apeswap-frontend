import React from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import BigNumber from 'bignumber.js'
import { CenterContainer } from './styles'
import ApprovalAction from './ApprovalAction'
import StakeAction from './StakeActions'
import UnlockButton from '../../../../components/UnlockButton'

// Changed props to type string because BigNumbers cause re-renders

interface CardActionProps {
  allowance: string
  stakingTokenBalance: string
  stakedBalance: string
  lpValueUsd: number
  stakeLpAddress: string
  pid: number
  v2Flag: boolean
}

const CardActions: React.FC<CardActionProps> = ({
  allowance,
  stakingTokenBalance,
  stakedBalance,
  lpValueUsd,
  stakeLpAddress,
  pid,
  v2Flag,
}) => {
  const { account } = useActiveWeb3React()
  const actionToRender = () => {
    if (!account) {
      return (
        <CenterContainer>
          <UnlockButton table />
        </CenterContainer>
      )
    }
    if (!new BigNumber(allowance)?.gt(0)) {
      return (
        <CenterContainer>
          <ApprovalAction stakingTokenContractAddress={stakeLpAddress} pid={pid} v2Flag={v2Flag} />
        </CenterContainer>
      )
    }
    return (
      <StakeAction
        stakedBalance={stakedBalance}
        stakingTokenBalance={stakingTokenBalance}
        lpValueUsd={lpValueUsd}
        pid={pid}
        v2Flag={v2Flag}
      />
    )
  }
  return actionToRender()
}

export default React.memo(CardActions)
