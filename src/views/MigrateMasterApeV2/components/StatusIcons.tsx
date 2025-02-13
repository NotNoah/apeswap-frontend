/** @jsxImportSource theme-ui */
import { Flex, Svg, Text } from '@ape.swap/uikit'
import useIsMobile from 'hooks/useIsMobile'
import React from 'react'
import { MigrateLpStatus, MigrateStatus } from 'state/masterApeMigration/types'
import { Spinner } from 'theme-ui'

const StatusIcons: React.FC<{ id: string; migrateLpStatus: MigrateLpStatus[] }> = ({ id, migrateLpStatus }) => {
  const status = migrateLpStatus.find((status) => status.id === id)
  const isMobile = useIsMobile()
  return (
    <Flex
      sx={{
        width: '90px',
        transform: isMobile ? 'translate(-5px, 0px)' : 'translate(-15px, 0px)',
        alignItems: 'center',
      }}
    >
      {status &&
        Object.values(status.status).map((val, i) =>
          val === MigrateStatus.COMPLETE ? (
            <Flex
              sx={{
                width: isMobile ? '15px' : '25px',
                mr: '3px',
                background: 'primaryBright',
                borderRadius: isMobile ? '7.5px' : '12.5px',
              }}
            >
              <Svg icon="success" width="100%" />
            </Flex>
          ) : val === MigrateStatus.INCOMPLETE ? (
            <Flex
              sx={{
                width: isMobile ? '15px' : '25px',
                height: isMobile ? '15px' : '25px',
                mr: '3px',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white4',
                borderRadius: '15px',
              }}
            >
              <Text size={isMobile ? '10px' : '14px'}>{i + 1}</Text>
            </Flex>
          ) : val === MigrateStatus.PENDING ? (
            <Flex sx={{ width: isMobile ? '15px' : '25px', mr: '3px' }}>
              <Spinner width={isMobile ? '15px' : '25px'} height={isMobile ? '15px' : '25px'} />
            </Flex>
          ) : (
            <Flex sx={{ width: isMobile ? '15px' : '25px', mr: '3px' }}>
              <Svg icon="error" width="100%" />
            </Flex>
          ),
        )}
    </Flex>
  )
}

export default React.memo(StatusIcons)
