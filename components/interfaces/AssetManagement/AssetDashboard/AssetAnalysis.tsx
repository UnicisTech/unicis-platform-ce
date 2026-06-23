import AssetCard from '@/components/interfaces/AssetManagement/AssetDashboard/AssetCard';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Team, User } from '@/generated/client';
import AssetPieChart from './AssetPieChart';
import { Node } from '@/types';
import { useAuditorStats } from '@/hooks/fleets/distributors/useAuditorStats';
import {
  computePlatformCounts,
  buildPlatformsData,
  getPlatformDisplayName,
} from '@/lib/fleet/platformCounts';

interface Assets {
  team: Team;
  user: Partial<User>;
  nodes: Node[];
  isAuditor?: boolean;
}

const platformColors: { [key: string]: string } = {
  windows: 'rgb(0, 181, 255)',
  linux: 'rgb(123, 146, 178)',
  macos: 'rgb(0, 169, 110)',
};

const AssetsAnalysis = ({ team, user: _user, nodes, isAuditor }: Assets) => {
  const { t } = useTranslation('common');
  const { auditorStats, isLoading } = useAuditorStats(team.id);

  // For auditors, use platform_counts from auditorStats instead of nodes
  const platformCounts: { [key: string]: number } =
    isAuditor && auditorStats
      ? auditorStats.platform_counts || {}
      : computePlatformCounts(nodes);

  // Show loading state for auditors while data is being fetched
  if (isAuditor && isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('loading')}
        </div>
      </div>
    );
  }

  const platformsData = buildPlatformsData(platformCounts);
  const labels = platformsData.map((p) => getPlatformDisplayName(p.platform));

  const barColors = platformsData.map(
    (p) => platformColors[p.platform] || 'rgb(200, 200, 200)'
  );

  const hostData = platformsData.map((p) => p.total);

  const totalAssets =
    isAuditor && auditorStats ? auditorStats.total_nodes : nodes?.length || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 h-[320px] sm:h-[360px]">
        <AssetPieChart
          hostData={hostData}
          barColor={barColors}
          labels={labels}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 content-start">
        <AssetCard host="total" total={totalAssets} />
        {platformsData.map((asset, index) => (
          <AssetCard key={index} host={asset.platform} total={asset.total} />
        ))}
      </div>
    </div>
  );
};

export default AssetsAnalysis;
