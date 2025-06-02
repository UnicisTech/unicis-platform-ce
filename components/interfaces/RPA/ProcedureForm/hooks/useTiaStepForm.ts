import { useForm } from "react-hook-form";
import type { RpaProcedureInterface } from "types";
import type { TransferStepValues } from "../types";

export default function useTransferStepForm(
    procedure: RpaProcedureInterface
) {
    const initial = procedure[3] || ({} as TransferStepValues);
    return useForm<TransferStepValues>({
        defaultValues: {
            datatransfer: initial.datatransfer ?? false,
            recipient: initial.recipient ?? "",
            country: initial.country ?? { label: "", value: "" },
            guarantee: initial.guarantee ?? [],
        },
        mode: "onChange",
    });
}