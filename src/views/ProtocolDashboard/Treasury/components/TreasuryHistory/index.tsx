/** @jsxImportSource theme-ui */
import 'chart.js/auto'
import { Flex, Text } from '@ape.swap/uikit'
import React from 'react'
import { Line } from 'react-chartjs-2'
import stubData from './stubData'
import { styles } from './styles'
import useTheme from 'hooks/useTheme'
import CountUp from 'react-countup'
import { useTranslation } from 'contexts/Localization'

const TreasuryHistory: React.FC = () => {
  const { theme } = useTheme()
  const data = {
    labels: stubData.map((data) => data.date),
    legend: { position: 'top', align: 'left' },
    color: 'red',
    drawBorder: false,
    datasets: [
      {
        label: 'BNB Chain',
        data: stubData.map((data) => data.bnb),
        backgroundColor: 'rgba(243, 186, 47, .5)',
        borderColor: 'rgba(243, 186, 47, 1)',
        fill: true,
        drawTicks: false,
        lineTension: 0.5,
      },
      {
        data: stubData.map((data) => data.polygon),
        label: 'Polygon',
        backgroundColor: 'rgba(130, 71, 229, .5)',
        borderColor: 'rgba(130, 71, 229, 1)',
        fill: true,
        lineTension: 0.8,
      },
      {
        label: 'Ethereum',
        data: stubData.map((data) => data.ethereum),
        backgroundColor: 'rgba(98, 126, 234, .5)',
        borderColor: 'rgba(98, 126, 234, 1)',
        fill: true,
        lineTension: 0.8,
      },
    ],
  }

  const { t } = useTranslation()

  return (
    <Flex sx={styles.cardContainer}>
      <Flex sx={{ flexDirection: 'column', textAlign: 'center', marginBottom: '10px' }}>
        <Text size="22px" weight={700} mb="10px">
          {t('Treasury')}
        </Text>
        <Text size="16px" weight={500}>
          $<CountUp end={57783576553} decimals={2} duration={1} separator="," />
        </Text>
      </Flex>
      <Flex sx={{ position: 'relative', maxWidth: '100%', width: '99%', height: '100%' }}>
        <Line
          datasetIdKey="totalTradeVolume"
          data={data}
          options={{
            color: theme.colors.text,
            scales: {
              y: {
                grid: { display: false, drawBorder: false },
                ticks: { display: false },
              },
              x: {
                grid: { display: false, drawBorder: false },
                ticks: { display: false },
              },
            },
            plugins: {
              legend: {
                display: false,
                position: 'bottom',
                fullSize: true,
                labels: {
                  color: theme.colors.text,
                  font: { family: 'poppins', weight: '600' },
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </Flex>
    </Flex>
  )
}

export default TreasuryHistory
