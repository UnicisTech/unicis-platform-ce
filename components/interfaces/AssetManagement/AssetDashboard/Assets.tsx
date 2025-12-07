import React, { useState } from 'react'
import Nodes from './Asset/Nodes'
import { Subscription, Team, User } from '@prisma/client'
import AssetsAnalysis from './AssetAnalysis'
import { useNodes } from '@/hooks/fleets/Nodes/useNodes'
import AssetTaskAnalysis from './AssetTaskAnalysis'
import useCanAccess from '@/hooks/useCanAccess'
import { getCurrentPlan } from '@/lib/subscriptions'
import env from '@/lib/env'
import FleetConnectRequired from '../FleetConnectRequired'

interface Assets {
  team: Team
  user: Partial<User>
  teamSubscription: Subscription
}

const Assets = ({ team, user, teamSubscription }: Assets) => {
  const [status, setStatus] = useState('all')
  const { nodes } = useNodes(team.id, status)
  const { canAccess } = useCanAccess()
  const currentPlan = getCurrentPlan(teamSubscription)

  if (!canAccess('asset_dashboard', ['read', 'create', 'delete', 'update'])) {
    return null
  }

  return (
    <div className='grid gap-8'>
      {currentPlan === env.assetRequiredPlan && (
        <FleetConnectRequired user={user}>
          {({ isAuthenticated }) =>
            isAuthenticated && (
              <>
                <AssetsAnalysis nodes={nodes} team={team} user={user} />
                <AssetTaskAnalysis teamId={team.id} />
                <Nodes
                  nodes={nodes}
                  team={team}
                  user={user}
                  setStatus={setStatus}
                  status={status}
                />
              </>
            )
          }
        </FleetConnectRequired>
      )}
    </div>
  )
}

export default Assets
