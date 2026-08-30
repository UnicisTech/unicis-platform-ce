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
import AddAsset from './Asset/AddAsset';
import { ModuleEmptyState } from '@/components/shared/ModuleEmptyState';
import { Error, Loading, ManagementCard } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { useAuditorStats } from '@/hooks/fleets/distributors/useAuditorStats';

interface AssetsProps {
  team: Team;
  user: Partial<User>;
}

interface AssetsContentProps {
  team: Team;
  user: Partial<User>;
  isAuditor: boolean;
}

const AssetsEmptyState = ({
  team,
  user,
  canAddAsset,
}: {
  team: Team;
  user: Partial<User>;
  canAddAsset: boolean;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const [addVisible, setAddVisible] = useState(false);

  return (
    <>
      <ManagementCard className="flex min-h-[420px] items-center">
        <ModuleEmptyState
          icon="/asset-dashboard.png"
          title={t('fleet:fleet-empty-assets-title')}
          description={t('fleet:fleet-empty-assets-description')}
          ctaLabel={canAddAsset ? t('add-asset') : undefined}
          onCta={canAddAsset ? () => setAddVisible(true) : undefined}
        />
      </ManagementCard>

      {addVisible && (
        <AddAsset
          visible={addVisible}
          user={user}
          team={team}
          setVisible={setAddVisible}
        />
      )}
    </>
  );
};

const AssetsContent = ({ team, user, isAuditor }: AssetsContentProps) => {
  const [status, setStatus] = useState('all');
  const {
    nodes: allNodes,
    isLoading: isNodesLoading,
    isError: nodesError,
  } = useNodes(team.id, status, {
    skip: isAuditor,
  });
  const {
    auditorStats,
    isLoading: isAuditorStatsLoading,
    isError: auditorStatsError,
  } = useAuditorStats(team.id);
  const { canAccess } = useCanAccess(team.slug);
  const nodes = allNodes || [];
  const isAssetsLoading = isAuditor ? isAuditorStatsLoading : isNodesLoading;
  const assetsError = isAuditor ? auditorStatsError : nodesError;
  const totalAssets = isAuditor ? auditorStats?.total_nodes ?? 0 : nodes.length;

  if (isAssetsLoading) {
    return (
      <div className="py-24">
        <Loading />
      </div>
    );
  }

  if (assetsError) {
    return <Error />;
  }

  if (status === 'all' && totalAssets === 0) {
    return (
      <AssetsEmptyState
        team={team}
        user={user}
        canAddAsset={!isAuditor && canAccess('team_fleet_node', ['read'])}
      />
    );
  }

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
