import { useRef } from "react";
import useTeamTasks from "hooks/useTeamTasks";
import { useTranslation } from 'next-i18next';
import { Error, Loading } from "@/components/shared";
import { riskSecurityPoints, riskProbabilityPoints } from "@/components/defaultLanding/data/configs/pia";
import RiskMatrixDashboardChart from "../PIA/RiskMatrixDashboardChart";
import { Task } from "@prisma/client";
import { TaskProperties } from "types";

interface PiaAnalysisProps {
    slug: string;
}

const riskKeyMap = {
    1: { security: "confidentialityRiskSecurity", probability: "confidentialityRiskProbability" },
    2: { security: "availabilityRiskSecurity", probability: "availabilityRiskProbability" },
    3: { security: "transparencyRiskSecurity", probability: "transparencyRiskProbability" },
};

const computeRiskMap = (tasks: Task[], riskKey: number): Map<string, number> | null => {
    if (!tasks) return null;

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

const PiaAnalysis = ({ slug }: PiaAnalysisProps) => {
    const { t } = useTranslation('translation');
    const { tasks, isLoading, isError } = useTeamTasks(slug as string);
    const containerRef = useRef<HTMLDivElement>(null);

    if (isLoading) return <Loading />;
    if (isError || !tasks) return <Error />;

    const confidentialityRisksMap = computeRiskMap(tasks, 1);
    const availabilityRisksMap = computeRiskMap(tasks, 2);
    const transparencyRisksMap = computeRiskMap(tasks, 3);

    const riskSections = [
        { title: "Confidentiality and Integrity", map: confidentialityRisksMap },
        { title: "Availability", map: availabilityRisksMap },
        { title: "Transparency, purpose limitation and data minimization", map: transparencyRisksMap },
    ];

    return (
        <>
            <h4>{t('pia-overview')}</h4>
            <div
                ref={containerRef}
                className="w-full p-4 shadow-lg mx-3"
            >
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between gap-4">
                        {riskSections.map(({ title }, index) => (
                            <div key={index} className="flex-1 text-center text-lg font-semibold">
                                {title}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between gap-4">
                        {riskSections.map(({ map }, index) => (
                            <div key={index} className="flex-1">
                                <RiskMatrixDashboardChart datasets={[]} counterMap={map} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PiaAnalysis;

