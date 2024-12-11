import useTeamTasks from "hooks/useTeamTasks";
import { Error, Loading } from '@/components/shared';
import { riskSecurityPoints, riskProbabilityPoints } from "@/components/defaultLanding/data/configs/pia";
import { TaskProperties } from "types";
import RiskMatrixDashboardChart from "../PIA/RiskMatrixDashboardChart";
import { Task } from "@prisma/client";

interface PiaAnalysisProps {
    slug: string;
}

const PiaAnalysis = ({ slug }: PiaAnalysisProps) => {
    const { tasks, isLoading, isError } = useTeamTasks(slug as string);

    const computeRiskMap = (tasks: Task[], riskKey: number): Map<string, number> | null => {
        if (!tasks) return null;
    
        // Map the riskKey to property names
        const riskKeyMap = {
            1: { security: "confidentialityRiskSecurity", probability: "confidentialityRiskProbability" },
            2: { security: "availabilityRiskSecurity", probability: "availabilityRiskProbability" },
            3: { security: "transparencyRiskSecurity", probability: "transparencyRiskProbability" },
        };
    
        const riskMap = new Map<string, number>();
    
        tasks
            .filter(task => (task.properties as TaskProperties)?.pia_risk)
            .map(task => (task.properties as TaskProperties)?.pia_risk)
            .forEach((risk) => {
                const security = risk?.[riskKey]?.[riskKeyMap[riskKey].security];
                const probability = risk?.[riskKey]?.[riskKeyMap[riskKey].probability];
    
                if (!security || !probability) return;
    
                const x = riskSecurityPoints[security];
                const y = riskProbabilityPoints[probability];
                const key = `${x},${y}`;
    
                riskMap.set(key, (riskMap.get(key) || 0) + 1);
            });
    
        return riskMap;
    };

    if (isLoading || !tasks) {
        return <Loading />;
    }

    if (isError) {
        return <Error />;
    }

    const confidentialityRisksMap = computeRiskMap(tasks, 1);
    const availabilityRisksMap = computeRiskMap(tasks, 2);
    const transparencyRisksMap = computeRiskMap(tasks, 3);

    return (
        <div style={{ width: '100%', margin: '0px 13px' }} className="p-4 shadow">
            <p>a) Confidentiality and Integrity</p>
            <RiskMatrixDashboardChart datasets={[]} counterMap={confidentialityRisksMap} />

            <p>b) Availability</p>
            <RiskMatrixDashboardChart datasets={[]} counterMap={availabilityRisksMap} />

            <p>c) Transparency, purpose limitation and data minimization</p>
            <RiskMatrixDashboardChart datasets={[]} counterMap={transparencyRisksMap} />
        </div>
    );
};

export default PiaAnalysis;
