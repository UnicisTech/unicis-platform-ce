import React, { useState } from 'react'
import Nodes from './Node/Nodes'
import { Team, User } from '@prisma/client'
import AssetsAnalysis from './AssetAnalysis'
import { WithLoadingAndError } from '@/components/shared'
import { useNodes } from '@/hooks/fleets/Nodes/useNodes'

interface Assets {
  team: Team,
  user: Partial<User>
}
 

const Assets = ({ team, user }: Assets) => {
  const [status, setStatus] = useState('all');
  
  const { nodes, isLoading, isError } = useNodes(team.fleetTeamId!, user?.fleetAccessPhrase!, status);
  
  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className='gap-4'>
        <AssetsAnalysis nodes={nodes} team={team} user={user}/>
        <Nodes nodes={nodes} team={team} user={user} setStatus={setStatus} status={status} />
      </div>
    </WithLoadingAndError>
  )
}

export default Assets