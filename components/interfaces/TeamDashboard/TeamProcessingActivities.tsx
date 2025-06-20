import type { Prisma } from "@prisma/client";
import { useTranslation } from "next-i18next";
import useTeamTasks from "hooks/useTeamTasks";
import { capitalizeCountryName } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/ui/card";
import { Badge } from "@/components/shadcn/ui/badge";

const ProcessingActivitiesAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation("translation");
  const { tasks } = useTeamTasks(slug);

  const countriesSet = new Set<string>();

  let totalTasksWithRpaProcedure = 0;
  let totalEnabledDataTransfers = 0;

  tasks?.forEach((task) => {
    const properties = task.properties as Prisma.JsonObject | null;

    const procedures = properties?.rpa_procedure as any[];
    if (Array.isArray(procedures)) {
      totalTasksWithRpaProcedure += 1;

      const hasEnabledTransfer = procedures.some(
        (proc) => proc.datatransfer === true
      );

      if (hasEnabledTransfer) totalEnabledDataTransfers += 1;

      procedures.forEach((proc) => {
        if (proc.country?.value) {
          countriesSet.add(proc.country.value.toLowerCase());
        }
      });
    }
  });

  const countriesList = Array.from(countriesSet);

  return (
    <Card className="w-full shadow-sm mr-4">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          {t("Records of Processing Activities")}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex flex-col items-center gap-1 rounded-md border p-3">
          <p className="text-sm font-medium">Number of records</p>
          <span className="text-lg font-bold">{totalTasksWithRpaProcedure}</span>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-md border p-3">
          <p className="text-sm font-medium">Enabled data transfer</p>
          <span className="text-lg font-bold">{totalEnabledDataTransfers}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-md border p-3">
          <p className="text-sm font-medium">Processes per Country</p>
          <div className="flex flex-wrap justify-center gap-2">
            {countriesList.length > 0 ? (
              countriesList.map((country, index) => (
                <Badge key={index} variant="secondary">
                  {capitalizeCountryName(country)}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No country</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingActivitiesAnalysis;
