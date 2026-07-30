import useCanAccess from 'hooks/useCanAccess';
import useHasPlan from 'hooks/useHasPlan';
import { useEffect } from 'react';
import { useVerifyFleetAsses } from '@/hooks/fleets/useVerifyFleetAsses';

/**
 * Three-gate check for the Asset Management module: RBAC permission, Ultimate
 * plan, and a live (non-expired) Fleet connection. Mirrors the gate used in
 * AssetDashboard/Assets.tsx — kept as a single hook so the sidebar nav item,
 * dashboard domain card, and dashboard tab don't drift out of sync.
 */
export const useAssetModuleAccess = (slug: string) => {
  const { canAccess } = useCanAccess(slug);
  const { hasPlan, checkedHasPlan, checkedPlanSlug } = useHasPlan();
  const { access, isLoading: isAccessLoading } = useVerifyFleetAsses();

  useEffect(() => {
    hasPlan(slug);
  }, [hasPlan, slug]);

  const isFleetReady = !!access?.is_active && !access?.is_expired;
  const canShow = canAccess('asset_dashboard', ['read']);
  const hasCurrentTeamPlan =
    checkedPlanSlug === slug && checkedHasPlan === true;
  const isLoading =
    checkedPlanSlug !== slug || checkedHasPlan === undefined || isAccessLoading;
  const isReady = canShow && hasCurrentTeamPlan && isFleetReady;

  return { isReady, isLoading };
};
