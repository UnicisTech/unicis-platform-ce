import React, { useState, useEffect } from 'react';
import Nodes from './Asset/Nodes';
import { Team, User } from '@/generated/client';
import AssetsAnalysis from './AssetAnalysis';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import AssetTaskAnalysis from './AssetTaskAnalysis';
import useCanAccess from '@/hooks/useCanAccess';
import useHasPlan from '@/hooks/useHasPlan';
import { useRouter } from 'next/router';
import FleetConnectRequired from '../FleetConnectRequired';

interface AssetsProps {
  team: Team;
  user: Partial<User>;
}

interface AssetsContentProps {
  team: Team;
  user: Partial<User>;
  isAuditor: boolean;
}

const AssetsContent = ({ team, user, isAuditor }: AssetsContentProps) => {
  const [status, setStatus] = useState('all');
  const { nodes: allNodes } = useNodes(team.id, status, {
    skip: isAuditor,
  });
  const nodes = allNodes || [];

  return (
    <>
      <AssetsAnalysis
        nodes={nodes}
        team={team}
        user={user}
        isAuditor={isAuditor}
      />
      <AssetTaskAnalysis teamId={team.id} isAuditor={isAuditor} />
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
  );
};

const Assets = ({ team, user }: AssetsProps) => {
  const { canAccess } = useCanAccess(team.slug);
  const { hasPlan, checkedHasPlan } = useHasPlan();

  const router = useRouter();
  const enrollmentToken =
    typeof router.query.fleetEnrollToken === 'string'
      ? router.query.fleetEnrollToken
      : undefined;

  const userRole = (user as any).role;
  const isAuditor = userRole === 'AUDITOR';

  useEffect(() => {
    hasPlan(team.slug);
  }, [hasPlan, team.slug]);

  if (!canAccess('asset_dashboard', ['read'])) {
    return null;
  }

  if (checkedHasPlan === undefined) {
    return null;
  }

  return (
    <div className="space-y-4">
      {checkedHasPlan && (
        <FleetConnectRequired
          user={user}
          teamId={team.id}
          enrollmentToken={enrollmentToken}
        >
          {({ isAuthenticated }) =>
            isAuthenticated && (
              <AssetsContent team={team} user={user} isAuditor={isAuditor} />
            )
          }
        </FleetConnectRequired>
      )}
    </div>
  );
};

export default Assets;
