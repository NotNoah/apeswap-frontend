import { Button, Flex } from '@ape.swap/uikit'
import styled from '@emotion/styled'

export const StyledButtonSquare = styled(Button)<{ height?: number }>`
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  padding: 10px 20px;
  width: 100%;
  height: ${({ height }) => height || 44}px;
`

export const SmallButtonSquare = styled(Button)`
  max-width: 44px;
  height: 44px;
`

export const ActionContainer = styled(Flex)`
  width: 100%;
  justify-content: space-between;
  ${({ theme }) => theme.mediaQueries.md} {
    width: auto;
    min-width: 225px;
  }
`

export const CenterContainer = styled(Flex)`
  width: 100%;
  justify-content: center;
  ${({ theme }) => theme.mediaQueries.md} {
    width: auto;
    justify-content: auto;
  }
`
