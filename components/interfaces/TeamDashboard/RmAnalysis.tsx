import useTeamTasks from 'hooks/useTeamTasks';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import { computeRiskMap, calculateRiskDistribution } from '@/lib/rm';
import { DashboardMatrixChart, DashboardPieChart } from '../RiskManagement';

interface PiaAnalysisProps {
  slug: string;
}

const RmAnalysis = ({ slug }: PiaAnalysisProps) => {
  const { tasks, isLoading, isError } = useTeamTasks(slug as string);
  const { t } = useTranslation('common');

  if (isLoading || !tasks) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const riskMap = computeRiskMap(tasks);

  return (
    <>
      <h4>{t('rm-overview')}</h4>
      <div className="flex flex-wrap md:flex-nowrap md:flex-row justify-around mb-2 w-full">
        <div className="w-full md:w-[49%] flex flex-col items-center p-4 stat-value shadow">
          <div className="text-center text-lg font-semibold">
            {t('current-risk-rating')}
          </div>
          <div className="flex-grow flex items-center justify-center w-full">
            <DashboardPieChart datasets={calculateRiskDistribution(tasks)} />
          </div>
        </div>
        <div className="w-full md:w-[49%] flex flex-col items-center p-4 stat-value shadow">
          <div className="text-center text-lg font-semibold">
            {t('target-risk-rating')}
          </div>
          <div className="flex-grow flex items-center justify-center w-full">
            <DashboardMatrixChart datasets={[]} counterMap={riskMap} />
          </div>
        </div>
      </div>
    </>
  );
};

export default RmAnalysis;
