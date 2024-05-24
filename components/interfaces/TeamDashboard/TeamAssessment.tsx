import useTasks from 'hooks/useTasks';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import CountrySelector from './CountrySelector';
import { Prisma, Task } from '@prisma/client';
import { useCallback, useState } from 'react';
import useTeamTasks from 'hooks/useTeamTasks';

const TeamAssessmentAnalysis = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const { t } = useTranslation('translation');
  const { tasks, mutateTasks } = useTeamTasks(slug as string);
  const [country, setCountry] = useState('');

  let totalNumberOfAssessment = 0;
  let assessmentFilteredByCountry = 0;
  let perAuthorization = 0;
  let notPermitAuthorization = 0;

  tasks?.forEach((task) => {
    const properties = task.properties as Prisma.JsonObject | null;

    if (properties && Array.isArray(properties.tia_procedure as any)) {
      totalNumberOfAssessment += 1;

      const isTargetCountry = (properties.tia_procedure as any[]).some(
        (procedure) => {
          return (
            procedure.CountryDataImporter?.value.toLowerCase() ===
            country.toLowerCase()
          );
        }
      );

      const isAuthorized = (properties.tia_procedure as any[]).some(
        (procedure) => {
          return procedure.TransferMechanism === 'yes';
        }
      );

      if (isTargetCountry) {
        assessmentFilteredByCountry += 1;
      }

      if (isAuthorized) {
        perAuthorization += 1;
      } else {
        notPermitAuthorization += 1;
      }
    }
  });

  const countryHandler = useCallback(async (value: string) => {
    setCountry(value);
  }, []);

  return (
    <>
      {/* Assessment Analysis */}
      <div className="mx-auto bg-gray-50 dark:bg-gray-800 mt-4 w-full max-w-7xl rounded-md p-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center justify-between">
            <h4>{t('Team Assessment Analysis')}</h4>
          </div>
          <div className="w-1/5">
            <CountrySelector countryValue={country} handler={countryHandler} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-row md:flex lg:flex-row">
          <div className="grid w-full grid-cols-3 gap-4">
            <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">
                Total number of Assessment
              </h1>
              <span className="font-sans text-sm font-bold">
                {totalNumberOfAssessment}
              </span>
            </div>
            <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">
                Total number of assessment per country
              </h1>
              <span className="font-sans text-sm font-bold">
                {assessmentFilteredByCountry}
              </span>
            </div>
            <div className="grid grid-cols-2 w-full text-center items-center rounded-md p-1 ring-1 ring-gray-300">
              <div>
                <h1 className="text-center text-sm font-bold">Permit</h1>
                <span className="font-sans text-sm font-bold">
                  {perAuthorization}
                </span>
              </div>
              <div>
                <h1 className="text-center text-sm font-bold">Not Permit</h1>
                <span className="font-sans text-sm font-bold">
                  {notPermitAuthorization}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamAssessmentAnalysis;
