import { useMemo } from 'react';
import useTeamTasks from 'hooks/useTeamTasks';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import {
  computeRiskMap,
  calculateRiskDistribution,
  calculateRiskRating,
  calculateCurrentRiskRating,
} from '@/lib/rm/helpers';
import { DashboardMatrixChart } from '../risk-management';
import type { TaskProperties, RMProcedureInterface } from 'types';

interface RmAnalysisProps {
  slug: string;
  onCellClick?: (x: number, y: number) => void;
}

// Ordered highest → lowest to match a typical risk dashboard scan order
const RISK_LEVELS: Array<{
  key: string;
  labelKey: string;
  distIdx: number; // index into calculateRiskDistribution result
  dot: string;
  row: string;
  text: string;
  badge: string;
}> = [
  {
    key: 'extreme',
    labelKey: 'risk-level-extreme',
    distIdx: 4,
    dot: '#DC2626',
    row: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:text-red-400',
  },
  {
    key: 'major',
    labelKey: 'risk-level-major',
    distIdx: 3,
    dot: '#D97706',
    row: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'moderate',
    labelKey: 'risk-level-moderate',
    distIdx: 2,
    dot: '#CA8A04',
    row: 'bg-yellow-50',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  {
    key: 'minor',
    labelKey: 'risk-level-minor',
    distIdx: 1,
    dot: '#16A34A',
    row: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700',
  },
  {
    key: 'insignificant',
    labelKey: 'risk-level-insignificant',
    distIdx: 0,
    dot: '#94A3B8',
    row: 'bg-slate-50 dark:bg-slate-900',
    text: 'text-slate-600 dark:text-slate-300',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  },
];

// Map current risk % to one of the 5 level keys (mirrors calculateRiskDistribution buckets)
function severityOf(pct: number): string {
  if (pct >= 80) return 'extreme';
  if (pct >= 60) return 'major';
  if (pct >= 40) return 'moderate';
  if (pct >= 20) return 'minor';
  return 'insignificant';
}

const RmAnalysis = ({ slug, onCellClick }: RmAnalysisProps) => {
  const { tasks, isLoading, isError } = useTeamTasks(slug);
  const { t } = useTranslation('common');

  const { dist, riskMap, topRisks } = useMemo(() => {
    if (!tasks) return { dist: [0, 0, 0, 0, 0], riskMap: null, topRisks: [] };

    const distribution = calculateRiskDistribution(tasks);
    const map = computeRiskMap(tasks);

    const ranked = tasks
      .filter((task) => (task.properties as TaskProperties)?.rm_risk)
      .map((task) => {
        const risk = (task.properties as TaskProperties)
          .rm_risk as RMProcedureInterface;
        const raw = calculateRiskRating(risk[0].RawProbability, risk[0].RawImpact);
        const target = calculateRiskRating(
          risk[1].TreatedProbability,
          risk[1].TreatedImpact
        );
        const current = calculateCurrentRiskRating(raw, target, risk[1].TreatmentStatus);
        return { title: task.title, current };
      })
      .sort((a, b) => b.current - a.current)
      .slice(0, 3);

    return { dist: distribution, riskMap: map, topRisks: ranked };
  }, [tasks]);

  if (isLoading || !tasks) return <Loading />;
  if (isError) return <Error />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Risk distribution + top risks */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-medium text-slate-900 dark:text-slate-100">
            {t('current-risk-rating')}
          </span>
        </div>

        {/* Five severity rows: Extreme → Major → Moderate → Minor → Insignificant */}
        <div className="space-y-1.5 mb-4">
          {RISK_LEVELS.map(({ key, labelKey, distIdx, dot, row, text }) => (
            <div
              key={key}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${row}`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: dot }}
              />
              <span className={`flex-1 text-[12px] font-medium ${text}`}>
                {t(labelKey)}
              </span>
              <span className={`text-[13px] font-medium ${text}`}>
                {dist[distIdx]}
              </span>
            </div>
          ))}
        </div>

        {/* Top open risks */}
        {topRisks.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-2">
              {t('top-open-risks', { defaultValue: 'Top open risks' })}
            </div>
            <div className="divide-y divide-slate-50">
              {topRisks.map(({ title, current }, i) => {
                const level = RISK_LEVELS.find((l) => l.key === severityOf(current))!;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 py-1.5 text-[11px] text-slate-500 dark:text-slate-400"
                  >
                    <span
                      className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${level.badge}`}
                    >
                      {t(level.labelKey)}
                    </span>
                    <span className="line-clamp-2">{title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Risk matrix */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-medium text-slate-900 dark:text-slate-100">
            {t('target-risk-rating')}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Impact → / Likelihood ↑</div>
        <div className="flex items-center justify-center">
          <DashboardMatrixChart
            datasets={[]}
            counterMap={riskMap}
            onCellClick={onCellClick}
          />
        </div>
      </div>
    </div>
  );
};

export default RmAnalysis;
