import type { Prisma, Task } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import CountrySelector from './CountrySelector';
import useTeamTasks from 'hooks/useTeamTasks';
import { JSONParser } from 'formidable/parsers';
import { JsonObject } from '@prisma/client/runtime/library';

const ProcessingActivitiesAnalysis = ({
  slug,
}: {
  slug: string;
}) => {
  const { t } = useTranslation('translation');
  const { tasks, mutateTasks } = useTeamTasks(slug as string);

  let totalRpaProcedures = 0;

  tasks?.forEach((task) => {
    const properties = task.properties as Prisma.JsonObject | null;

    if (
      properties &&
      typeof properties === 'object' &&
      Array.isArray(properties.rpa_procedure)
    ) {
      totalRpaProcedures += properties.rpa_procedure.length;
    }
  });

  return (
    <>
      {/* Processing Analysis */}
      <div className="mx-auto bg-gray-800 mt-4 w-full max-w-7xl rounded-md p-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center justify-between">
            <h4>{t('Processing Activities')}</h4>
          </div>
          <div className="w-1/5">
            <CountrySelector countryValue={''} handler={async () => {}} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-row md:flex lg:flex-row">
          <div className="grid w-full grid-cols-3 gap-4">
            <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">
                Total number of records
              </h1>
              <span className="font-sans text-sm font-bold">
                {totalRpaProcedures}
              </span>
            </div>
            <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">
                {totalRpaProcedures}
              </h1>
              <span className="font-sans text-sm font-bold">{45}</span>
            </div>
            <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">
                {totalRpaProcedures}
              </h1>
              <span className="font-sans text-sm font-bold">{3}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessingActivitiesAnalysis;
