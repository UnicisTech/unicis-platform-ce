import RiskMatrixDashboardChart from '../pia/RiskMatrixDashboardChart';
import { computeRiskMap } from '@/lib/pia';
import { useTranslation } from 'next-i18next';
import type { Task } from 'types';
import { Card } from '@/components/shadcn/ui/card';

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

const PiaAnalysis = ({ tasks, slug, onCellClick }: PiaAnalysisProps) => {
  const { t } = useTranslation('common');

  if (!tasks) {
    return null;
  }

  const riskSections = piaDashboardConfig.map(
    ({ id, titleKey, security, probability }) => ({
      id,
      titleKey,
      map: computeRiskMap(tasks, id, { security, probability }),
    })
  );

  return (
    <>
      <Card>
        <div className="w-full p-4 mx-3">
          <div className="flex flex-col md:flex-row justify-center gap-6 overflow-x-scroll">
            {riskSections.slice(0, 2).map(({ titleKey, id, map }) => (
              <div key={id}>
                <div className="flex-1 text-center text-lg font-semibold">
                  {t(titleKey)}
                </div>
                <div className="flex-1">
                  <RiskMatrixDashboardChart
                    datasets={[]}
                    counterMap={map}
                    onCellClick={
                      onCellClick
                        ? (x, y) => onCellClick(id, x, y)
                        : undefined
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6 overflow-x-scroll">
            {riskSections.slice(2).map(({ titleKey, id, map }) => (
              <div key={id}>
                <div className="flex-1 text-center text-lg font-semibold">
                  {t(titleKey)}
                </div>
                <div className="flex-1">
                  <RiskMatrixDashboardChart
                    datasets={[]}
                    counterMap={map}
                    onCellClick={
                      onCellClick
                        ? (x, y) => onCellClick(id, x, y)
                        : undefined
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
};

export default PiaAnalysis;
