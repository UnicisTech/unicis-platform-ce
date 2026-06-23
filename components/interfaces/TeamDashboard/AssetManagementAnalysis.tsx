import { useTranslation } from 'next-i18next';
import AssetCard from '@/components/interfaces/AssetManagement/AssetDashboard/AssetCard';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import {
  computePlatformCounts,
  buildPlatformsData,
} from '@/lib/fleet/platformCounts';

/**
 * Asset Management tab content for the team dashboard — total + per-platform
 * host cards, mirroring the cards shown on the full Asset Management page.
 * Only ever mounted once the three-gate check (see useAssetModuleAccess)
 * has confirmed the team can see this tab.
 */
const AssetManagementAnalysis = ({ team }: { team: { id: string } }) => {
  const { t } = useTranslation('fleet');
  const { nodes, isLoading } = useNodes(team.id, 'all');

  const platformCounts = computePlatformCounts(nodes);
  const platformsData = buildPlatformsData(platformCounts);
  const totalAssets = nodes?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t('common:loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <AssetCard host="total" total={totalAssets} />
      {platformsData.map((asset) => (
        <AssetCard
          key={asset.platform}
          host={asset.platform}
          total={asset.total}
        />
      ))}
    </div>
  );
};

export default AssetManagementAnalysis;
