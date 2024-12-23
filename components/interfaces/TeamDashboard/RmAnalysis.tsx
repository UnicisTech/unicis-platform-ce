import useTeamTasks from "hooks/useTeamTasks";
import { Error, Loading } from '@/components/shared';
import { RMProcedureInterface, TaskProperties } from "types";
import DashboardChart from "../RiskManagement/DashboardChart";
import { Task } from "@prisma/client";
import { calculateCurrentRiskRating, calculateRiskRating } from "../RiskManagement/RisksTable";
import { DashboardMatrixChart } from "../RiskManagement";

interface PiaAnalysisProps {
    slug: string;
}

function calculateRiskDistribution(tasks: Task[]): number[] {
    const riskCounts = [0, 0, 0, 0, 0];

    tasks.forEach((task) => {
        const risk = (task.properties as TaskProperties).rm_risk as RMProcedureInterface | undefined;
        if (!risk) {
            return
        }
        const rawRiskRating = calculateRiskRating(risk[0].RawProbability, risk[0].RawImpact)
        const targetRiskRating = calculateRiskRating(risk[1].TreatedProbability, risk[1].TreatedImpact)
        const currentRiskRating = calculateCurrentRiskRating(rawRiskRating, targetRiskRating, risk[1].TreatmentStatus)


        if (currentRiskRating >= 0 && currentRiskRating < 20) {
            riskCounts[0] += 1; // 0-20%
        } else if (currentRiskRating >= 20 && currentRiskRating < 40) {
            riskCounts[1] += 1; // 20-40%
        } else if (currentRiskRating >= 40 && currentRiskRating < 60) {
            riskCounts[2] += 1; // 40-60%
        } else if (currentRiskRating >= 60 && currentRiskRating < 80) {
            riskCounts[3] += 1; // 60-80%
        } else if (currentRiskRating >= 80 && currentRiskRating <= 100) {
            riskCounts[4] += 1; // 80-100%
        }
    });

    return riskCounts;
}

function transformToRange(value: number): number {
    return Math.floor(value / 20);
}

const computeRiskMap = (tasks: Task[]): Map<string, number> | null => {
    if (!tasks) return null;

    const riskMap = new Map<string, number>();

    tasks
        .filter(task => (task.properties as TaskProperties)?.rm_risk)
        .map(task => (task.properties as TaskProperties)?.rm_risk)
        .forEach((risk) => {
            const security = risk?.[1]?.["TreatedImpact"] as number;
            const probability = risk?.[1]?.["TreatedProbability"] as number;

            if (!security || !probability) return;

            const x = transformToRange(security);
            const y = transformToRange(probability);

            const key = `${x},${y}`;

            riskMap.set(key, (riskMap.get(key) || 0) + 1);
        });

    return riskMap;
};


const RmAnalysis = ({ slug }: PiaAnalysisProps) => {
    const { tasks, isLoading, isError } = useTeamTasks(slug as string);

    if (isLoading || !tasks) {
        return <Loading />;
    }

    if (isError) {
        return <Error />;
    }

    const riskMap = computeRiskMap(tasks)

    return (
        <div style={{ width: '100%', margin: '0px 13px', justifyContent: 'center', display: 'flex' }} className="p-4 shadow">
            <DashboardChart
                data={calculateRiskDistribution(tasks)}
            />
            <DashboardMatrixChart datasets={[]} counterMap={riskMap}/>
        </div>
    );
};

export default RmAnalysis;
