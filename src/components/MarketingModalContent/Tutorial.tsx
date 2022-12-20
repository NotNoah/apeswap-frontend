/** @jsxImportSource theme-ui */
import React from 'react'
import { Flex, Text, TutorialModal, useWalletModal } from '@ape.swap/uikit'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { NETWORK_LABEL } from 'config/constants/chains'
import { METAMASK_LINKS } from 'config/constants'
import { useTranslation } from 'contexts/Localization'
import { OrderSlides } from './Orders'
import { LiquiditySlides } from './Liquidity'
import { styles } from './styles'
import useAuth from '../../hooks/useAuth'
import useIsMobile from '../../hooks/useIsMobile'
import {
  SwapSlides,
  FarmSlides,
  PoolSlides,
  MaximizerSlides,
  GnanaSlides,
  BillsSlides,
  IAOSlides,
  OrdersSlides,
} from './TutorialSlides'

const Tutorial: React.FC<{
  location: string
  onDismiss: () => void
}> = ({ location, onDismiss }) => {
  const { t } = useTranslation()
  const { chainId, account } = useActiveWeb3React()
  const isMobile = useIsMobile()
  const networkLabel = NETWORK_LABEL[chainId]
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout, t)
  console.log(location)

  const connectWalletSlide = (
    <Flex sx={styles.contentContainer} key={0}>
      <Text sx={styles.stepNo}>{t(`Step 0`)}</Text>
      <Text sx={styles.slideTitle}>{t('Connect Your Wallet')}</Text>
      <Flex sx={{ flexWrap: 'wrap', mt: 2, ...styles.content }}>
        <Text sx={styles.yellow} onClick={onPresentConnectModal}>
          {t('Click here')}
        </Text>
        <Text sx={{ ml: '3px' }}>{t('to connect your wallet to ApeSwap.')}</Text>
        <Text sx={{ fontStyle: 'italic' }}>
          {t(`Don’t have a wallet? A full setup guide for MetaMask on ${NETWORK_LABEL[chainId]} can be found `)}
          <Text sx={styles.yellow}>
            <a href={METAMASK_LINKS[NETWORK_LABEL[chainId]]} target="_blank" rel="noreferrer noopener">
              {t('here')}
            </a>
          </Text>
        </Text>
      </Flex>
    </Flex>
  )
  console.log(networkLabel)

  const tutorials = {
    '/swap': {
      type: `${networkLabel}-dex`,
      title: "Welcome to ApeSwap's Dex",
      description: `Easily trade ANY token on ${networkLabel} Chain!`,
      slides: account ? SwapSlides() : [connectWalletSlide, ...SwapSlides()],
    },
    '/farms': {
      type: `${networkLabel}-farms`,
      title: `Welcome to ${networkLabel === 'BNB' ? 'BANANA' : networkLabel} Farms`,
      description: `Earn BANANA by staking liquidity provider (LP) tokens!`,
      slides: account ? FarmSlides() : [connectWalletSlide, ...FarmSlides()],
    },
    '/jungle-farms': {
      type: `jungle-farms`,
      title: `Welcome to Jungle Farms`,
      description: `Earn Partner Tokens by Staking Liquidity!`,
      slides: account ? FarmSlides() : [connectWalletSlide, ...FarmSlides()],
    },
    '/pools': {
      type: 'pools',
      title: 'Welcome to Staking Pools',
      description: 'Earn tokens by staking BANANA or GNANA!',
      slides: account ? PoolSlides() : [connectWalletSlide, ...PoolSlides()],
    },
    '/maximizers': {
      type: 'maximizers',
      title: 'Welcome to Banana Maximizers',
      description: 'Maximize your BANANA yields!',
      slides: account ? MaximizerSlides() : [connectWalletSlide, ...MaximizerSlides()],
    },
    '/gnana': {
      type: 'gnana',
      title: 'Welcome to Golden Banana',
      description: 'Unlock the exclusive benefits of GNANA!',
      slides: account ? GnanaSlides() : [connectWalletSlide, ...GnanaSlides()],
    },
    '/treasury-bills': {
      type: 'treasury-bills',
      title: 'Welcome to Treasury Bills',
      description: 'Buy tokens at a discount and obtain a unique NFT!',
      slides: account ? BillsSlides() : [connectWalletSlide, ...BillsSlides()],
    },
    '/iao': {
      type: 'iao',
      title: 'Welcome to Initial Ape Offerings',
      description: 'Contribute BNB or GNANA to obtain newly launched tokens!',
      slides: account ? IAOSlides() : [connectWalletSlide, ...IAOSlides()],
    },
    '/limit-orders': {
      type: 'orders',
      title: 'Welcome to Limit Orders',
      description: 'Trade at the price you want!',
      slides: account ? OrdersSlides() : [connectWalletSlide, ...OrdersSlides()],
    },
    liquidity: {
      title: "Welcome to ApeSwap's Dex Liquidity",
      description: 'Provide liquidity to earn trading fees!',
      slides: LiquiditySlides,
    },
  }

  return (
    <TutorialModal
      type={tutorials[location]?.type}
      title={tutorials[location]?.title}
      description={tutorials[location]?.description}
      t={t}
      onDismiss={onDismiss}
      readyText={t("I'm Ready")}
      isConnected={!!account}
    >
      {tutorials[location].slides}
    </TutorialModal>
  )
}

export default Tutorial
