import { useTranslation } from 'next-i18next';
import RiskMatrixDashboardChart from '../PIA/RiskMatrixDashboardChart';
import { computeRiskMap } from '@/lib/pia';
import { piaDashboardConfig } from '@/components/defaultLanding/data/configs/pia';
import { Task } from '@prisma/client';

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
      <h4>{t('pia-overview')}</h4>
      <div className="w-full p-4 shadow-lg mx-3">
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
    </>
  );
};

export default PiaAnalysis;
