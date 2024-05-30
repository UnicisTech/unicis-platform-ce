import type { Prisma } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import useTeamTasks from 'hooks/useTeamTasks';
import { useCallback, useState } from 'react';
import { capitalizeCountryName } from '@/lib/utils';

const ProcessingActivitiesAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('translation');
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const [country, setCountry] = useState('');

  const countriesSet = new Set<string>();

  let totalTasksWithRpaProcedure = 0;
  let totalEnabledDataTransfers = 0;

  tasks?.forEach((task) => {
    const properties = task.properties as Prisma.JsonObject | null;

    if (properties && Array.isArray(properties.rpa_procedure as any)) {
      totalTasksWithRpaProcedure += 1;

      const hasEnabledDataTransfer = (properties.rpa_procedure as any[]).some(
        (procedure) => {
          return procedure.datatransfer === true;
        }
      );

      if (hasEnabledDataTransfer) {
        totalEnabledDataTransfers += 1;
      }

      (properties.rpa_procedure as any[]).some((procedure) => {
        if (procedure.country?.value) {
          const countryName = procedure.country.value.toLowerCase();
          if (!Array.from(countriesSet).includes(countryName)) {
            countriesSet.add(countryName);
          }
        }
      });
    }
  });

  const countriesList = Array.from(countriesSet);

  return (
    <>
      {/* Processing Analysis */}
      <div
        style={{ width: '49%' }}
        className="dark:bg-gray-800 shadow mt-4 rounded-md p-2"
      >
        <div className="flex mb-2 text-red-500 font-extrabold items-center justify-center">
          <h4>{t('Records of Processing Activities')}</h4>
        </div>
        <div className="grid w-full gap-4 text-red-500">
          <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-red-500">
            <h1 className="text-center text-sm font-bold">Number of records</h1>
            <span className="font-sans text-sm font-bold">
              {totalTasksWithRpaProcedure}
            </span>
          </div>
          <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-red-500">
            <h1 className="text-center text-sm font-bold">
              Enabled data transfer
            </h1>
            <span className="font-sans text-sm font-bold">
              {totalEnabledDataTransfers}
            </span>
          </div>
          <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-red-500">
            <h1 className="text-center text-sm mb-1 font-bold">
              Processes per Country
            </h1>
            <div className="flex flex-wrap gap-2 justify-center font-sans text-sm font-bold">
              {countriesList.length > 0 ? (
                <>
                  {countriesList.map((data, index) => (
                    <div key={index}>
                      <p className="ring-1 ring-red-500 py-0.5 px-1 text-xs text-red-700 rounded">
                        {capitalizeCountryName(data)}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <span>No country</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessingActivitiesAnalysis;
