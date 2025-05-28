import { useForm } from "react-hook-form";
import type { PiaRisk } from "types";
import type { AvailabilityStepValues } from "../types";

export default function useAvailabilityStepForm(risk: PiaRisk) {
    return useForm<AvailabilityStepValues>({
        defaultValues: {
            availabilityRiskProbability:
                risk[2]?.availabilityRiskProbability ?? "",
            availabilityRiskSecurity:
                risk[2]?.availabilityRiskSecurity ?? "",
            availabilityAssessment:
                risk[2]?.availabilityAssessment ?? "",
        },
        mode: "onChange",
    });
}