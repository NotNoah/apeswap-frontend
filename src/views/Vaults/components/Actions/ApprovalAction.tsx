import React, { useState } from 'react'
import { Skeleton } from '@apeswapfinance/uikit'
import useApproveVault from 'views/Vaults/hooks/useApproveVault'
import { useAppDispatch } from 'state'
import { getEtherscanLink } from 'utils'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useToast } from 'state/hooks'
import { StyledButton } from '../styles'
import { VaultVersion } from 'config/constants/types'
import { fetchVaultV3UserDataAsync } from 'state/vaultsV3'

interface ApprovalActionProps {
  stakingTokenContractAddress: string
  vaultVersion: VaultVersion
  pid: number
  isLoading?: boolean
}

const ApprovalAction: React.FC<ApprovalActionProps> = ({
  stakingTokenContractAddress,
  vaultVersion,
  isLoading = false,
}) => {
  const { chainId, account } = useActiveWeb3React()
  const [pendingTrx, setPendingTrx] = useState(false)
  const dispatch = useAppDispatch()
  const { onApprove } = useApproveVault(stakingTokenContractAddress, vaultVersion)
  const { toastSuccess } = useToast()

  return (
    <>
      {isLoading ? (
        <Skeleton width="100%" height="52px" />
      ) : (
        <StyledButton
          sx={{ minWidth: '227px', width: '227px', textAlign: 'center' }}
          className="noClick"
          disabled={pendingTrx}
          onClick={async () => {
            setPendingTrx(true)
            await onApprove()
              .then((resp) => {
                const trxHash = resp.transactionHash
                toastSuccess('Approve Successful', {
                  text: 'View Transaction',
                  url: getEtherscanLink(trxHash, 'transaction', chainId),
                })
              })
              .catch((e) => {
                console.error(e)
                setPendingTrx(false)
              })
            dispatch(fetchVaultV3UserDataAsync(account, chainId))
            setPendingTrx(false)
          }}
          load={pendingTrx}
        >
          ENABLE
        </StyledButton>
      )}
    </>
  )
}

export default React.memo(ApprovalAction)
