import React, { useEffect, useState } from 'react'
import { Flex, Text } from '@apeswapfinance/uikit'
import styled from '@emotion/styled'
import moment from 'moment/moment'
import useTheme from '../../../../hooks/useTheme'
import { CenteredImage } from '../../../Ifos/components/HowItWorks/styles'
import { IconBox, Container, SectionsWrapper, Section } from '../../styles'
import { CHAINS } from '../../config/config'
import { ResponsiveBar } from '@nivo/bar'
import { useFetchChartData, useFetchInfoDaysData, useFetchInfoUniswapFactories } from '../../../../state/info/hooks'

interface IconProps {
  name: string
}

const Icon = ({ name }: IconProps) => {
  const { isDark } = useTheme()

  return (
    <IconBox>
      <CenteredImage src={`/images/info/${name}-${isDark ? 'dark' : 'light'}.svg`} alt={name} />
    </IconBox>
  )
}

const OverallFigures: React.FC<any> = (props) => {
  const [state, setState] = useState({
    displayedValue: 0,
    displayedValueDate: '',
    chartType: 'volume',
  })

  const { isDark } = useTheme()

  const currentDayData = useFetchInfoUniswapFactories(true)
  const dayOldData = useFetchInfoUniswapFactories()
  const chartData = useFetchChartData(30)

  function processChartData() {
    const data = []

    for (let i = 0; i < Object.keys(chartData).length; i++) {
      const chain = Object.keys(chartData)[i]

      if (data.length === 0) {
        for (let j = 0; j < chartData[chain].data.length; j++) {
          data.push({
            date: chartData[chain].data[j].date,
            [chain]: chartData[chain].data[j].dailyVolumeUSD,
          })
        }
      } else {
        for (let j = 0; j < chartData[chain].data.length; j++) {
          data[j][chain] = chartData[chain].data[j].dailyVolumeUSD
        }
      }
    }

    return data.reverse()
  }

  function processChartLiquidityData() {
    const data = []

    for (let i = 0; i < Object.keys(chartData).length; i++) {
      const chain = Object.keys(chartData)[i]

      if (data.length === 0) {
        for (let j = 0; j < chartData[chain].data.length; j++) {
          data.push({
            date: chartData[chain].data[j].date,
            [chain]: chartData[chain].data[j].totalLiquidityUSD,
          })
        }
      } else {
        for (let j = 0; j < chartData[chain].data.length; j++) {
          data[j][chain] = chartData[chain].data[j].totalLiquidityUSD
        }
      }
    }

    return data.reverse()
  }

  function getLiquidity() {
    let liquidity = 0
    for (let i = 0; i < Object.keys(chartData).length; i++) {
      const chain = Object.keys(chartData)[i]

      for (let j = 0; j < chartData[chain].data.length; j++) {
        liquidity += Number(chartData[chain].data[j].totalLiquidityUSD)
      }
    }
    return liquidity
  }

  function getBarColor(bar: any) {
    return CHAINS.filter((x) => x.chainId == bar.id)[0].color
  }

  function calculateFees() {
    return (calculateCurrentFigures('totalVolumeUSD') - calculateOneDayFigures('totalVolumeUSD')) * 0.002
  }

  function UpdateChart(amount: number) {
    //chartData = useFetchChartData(amount)
  }

  function calculate7DayVolume() {
    let total = 0

    processChartData()
      .reverse()
      .slice(0, 7)
      .map((item: any) => {
        for (let i = 0; i < CHAINS.length; i++) {
          total += item[CHAINS[i].chainId] ? Number(item[CHAINS[i].chainId]) : 0
        }
      })

    return total
  }

  function calculateCurrentFigures(key: string) {
    let total = 0

    for (let i = 0; i < Object.keys(currentDayData).length; i++) {
      const chain = Object.keys(currentDayData)[i]
      total += Number(currentDayData[chain].data[key])
    }

    return total
  }

  function calculateOneDayFigures(key: string) {
    let total = 0
    for (let i = 0; i < Object.keys(dayOldData).length; i++) {
      const chain = Object.keys(dayOldData)[i]
      total += Number(dayOldData[chain].data[key])
    }

    return total
  }

  function checkDatasInitialized() {
    let total = 0
    for (let i = 0; i < Object.keys(currentDayData).length; i++) {
      const chain = Object.keys(currentDayData)[i]
      total += currentDayData[chain].initialized === true ? 1 : 0
    }
    for (let i = 0; i < Object.keys(dayOldData).length; i++) {
      const chain = Object.keys(dayOldData)[i]
      total += dayOldData[chain].initialized === true ? 1 : 0
    }

    return total === Object.keys(currentDayData).length + Object.keys(dayOldData).length
  }

  function checkChartDataInitialized() {
    let total = 0
    for (let i = 0; i < Object.keys(chartData).length; i++) {
      const chain = Object.keys(chartData)[i]
      total += chartData[chain].initialized === true ? 1 : 0
    }

    return total === Object.keys(chartData).length
  }

  function getChartTextColor() {
    return isDark ? '#FFFFFF' : '#333333'
  }
  function getTickValues() {
    if (state.chartType === 'volume') {
      return [
        6000000, 9000000, 12000000, 15000000, 18000000, 21000000, 24000000, 27000000, 30000000, 33000000, 36000000,
      ]
    }

    return [10000000, 20000000, 30000000, 40000000, 50000000, 60000000, 70000000, 80000000, 90000000]
  }

  function generateToolTip(data: any) {
    return (
      <Section className="smallSection">
        <div className="header">
          <div className="wrapper">
            Date: <div className="value">{moment.unix(Number(data.data.date)).format('MMM DD, YYYY').valueOf()}</div>
          </div>
          <div className="wrapper">
            Total:{' '}
            <div className="value">
              $
              {Math.round(
                Number(data.data[1]) + Number(data.data[40]) + Number(data.data[56]) + Number(data.data[137]),
              ).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="body">
          <div className="wrapper">
            <div className="indicator eth"></div>Ethereum:{' '}
            <div className="value">${Math.round(data.data[1]).toLocaleString()}</div>
          </div>
          <div className="wrapper">
            <div className="indicator telos"></div>Telos:{' '}
            <div className="value">${Math.round(data.data[1]).toLocaleString()}</div>
          </div>
          <div className="wrapper">
            <div className="indicator bnb"></div>BNB:{' '}
            <div className="value">${Math.round(data.data[56]).toLocaleString()}</div>
          </div>
          <div className="wrapper">
            <div className="indicator polygon"></div>Polygon:{' '}
            <div className="value">${Math.round(data.data[137]).toLocaleString()}</div>
          </div>
        </div>
      </Section>
    )
  }
  return (
    <Container>
      <SectionsWrapper>
        <Section className="left-section overviewFrame">
          {checkDatasInitialized() === true && (
            <>
              <div className="figure">
                <Icon name="chart" />
                <Text className="figureValue">
                  {(calculateCurrentFigures('txCount') - calculateOneDayFigures('txCount')).toLocaleString()}
                </Text>
                <Text fontSize="12px">Transactions (24h)</Text>
              </div>
              <div
                className="figure clickable-figure"
                onClick={() =>
                  setState({
                    displayedValue: 0,
                    displayedValueDate: '',
                    chartType: 'liquidity',
                  })
                }
              >
                <Icon name="dollar" />
                <Text className="figureValue">
                  {Math.round(calculateCurrentFigures('totalLiquidityUSD')).toLocaleString()}
                </Text>
                <Text fontSize="12px">Liquidity</Text>
              </div>
              <div
                className="figure clickable-figure"
                onClick={() =>
                  setState({
                    displayedValue: 0,
                    displayedValueDate: '',
                    chartType: 'volume',
                  })
                }
              >
                <Icon name="dollar" />
                <Text className="figureValue">
                  {Math.round(
                    calculateCurrentFigures('totalVolumeUSD') - calculateOneDayFigures('totalVolumeUSD'),
                  ).toLocaleString()}
                </Text>
                <Text fontSize="12px">Volume (24h)</Text>
              </div>
              <div className="figure">
                <Icon name="dollar" />
                <Text className="figureValue">
                  {Math.round(calculate7DayVolume()).toLocaleString()}
                  {/*{Object.keys(state.graphData).length > 0 ? Math.round(calculate7DayVolume()).toLocaleString() : 0}*/}
                </Text>
                <Text fontSize="12px">Volume (7d)</Text>
              </div>
              <div className="figure">
                <Icon name="dollar" />
                <Text className="figureValue">${(Math.round(calculateFees() * 100) / 100).toLocaleString()}</Text>
                <Text fontSize="12px">Fees (24h)</Text>
              </div>
              <div className="figure">
                <Icon name="chart" />
                <Text className="figureValue">{calculateCurrentFigures('pairCount').toLocaleString()}</Text>
                <Text fontSize="12px">Pairs</Text>
              </div>
              <a href="/farms" className="showcase">
                <img src="/images/info/farms-bg.png" />
              </a>
              <a href="/maximizers" className="showcase">
                <img src="/images/info/maximizers-bg.png" />
              </a>
            </>
          )}
        </Section>

        <Section className="right-section">
          {checkDatasInitialized() === true && (
            <>
              <div className="figure">
                <Icon name="dollar" />
                {state.displayedValueDate ? (
                  <Text className="figureValue">${Math.round(state.displayedValue).toLocaleString()}</Text>
                ) : (
                  <Text className="figureValue">{Math.round(getLiquidity()).toLocaleString()}</Text>
                )}

                <Text fontSize="12px">Liquidity</Text>
              </div>
              <div className="date-selector" onClick={() => UpdateChart(1)}>
                1D
              </div>
              <div className="date-selector" onClick={() => UpdateChart(1)}>
                1W
              </div>
              <div className="date-selector live" onClick={() => UpdateChart(1)}>
                1M
              </div>
              <div className="date-selector" onClick={() => UpdateChart(1)}>
                1Y
              </div>
              <div className="date-selector" onClick={() => UpdateChart(1)}>
                ALL
              </div>
            </>
          )}

          <div className="graphFrame">
            {checkChartDataInitialized() === true ? (
              <ResponsiveBar
                data={state.chartType === 'volume' ? processChartData() : processChartLiquidityData()}
                keys={['1', '56', '137', '40']}
                indexBy="date"
                groupMode="stacked"
                padding={0.3}
                theme={{
                  fontSize: 14,
                  fontFamily: 'Poppins',
                  textColor: getChartTextColor(),
                }}
                colors={getBarColor}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 10,
                  tickRotation: 0,
                  format: (x) =>
                    moment.unix(x).format('DD').valueOf() == '01' ? moment.unix(x).format('MMM').valueOf() : '',
                }}
                axisLeft={null}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                axisTop={null}
                axisRight={{
                  tickValues: getTickValues(),
                  tickSize: 0,
                  tickPadding: -82,
                  tickRotation: 0,
                  legend: '',
                  legendOffset: 0,
                  format: (x) => `$${x.toLocaleString('en-US')}`,
                }}
                enableLabel={false}
                enableGridX={false}
                enableGridY={false}
                animate={false}
                tooltip={(data) => generateToolTip(data)}
                margin={{ top: 0, right: 0, bottom: 25, left: 0 }}
              />
            ) : (
              <div>Loading</div>
            )}
          </div>
        </Section>
      </SectionsWrapper>
    </Container>
  )
}

export default OverallFigures
