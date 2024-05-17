import useTasks from "hooks/useTasks";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import CountrySelector from "./CountrySelector";
import { Task } from "@prisma/client";


const TeamAssessmentAnalysis = () => {
  const router = useRouter();
  const { t } = useTranslation('translation');

  return (
    <>
      {/* Assessment Analysis */}
      <div className="mx-auto bg-gray-800 mt-4 w-full max-w-7xl rounded-md p-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center justify-between">
            <h4>{t('Team Assessment Analysis')}</h4>
          </div>
          <div className="w-1/5">
            <CountrySelector countryValue={''} handler={async () => {}} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-row md:flex lg:flex-row">
          <div className="grid w-full grid-cols-3 gap-4">
            <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">
                Total number of Assessment
              </h1>
              <span className="font-sans text-sm font-bold">{23}</span>
            </div>
            <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">
                Total number of assessment per country
              </h1>
              <span className="font-sans text-sm font-bold">{45}</span>
            </div>
            <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
              <h1 className="text-center text-sm font-bold">
                Number per authorizations
              </h1>
              <span className="font-sans text-sm font-bold">{3}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamAssessmentAnalysis;
