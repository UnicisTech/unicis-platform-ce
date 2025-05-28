import { useForm } from "react-hook-form";
import type { RpaProcedureInterface } from "types";
import type { DescriptionAndStakeholdersStepValues } from "../types";

export default function useDescriptionAndStakeholdersStepForm(
  procedure: RpaProcedureInterface
) {
  const initial = procedure[0] || ({} as DescriptionAndStakeholdersStepValues);
  return useForm<DescriptionAndStakeholdersStepValues>({
    defaultValues: {
      reviewDate:
        initial.reviewDate ?? new Date().toISOString().slice(0, 10),
      controller: initial.controller ?? "",
      dpo: initial.dpo,
    },
    mode: "onChange",
  });
}