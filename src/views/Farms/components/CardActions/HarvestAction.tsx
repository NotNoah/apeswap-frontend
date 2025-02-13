import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useHarvest } from 'hooks/useHarvest'
import { AutoRenewIcon, useMatchBreakpoints } from '@apeswapfinance/uikit'
import { useToast } from 'state/hooks'
import { useIsModalShown } from 'state/user/hooks'
import { getEtherscanLink, showCircular } from 'utils'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import ListViewContent from 'components/ListViewContent'
import { useAppDispatch } from 'state'
import { useTranslation } from 'contexts/Localization'
import { FarmButton } from '../styles'
import { ActionContainer } from './styles'
import { updateFarmV2UserEarnings } from 'state/farmsV2'

interface HarvestActionsProps {
  pid: number
  userEarningsUsd: string
  disabled: boolean
  v2Flag: boolean
}

const HarvestAction: React.FC<HarvestActionsProps> = ({ pid, disabled, userEarningsUsd, v2Flag }) => {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const [pendingTrx, setPendingTrx] = useState(false)
  const { onHarvest } = useHarvest(pid, v2Flag)
  const { toastSuccess } = useToast()
  const { isXl, isLg, isXxl } = useMatchBreakpoints()
  const isMobile = !isLg && !isXl && !isXxl
  const { t } = useTranslation()
  const history = useHistory()

  const { showGeneralHarvestModal } = useIsModalShown()
  const displayGHCircular = () => showGeneralHarvestModal && showCircular(chainId, history, '?modal=circular-gh')

  return (
    <ActionContainer>
      {isMobile && <ListViewContent title={t('Earned')} value={userEarningsUsd} width={100} height={50} ml={10} />}
      <FarmButton
        className="noClick"
        disabled={disabled || pendingTrx}
        onClick={async () => {
          setPendingTrx(true)
          await onHarvest()
            .then((resp) => {
              const trxHash = resp.transactionHash
              toastSuccess(t('Harvest Successful'), {
                text: t('View Transaction'),
                url: getEtherscanLink(trxHash, 'transaction', chainId),
              })
              if (trxHash) displayGHCircular()
            })
            .catch((e) => {
              console.error(e)
              setPendingTrx(false)
            })
          dispatch(updateFarmV2UserEarnings(chainId, pid, account))
          setPendingTrx(false)
        }}
        endIcon={pendingTrx && <AutoRenewIcon spin color="currentColor" />}
      >
        {t('HARVEST')}
      </FarmButton>
      {!isMobile && <ListViewContent title={t('Earned')} value={userEarningsUsd} width={100} height={50} ml={10} />}
    </ActionContainer>
  )
}

export default React.memo(HarvestAction)
