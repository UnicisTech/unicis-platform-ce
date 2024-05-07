import useTasks from "hooks/useTasks";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import PieChart from "../PieChart";
import RadarChart from "../RadarChart";

const statusesData = {
  '12': 'Well Defined',
  '1': 'Quantitatively Controlled',
  2: 'Quantitatively Controlled',
  3: 'Performed Informally',
  21: 'Planned',
};

const labels = [
  'Unknown',
  'Not Applicable',
  'Not Performed',
  'Performed Informally',
  'Planned',
  'Well Defined',
  'Quantitatively Controlled',
  'Continuously Improving',
];

const ProcessingActivitiesAnalysis = ({
  csc_statuses,
  slug,
}: {
  csc_statuses: { [key: string]: string };
  slug: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('translation');

  return (
    <>
      {/* Processing Analysis */}
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md p-2">
        <div className="mb-2 flex items-center justify-between">
          <h4>{t('Cybersecurity Controls')}</h4>
        </div>
        <div
          style={{
            height: '400px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '10px',
          }}
        >
          <div style={{ width: '49%' }} className="stats p-4 stat-value shadow">
            <PieChart
              page_name={`dashboard`}
              statuses={statusesData}
              labels={labels}
            />
          </div>
          <div style={{ width: '49%' }} className="stats p-4 stat-value shadow">
            <RadarChart ISO={'default'} statuses={statusesData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessingActivitiesAnalysis;
