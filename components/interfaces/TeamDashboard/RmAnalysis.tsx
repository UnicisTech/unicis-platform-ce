import useTeamTasks from "hooks/useTeamTasks";
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import { computeRiskMap, calculateRiskDistribution } from "@/lib/rm";
import { DashboardMatrixChart, DashboardPieChart } from "../RiskManagement";

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

    const riskMap = computeRiskMap(tasks)

    return (
        <>
            <h4>{t('rm-overview')}</h4>

            <div style={{ width: '100%'}}>
                <div className="w-full p-4 shadow-lg mx-3">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between gap-4">
                            <div className="flex-1 text-center text-lg font-semibold">
                                {t('current-risk-rating')}
                            </div>
                            <div className="flex-1 text-center text-lg font-semibold">
                                {t('target-risk-rating')}
                            </div>
                        </div>
                        <div className="flex justify-between gap-4">
                            <div className="flex-1 relative">
                                <DashboardPieChart
                                    datasets={calculateRiskDistribution(tasks)}
                                />
                            </div>
                            <div className="flex-1 relative">
                                <DashboardMatrixChart datasets={[]} counterMap={riskMap} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RmAnalysis;
