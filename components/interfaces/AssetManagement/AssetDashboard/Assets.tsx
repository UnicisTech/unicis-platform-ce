import React, { useState } from 'react'
import Nodes from './Node/Nodes'
import { Team, User } from '@prisma/client'
import AssetsAnalysis from './AssetAnalysis'
import { useNodes } from '@/hooks/fleets/Nodes/useNodes'
import FleetConnectRequired from '../FleetConnectRequired'

interface Assets {
  team: Team,
  user: Partial<User>
}
 

const Assets = ({ team, user }: Assets) => {
  const [status, setStatus] = useState('all');
  
  const { nodes, isLoading, isError } = useNodes(team.id, status);
  
  return (
    <FleetConnectRequired user={user}>
      {({ isAuthenticated, hasRole, logout }) => (
        <div className='gap-4'>
          <AssetsAnalysis nodes={nodes} team={team} user={user}/>
          <Nodes nodes={nodes} team={team} user={user} setStatus={setStatus} status={status} />
        </div>
      )}
    </FleetConnectRequired>
  )
}

export default Assets