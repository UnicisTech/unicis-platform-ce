import AssetCard from '@/components/interfaces/AssetManagement/AssetDashboard/AssetCard';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Team, User } from '@/generated/client';
import AssetPieChart from './AssetPieChart';
import { defaultLabels } from '@/lib/fleet/constants';
import { Node } from '@/types';
import { useAuditorStats } from '@/hooks/fleets/distributors/useAuditorStats';

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

// Map technical platform names to user-friendly names
// Note: osquery on macOS always reports 'darwin' as the build_platform (Darwin is the kernel/OS foundation of macOS)
const normalizePlatformName = (platform: string): string => {
  const normalized = platform.toLowerCase();
  if (normalized === 'darwin') return 'macos';
  return normalized;
};

// Map platform keys to display names with proper casing
const getPlatformDisplayName = (platform: string): string => {
  const displayNames: { [key: string]: string } = {
    windows: 'Windows',
    linux: 'Linux',
    macos: 'macOS',
  };
  return (
    displayNames[platform.toLowerCase()] ||
    platform.charAt(0).toUpperCase() + platform.slice(1)
  );
};

const AssetsAnalysis = ({ team, user: _user, nodes, isAuditor }: Assets) => {
  const { t } = useTranslation('common');
  const { auditorStats, isLoading } = useAuditorStats(team.id);

  // For auditors, use platform_counts from auditorStats instead of nodes
  const platformCounts: { [key: string]: number } =
    isAuditor && auditorStats
      ? auditorStats.platform_counts || {}
      : nodes?.reduce((acc: { [key: string]: number }, node) => {
          const rawPlatform =
            node.node_info?.osquery_info.build_platform?.toLowerCase();
          if (rawPlatform && node.is_active) {
            const platform = normalizePlatformName(rawPlatform);
            acc[platform] = (acc[platform] || 0) + 1;
          }
          return acc;
        }, {}) || {};

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

  const labels = Array.from(
    new Set([
      ...defaultLabels,
      ...Object.keys(platformCounts).map((key) => getPlatformDisplayName(key)),
    ])
  );

  const platformsData = labels.map((platform) => ({
    platform: platform.toLowerCase(),
    total: platformCounts[platform.toLowerCase()] || 0,
  }));

  // const platformsData = Object.entries(platformCounts).map(([platform, total]) => ({ //TODO I createt this two use this if prefired
  //   platform,
  //   total
  // }));

  const barColors = labels.map((label) => {
    const platformKey = label.toLowerCase();
    return platformColors[platformKey] || 'rgb(200, 200, 200)';
  });

  const hostData = labels.map((label) => {
    const platformKey = label.toLowerCase();
    return platformCounts[platformKey] || 0;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 h-[320px] sm:h-[360px]">
        <AssetPieChart
          hostData={hostData}
          barColor={barColors}
          labels={labels}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
        {platformsData.map((asset, index) => (
          <AssetCard key={index} host={asset.platform} total={asset.total} />
        ))}
      </div>
    </div>
  );
};

export default AssetsAnalysis;
