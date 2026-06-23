import React from 'react';
import { useTranslation } from 'next-i18next';
import { Layers } from 'lucide-react';
import { Team, User } from '@/generated/client';
import AssetPieChart from './AssetPieChart';
import StatCard from '@/components/shared/StatCard';
import HeroStatCard from '@/components/shared/HeroStatCard';
import { Node } from '@/types';
import { useAuditorStats } from '@/hooks/fleets/distributors/useAuditorStats';
import {
  computePlatformCounts,
  buildPlatformsData,
  getPlatformDisplayName,
  platformDotClasses,
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
  const { t } = useTranslation(['common', 'fleet']);
  const { auditorStats, isLoading } = useAuditorStats(team.id);

  // For auditors, use platform_counts from auditorStats instead of nodes
  const platformCounts: { [key: string]: number } =
    isAuditor && auditorStats
      ? auditorStats.platform_counts || {}
      : computePlatformCounts(nodes);

  // Show loading state for auditors while data is being fetched
  if (isAuditor && isLoading) {
    return (
      <div className="flex items-center justify-center h-[220px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
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
    <div className="flex flex-col xl:flex-row gap-3 mb-3">
      {/* Pie chart card — same shape/size as the Tasks status chart */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 xl:w-[420px] flex-shrink-0">
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          {t('fleet:assets-by-platform', {
            defaultValue: 'Assets by platform',
          })}
        </div>
        <div className="h-[220px]">
          <AssetPieChart
            hostData={hostData}
            barColor={barColors}
            labels={labels}
          />
        </div>
      </div>

      {/* Right column: total card + platform grid */}
      <div className="flex-1 flex flex-col gap-2">
        <HeroStatCard
          label={t('fleet:total-assets-label', {
            defaultValue: 'Total Assets',
          })}
          value={totalAssets}
          icon={<Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
          {platformsData.map((asset) => (
            <StatCard
              key={asset.platform}
              label={getPlatformDisplayName(asset.platform)}
              value={asset.total}
              dotClass={platformDotClasses[asset.platform] || 'bg-slate-300'}
              total={totalAssets}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetsAnalysis;
