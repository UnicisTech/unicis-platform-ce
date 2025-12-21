import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import useTeamTasks from 'hooks/useTeamTasks';
import type { TaskProperties } from 'types';
import { capitalizeCountryName } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';

const ProcessingActivitiesAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('common');
  const { tasks } = useTeamTasks(slug);

  const { totalTasksWithRpaProcedure, totalEnabledDataTransfers, countriesList } = useMemo(() => {
    let withProcedure = 0;
    let enabledTransfers = 0;
    const countries = new Set<string>();

    for (const task of tasks ?? []) {
      const props = task.properties as unknown as TaskProperties | null | undefined;
      const proc = props?.rpa_procedure;

      if (!Array.isArray(proc)) continue;

      withProcedure += 1;

      const transferSection = proc[3];
      if (transferSection && typeof transferSection === 'object') {
        if ((transferSection as any).datatransfer === true) enabledTransfers += 1;

        const countryValue = (transferSection as any).country?.value;
        if (typeof countryValue === 'string' && countryValue.trim()) {
          countries.add(countryValue.trim().toLowerCase());
        }
      }
    }

    const list = Array.from(countries).sort((a, b) => a.localeCompare(b));

    return {
      totalTasksWithRpaProcedure: withProcedure,
      totalEnabledDataTransfers: enabledTransfers,
      countriesList: list,
    };
  }, [tasks]);

  return (
    <Card className="w-full shadow-sm mr-4">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          {t('rpa-records-activities')}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex flex-col items-center gap-1 rounded-md border p-3">
          <p className="text-sm font-medium">{t('number-of-records')}</p>
          <span className="text-lg font-bold">{totalTasksWithRpaProcedure}</span>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-md border p-3">
          <p className="text-sm font-medium">{t('enabled-data-transfer')}</p>
          <span className="text-lg font-bold">{totalEnabledDataTransfers}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-md border p-3">
          <p className="text-sm font-medium">{t('processes-per-country')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {countriesList.length > 0 ? (
              countriesList.map((country) => (
                <Badge key={country} variant="secondary">
                  {capitalizeCountryName(country)}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">{t('no-country')}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingActivitiesAnalysis;
