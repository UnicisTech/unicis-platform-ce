import { useForm } from "react-hook-form";
import type { PiaRisk } from "types";
import type { ConfidentialityStepValues } from "../types";

export default function useConfidentialityStepForm(risk: PiaRisk) {
    return useForm<ConfidentialityStepValues>({
        defaultValues: {
            confidentialityRiskProbability:
                risk[1]?.confidentialityRiskProbability ?? "",
            confidentialityRiskSecurity:
                risk[1]?.confidentialityRiskSecurity ?? "",
            confidentialityAssessment:
                risk[1]?.confidentialityAssessment ?? "",
        },
        mode: "onChange",
    });
}