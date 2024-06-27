import { useTranslation } from 'next-i18next';
import { Prisma } from '@prisma/client';
import useTeamTasks from 'hooks/useTeamTasks';
import { capitalizeCountryName } from '@/lib/utils';

const TeamAssessmentAnalysis = ({ slug }: { slug: string }) => {
  const { t } = useTranslation('translation');
  const { tasks } = useTeamTasks(slug as string);

  const countriesSet = new Set<string>();

  let totalNumberOfAssessment = 0;
  let perAuthorization = 0;
  let notPermitAuthorization = 0;

  tasks?.forEach((task) => {
    const properties = task.properties as Prisma.JsonObject | null;
    console.log(properties);

    if (properties && Array.isArray(properties.tia_procedure as any)) {
      totalNumberOfAssessment += 1;

      (properties.tia_procedure as any[]).some((procedure) => {
        if (procedure.CountryDataImporter?.value) {
          const countryName = procedure.CountryDataImporter.value;
          if (!Array.from(countriesSet).includes(countryName)) {
            countriesSet.add(countryName);
          }
        }
      });

      const isAuthorized = (properties.tia_procedure as any[]).some(
        (procedure) => {
          return procedure.TransferMechanism === 'yes';
        }
      );

      if (isAuthorized) {
        perAuthorization += 1;
      } else {
        notPermitAuthorization += 1;
      }
    }
  });

  const countriesList = Array.from(countriesSet);

  return (
    <>
      {/* Assessment Analysis */}
      <div
        style={{ width: '49%' }}
        className="dark:bg-gray-800 shadow mt-4 rounded-md p-2"
      >
        <div className="flex mb-2 font-extrabold items-center justify-center">
          <h4>{t('Transfer Impact Assessment')}</h4>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
            <h1 className="text-center text-sm font-bold">
              Number of Assessment
            </h1>
            <span className="font-sans text-sm font-bold">
              {totalNumberOfAssessment}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center items-center">
            <div className="grid rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">Permit</h1>
              <span className="font-sans text-sm font-bold">
                {perAuthorization}
              </span>
            </div>
            <div className="grid rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">Not Permit</h1>
              <span className="font-sans text-sm font-bold">
                {notPermitAuthorization}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
            <h1 className="text-center text-sm mb-1 font-bold">
              Assessment per country
            </h1>
            <div className="flex flex-wrap gap-2 justify-center font-sans text-sm font-bold">
              {countriesList.length > 0 ? (
                <>
                  {countriesList.map((data, index) => (
                    <div key={index} className="">
                      <p className="ring-1 ring-gray-500 py-0.5 px-1 text-xs rounded">
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

export default TeamAssessmentAnalysis;
