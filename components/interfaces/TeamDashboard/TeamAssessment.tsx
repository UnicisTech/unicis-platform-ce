import { useTranslation } from 'next-i18next';
import { Prisma } from '@prisma/client';
import useTeamTasks from 'hooks/useTeamTasks';
import { capitalizeCountryName } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';

const TeamAssessmentAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('translation');
  const { tasks } = useTeamTasks(slug);

  const countriesSet = new Set<string>();
  let totalNumberOfAssessment = 0;
  let perAuthorization = 0;
  let notPermitAuthorization = 0;

  tasks?.forEach((task) => {
    const properties = task.properties as Prisma.JsonObject | null;
    const procedures = properties?.tia_procedure as any[];

    if (Array.isArray(procedures)) {
      totalNumberOfAssessment += 1;

      procedures.forEach((proc) => {
        if (proc.CountryDataImporter?.value) {
          countriesSet.add(proc.CountryDataImporter.value.toLowerCase());
        }
      });

      const isAuthorized = procedures.some(
        (proc) => proc.TransferMechanism === 'yes'
      );

      isAuthorized ? perAuthorization++ : notPermitAuthorization++;
    }
  });

  const countriesList = Array.from(countriesSet);

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          {t('Transfer Impact Assessment')}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex flex-col items-center gap-1 rounded-md border p-3">
          <p className="text-sm font-medium">Number of Assessments</p>
          <span className="text-lg font-bold">{totalNumberOfAssessment}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-md border p-3">
            <p className="text-sm font-medium">Permit</p>
            <span className="text-lg font-bold">{perAuthorization}</span>
          </div>
          <div className="flex flex-col items-center rounded-md border p-3">
            <p className="text-sm font-medium">Not Permit</p>
            <span className="text-lg font-bold">{notPermitAuthorization}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-md border p-3">
          <p className="text-sm font-medium">Assessment per Country</p>
          <div className="flex flex-wrap justify-center gap-2">
            {countriesList.length > 0 ? (
              countriesList.map((country, idx) => (
                <Badge key={idx} variant="secondary">
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

export default TeamAssessmentAnalysis;
