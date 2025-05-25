import { useForm } from "react-hook-form";
import type { PiaRisk } from "types";
import type { CorrectiveMeasuresStepValues } from "../types";

export default function useCorrectiveMeasuresStepForm(risk: PiaRisk) {
    return useForm<CorrectiveMeasuresStepValues>({
        defaultValues: {
            guarantees: risk[4]?.guarantees ?? "",
            securityMeasures: risk[4]?.securityMeasures ?? "",
            securityCompliance: risk[4]?.securityCompliance ?? "",
            dealingWithResidualRisk: risk[4]?.dealingWithResidualRisk ?? "",
            dealingWithResidualRiskAssessment: risk[4]?.dealingWithResidualRiskAssessment ?? "",
            supervisoryAuthorityInvolvement: risk[4]?.supervisoryAuthorityInvolvement ?? "",
        },
        mode: "onChange",
    });
}