/** @jsxImportSource theme-ui */
import styled from 'styled-components'
import { Button, ArrowDropUpIcon, Flex, Text } from '@apeswapfinance/uikit'

export const FarmButton = styled(Button)`
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  padding: 10px 20px;
  min-width: 129px;
  height: 44px;
  justify-content: space-evenly;
`

export const NextArrow = styled(ArrowDropUpIcon)`
  transform: rotate(90deg);
`

export const Container = styled(Flex)`
  flex-direction: row;
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
`

export const TitleText = styled(Text)`
  font-size: 12px;
  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 16px;
  }
`
