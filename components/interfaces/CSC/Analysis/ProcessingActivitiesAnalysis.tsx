import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getTeam } from "models/team";
import { ChartBarIcon } from "@heroicons/react/24/solid";

const ProcessingActivitiesAnalysis = () => {
  const router = useRouter();
  const { t } = useTranslation("translation");
  const { slug } = router.query;
  const loading = true;

  return (
    <>
      {/* Processing Analysis */}
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md bg-gray-50 p-2">
        <div className="mb-2 flex items-center justify-between">
          <h4>{t("Processing Activities")}</h4>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-row md:flex lg:flex-row">
       
            <div className="grid w-full grid-cols-3 gap-4">
              <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
                <h1 className="text-center text-sm font-bold">
                  Total number of records
                </h1>
                <span className="font-sans text-sm font-bold">{23}</span>
              </div>
              <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
                <h1 className="text-center text-sm font-bold">
                  Total number of enabled data transfer
                </h1>
                <span className="font-sans text-sm font-bold">{45}</span>
              </div>
              <div className="flex w-full flex-col items-center rounded-md p-1 ring-1 ring-gray-300">
                <h1 className="text-center text-sm font-bold">
                  Total number per Country
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
