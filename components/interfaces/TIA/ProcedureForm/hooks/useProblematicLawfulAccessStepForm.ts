import { useForm } from "react-hook-form";
import type { TiaProcedureInterface } from "types";
import type { ProblematicLawfulAccessValues } from "../types";

export default function useProblematicLawfulAccessStepForm(
    procedure: TiaProcedureInterface
) {
    const initial = procedure[1] || {};
    return useForm<ProblematicLawfulAccessValues>({
        defaultValues: {
            EncryptionInTransit: initial.EncryptionInTransit ?? 'yes',
            ReasonEncryptionInTransit: initial.ReasonEncryptionInTransit ?? '',
            TransferMechanism: initial.TransferMechanism ?? 'yes',
            ReasonTransferMechanism: initial.ReasonTransferMechanism ?? '',
            LawfulAccess: initial.LawfulAccess ?? 'yes',
            ReasonLawfulAccess: initial.ReasonLawfulAccess ?? '',
            MassSurveillanceTelecommunications:
                initial.MassSurveillanceTelecommunications ?? 'yes',
            ReasonMassSurveillanceTelecommunications:
                initial.ReasonMassSurveillanceTelecommunications ?? '',
            SelfReportingObligations: initial.SelfReportingObligations ?? 'yes',
            ReasonSelfReportingObligations: initial.ReasonSelfReportingObligations ?? '',
        },
        mode: 'onChange',
    });
}
