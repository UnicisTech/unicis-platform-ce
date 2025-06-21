import useTeamTasks from 'hooks/useTeamTasks';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import { computeRiskMap, calculateRiskDistribution } from '@/lib/rm';
import { DashboardMatrixChart, DashboardPieChart } from '../RiskManagement';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';

interface RmAnalysisProps {
  slug: string;
}

const RmAnalysis = ({ slug }: RmAnalysisProps) => {
  const { tasks, isLoading, isError } = useTeamTasks(slug);
  const { t } = useTranslation('common');

  if (isLoading || !tasks) return <Loading />;
  if (isError) return <Error />;

  const riskMap = computeRiskMap(tasks);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-4 px-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('rm-overview')}
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 px-2">
        <Card className="w-full lg:w-1/2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg font-medium">
              {t('current-risk-rating')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <DashboardPieChart datasets={calculateRiskDistribution(tasks)} />
          </CardContent>
        </Card>

        <Card className="w-full lg:w-1/2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg font-medium">
              {t('target-risk-rating')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <DashboardMatrixChart datasets={[]} counterMap={riskMap} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RmAnalysis;
