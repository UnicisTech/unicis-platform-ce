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
      <div
        style={{ width: '49%' }}
        className="dark:bg-gray-800 ring-1 ring-red-500 shadow shadow-red-500 mt-4 rounded-md p-2"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center justify-between">
            <h4>{t('Team Assessment Analysis')}</h4>
          </div>
        </div>

        <div className="grid w-full gap-4 text-red-500">
          <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-red-500">
            <h1 className="text-center text-sm font-bold">
              Number of Assessment
            </h1>
            <span className="font-sans text-sm font-bold">
              {totalNumberOfAssessment}
            </span>
          </div>
          <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-red-500">
            <h1 className="text-center text-sm font-bold">
              Assessment per country
            </h1>
            <span className="font-sans text-sm font-bold">
              {assessmentFilteredByCountry}
            </span>
          </div>
          <div className="grid grid-cols-2 w-full text-center items-center rounded-md p-1 ring-1 ring-red-500">
            <div className="grid">
              <h1 className="text-center text-sm font-bold">Permit</h1>
              <span className="font-sans text-sm font-bold">
                {perAuthorization}
              </span>
            </div>
            <div className="grid">
              <h1 className="text-center text-sm font-bold">Not Permit</h1>
              <span className="font-sans text-sm font-bold">
                {notPermitAuthorization}
              </span>
            </div>
          </div>
          <div className="w-1/2">
            <CountrySelector countryValue={country} handler={countryHandler} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamAssessmentAnalysis;
