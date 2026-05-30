import React, { useState, useEffect } from 'react'
import Nodes from './Asset/Nodes'
import { Team, User } from '@/generated/client'
import AssetsAnalysis from './AssetAnalysis'
import { useNodes } from '@/hooks/fleets/Nodes/useNodes'
import AssetTaskAnalysis from './AssetTaskAnalysis'
import useCanAccess from '@/hooks/useCanAccess'
import useHasPlan from '@/hooks/useHasPlan'
import { useRouter } from 'next/router';
import FleetConnectRequired from '../FleetConnectRequired'
import { useVerifyFleetAsses } from '@/hooks/fleets/useVerifyFleetAsses';

interface AssetsProps {
  team: Team
  user: Partial<User>
}

const Assets = ({ team, user }: AssetsProps) => {
  const [status, setStatus] = useState('all')
  const { canAccess } = useCanAccess(team.slug)
  const { hasPlan, checkedHasPlan } = useHasPlan()
  const { access, isLoading: isAccessLoading } = useVerifyFleetAsses();

  const router = useRouter();
  const enrollmentToken =
    typeof router.query.fleetEnrollToken === 'string'
      ? router.query.fleetEnrollToken
      : undefined;

  const userRole = (user as any).role;
  const isAuditor = userRole === 'AUDITOR';
  const isFleetReady =
    !!access?.is_active && !access?.is_expired;
  const shouldSkipNodes =
    isAuditor || !checkedHasPlan || isAccessLoading || !isFleetReady;

  // Auditors don't need nodes data, only statistics
  const { nodes: allNodes } = useNodes(team.id, status, { skip: shouldSkipNodes });

  useEffect(() => {
    hasPlan(team.slug)
  }, [hasPlan, team.slug])

  // Check if user has read access (members have read-only)
  if (!canAccess('asset_dashboard', ['read'])) {
    return null
  }

  // Filter nodes based on user role - Fleet API already filters for members
  const nodes = allNodes || [];

  if (checkedHasPlan === undefined) {
    return null
  }

  return (
    <div className='grid gap-8'>
      {checkedHasPlan && (
        <FleetConnectRequired user={user} teamId={team.id} enrollmentToken={enrollmentToken}>
          {({ isAuthenticated }) =>
            isAuthenticated && (
              <>
                <AssetsAnalysis nodes={nodes} team={team} user={user} isAuditor={isAuditor} />
                <AssetTaskAnalysis teamId={team.id} isAuditor={isAuditor} />
                {/* Auditors cannot see detailed asset list */}
                {!isAuditor && (
                  <Nodes
                    nodes={nodes}
                    team={team}
                    user={user}
                    setStatus={setStatus}
                    status={status}
                  />
                )}
              </>
            )
          }
        </FleetConnectRequired>
      )}
    </div>
  )
}

export default Assets
