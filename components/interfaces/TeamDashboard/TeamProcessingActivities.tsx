import type { Prisma } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import CountrySelector from './CountrySelector';
import useTeamTasks from 'hooks/useTeamTasks';
import { useCallback, useState } from 'react';

const ProcessingActivitiesAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('translation');
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const [country, setCountry] = useState('');

  let totalTasksWithRpaProcedure = 0;
  let totalEnabledDataTransfers = 0;
  let tasksFilteredByCountry = 0;

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

      const isTargetCountry = (properties.rpa_procedure as any[]).some(
        (procedure) => {
          return (
            procedure.country?.value.toLowerCase() === country.toLowerCase()
          );
        }
      );

      if (isTargetCountry) {
        tasksFilteredByCountry += 1;
      }
    }
  });

  const countryHandler = useCallback(async (value: string) => {
    setCountry(value);
  }, []);

  return (
    <>
      {/* Processing Analysis */}
      <div
        style={{ width: '49%' }}
        className="dark:bg-gray-800 ring-1 ring-red-500 shadow shadow-red-500 mt-4 rounded-md p-2"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center justify-between">
            <h4>{t('Processing Activities')}</h4>
          </div>
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
            <h1 className="text-center text-sm font-bold">
              Number per Country
            </h1>
            <span className="font-sans text-sm font-bold">
              {tasksFilteredByCountry}
            </span>
          </div>
          <div className="w-1/2">
            <CountrySelector countryValue={country} handler={countryHandler} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessingActivitiesAnalysis;
