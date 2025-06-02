import { useForm } from "react-hook-form";
import type { RpaProcedureInterface } from "types";
import type { RecipientsStepValues } from "../types";

export default function useRecipientsStepForm(
  procedure: RpaProcedureInterface
) {
  const initial = procedure[2] || ({} as RecipientsStepValues);
  return useForm<RecipientsStepValues>({
    defaultValues: {
      recipientType: initial.recipientType ?? { value: "", label: "" },
      recipientdetails: initial.recipientdetails ?? "",
    },
    mode: "onChange",
  });
}
