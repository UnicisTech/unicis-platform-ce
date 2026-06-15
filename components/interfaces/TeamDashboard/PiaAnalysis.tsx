import RiskMatrixDashboardChart from '../pia/RiskMatrixDashboardChart';
import { computeRiskMap } from '@/lib/pia';
import { useTranslation } from 'next-i18next';
import type { Task } from 'types';

interface PiaAnalysisProps {
  tasks: Task[] | undefined;
  slug?: string;
  onCellClick?: (category: number, x: number, y: number) => void;
}

export const piaDashboardConfig = [
  {
    id: 1,
    titleKey: 'confidentiality-and-integrity',
    security: 'confidentialityRiskSecurity',
    probability: 'confidentialityRiskProbability',
  },
  {
    id: 2,
    titleKey: 'availability',
    security: 'availabilityRiskSecurity',
    probability: 'availabilityRiskProbability',
  },
  {
    id: 3,
    titleKey: 'transparency-and-data-minimization',
    security: 'transparencyRiskSecurity',
    probability: 'transparencyRiskProbability',
  },
];

const PiaAnalysis = ({ tasks, onCellClick }: PiaAnalysisProps) => {
  const { t } = useTranslation('common');

  if (!tasks) return null;

  const riskSections = piaDashboardConfig.map(
    ({ id, titleKey, security, probability }) => ({
      id,
      titleKey,
      map: computeRiskMap(tasks, id, { security, probability }),
    })
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {riskSections.map(({ titleKey, id, map }) => (
        <div
          key={id}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-hidden"
        >
          <div className="mb-2">
            <span className="text-[12px] font-medium text-slate-900 dark:text-slate-100 block">
              {t('pia-overview')} · {t(titleKey)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('pia-matrix-axis', {
                defaultValue: 'Impact → / Likelihood ↑',
              })}
            </span>
          </div>
          {/* cellSize=40 → chart width 300px, fits safely inside a 3-col card at ≥1280px */}
          <RiskMatrixDashboardChart
            datasets={[]}
            counterMap={map}
            cellSize={40}
            onCellClick={
              onCellClick ? (x, y) => onCellClick(id, x, y) : undefined
            }
          />
        </div>
      ))}
    </div>
  );
};

export default PiaAnalysis;
