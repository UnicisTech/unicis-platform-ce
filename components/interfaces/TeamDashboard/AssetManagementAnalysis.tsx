import { useTranslation } from 'next-i18next';
import { Layers } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import HeroStatCard from '@/components/shared/HeroStatCard';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import {
  computePlatformCounts,
  buildPlatformsData,
  getPlatformDisplayName,
  platformDotClasses,
} from '@/lib/fleet/platformCounts';

/**
 * Asset Management tab content for the team dashboard — total + per-platform
 * host cards, mirroring the cards shown on the full Asset Management page.
 * Only ever mounted once the three-gate check (see useAssetModuleAccess)
 * has confirmed the team can see this tab.
 */
const AssetManagementAnalysis = ({ team }: { team: { id: string } }) => {
  const { t } = useTranslation(['common', 'fleet']);
  const { nodes, isLoading } = useNodes(team.id, 'all');

  const platformCounts = computePlatformCounts(nodes);
  const platformsData = buildPlatformsData(platformCounts);
  const totalAssets = nodes?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="sm:w-[220px] flex-shrink-0">
        <HeroStatCard
          label={t('fleet:total-assets-label', {
            defaultValue: 'Total Assets',
          })}
          value={totalAssets}
          icon={<Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1">
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
  );
};

export default AssetManagementAnalysis;
