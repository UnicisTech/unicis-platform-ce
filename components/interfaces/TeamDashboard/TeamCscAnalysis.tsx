import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import useISO from 'hooks/useISO';
import { Loading } from '@/components/shared';
import type { Team } from 'types';
import type { ISO } from 'types';
import useCscStatuses from 'hooks/useCscStatuses';
import CscTabs from '../csc/CscTabs';
import CscChartsLayout from '../csc/CscChartsLayout';
import { KpiStrip, KpiCard } from './KpiStrip';

const STATUS_WEIGHT: Record<string, number> = {
  'unknown': -1,
  'not-applicable': -1,
  'not-performed': 0,
  'performed-informally': 25,
  'planned': 50,
  'well-defined': 75,
  'quantitatively-controlled': 90,
  'continuously-improving': 100,
};

function computeComplianceScore(statuses: Record<string, string>): number {
  const values = Object.values(statuses)
    .map((s) => STATUS_WEIGHT[s] ?? -1)
    .filter((v) => v >= 0);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function countGaps(statuses: Record<string, string>): number {
  return Object.values(statuses).filter(
    (s) => s === 'not-performed' || s === 'unknown'
  ).length;
}

const TeamCscAnalysis = ({
  slug,
  cscFrameworks,
}: {
  slug: string;
  cscFrameworks: ISO[];
}) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<ISO>(cscFrameworks[0]);
  const { statuses } = useCscStatuses(slug, activeTab);

  const score = useMemo(() => computeComplianceScore(statuses || {}), [statuses]);
  const gapCount = useMemo(() => countGaps(statuses || {}), [statuses]);

  // V1: flat sparkline using current score for all 6 data points.
  // Replace with real monthly snapshots once historical data is stored.
  const sparklineData = useMemo(() => Array(6).fill(score), [score]);

  const scoreSubColour = score >= 80 ? 'green' : score >= 40 ? 'amber' : 'red';

  if (!statuses) {
    return <Loading />;
  }
  return (
    <div className="mx-auto mt-4 w-full max-w-7xl rounded-md">
      <div className="mb-4 mx-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('cybersecurity-controls-overview')}
        </h2>
      </div>

      <div className="mx-4 mb-4">
        <KpiStrip>
          <KpiCard
            label={t('kpi.compliance-score')}
            value={`${score}%`}
            sub={t('kpi.based-on-controls')}
            subColour={scoreSubColour}
            icon={ShieldCheck}
            sparkline={sparklineData}
            sparklineColour={
              score >= 80
                ? 'text-ub-green'
                : score >= 40
                  ? 'text-ub-amber'
                  : 'text-ub-red'
            }
          />
          <KpiCard
            label={t('kpi.csc-gaps')}
            value={gapCount}
            sub={t('kpi.controls-not-performed')}
            subColour={gapCount === 0 ? 'green' : gapCount < 10 ? 'amber' : 'red'}
            icon={Lock}
          />
        </KpiStrip>
      </div>

      <CscTabs
        frameworks={cscFrameworks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showMatrixMapping={false}
      />
      <CscChartsLayout statuses={statuses} iso={activeTab} />
    </div>
  );
};

//TODO: remake
const WithISO = ({ team }: { team: Team }) => {
  const { ISO } = useISO(team);

  if (!ISO) {
    return <Loading />;
  }

  return <TeamCscAnalysis slug={team.slug} cscFrameworks={ISO} />;
};

export default WithISO;
