import { useTranslation } from 'next-i18next';
import RiskMatrixDashboardChart from '../PIA/RiskMatrixDashboardChart';
import { computeRiskMap } from '@/lib/pia';
import { piaDashboardConfig } from '@/components/defaultLanding/data/configs/pia';
import { Task } from '@prisma/client';
import { Card } from '@/components/shadcn/ui/card';

interface PiaAnalysisProps {
  tasks: Task[] | undefined;
}

const PiaAnalysis = ({ tasks }: PiaAnalysisProps) => {
  const { t } = useTranslation('common');

  if (!tasks) {
    return null;
  }

  const riskSections = piaDashboardConfig.map(
    ({ id, title, security, probability }) => ({
      id,
      title,
      map: computeRiskMap(tasks, id, { security, probability }),
    })
  );

  return (
    <>
      <div className="mb-4 mx-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t(`pia-overview`)}
        </h2>
      </div>
      <Card>
        <div className="w-full p-4 mx-3">
          <div className="flex flex-col md:flex-row justify-center gap-6 overflow-x-scroll">
            {riskSections.slice(0, 2).map(({ title, id, map }) => (
              <div key={id}>
                <div className="flex-1 text-center text-lg font-semibold">
                  {title}
                </div>
                <div className="flex-1">
                  <RiskMatrixDashboardChart datasets={[]} counterMap={map} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6 overflow-x-scroll">
            {riskSections.slice(2).map(({ title, id, map }) => (
              <div key={id}>
                <div className="flex-1 text-center text-lg font-semibold">
                  {title}
                </div>
                <div className="flex-1">
                  <RiskMatrixDashboardChart datasets={[]} counterMap={map} />
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
