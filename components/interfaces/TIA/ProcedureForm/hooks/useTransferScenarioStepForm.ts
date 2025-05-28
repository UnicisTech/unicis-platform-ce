import { useForm } from "react-hook-form";
import type { TiaProcedureInterface } from "types";
import type { TransferScenarioStepValues } from "../types";

export default function useTransferScenarioStepForm(
  procedure: TiaProcedureInterface
) {
  return useForm<TransferScenarioStepValues>({
    defaultValues: {
      DataExporter: procedure[0]?.DataExporter ?? "",
      CountryDataExporter:
        procedure[0]?.CountryDataExporter,
      DataImporter: procedure[0]?.DataImporter ?? "",
      CountryDataImporter:
        procedure[0]?.CountryDataImporter,
      TransferScenario:
        procedure[0]?.TransferScenario ?? "",
      DataAtIssue: procedure[0]?.DataAtIssue ?? "",
      HowDataTransfer: procedure[0]?.HowDataTransfer ?? "",
      StartDateAssessment:
        procedure[0]?.StartDateAssessment ?? new Date().toISOString().slice(0,10),
      AssessmentYears:
        procedure[0]?.AssessmentYears ?? 1,
      LawImporterCountry:
        procedure[0]?.LawImporterCountry,
    },
    mode: "onSubmit",
  });
}