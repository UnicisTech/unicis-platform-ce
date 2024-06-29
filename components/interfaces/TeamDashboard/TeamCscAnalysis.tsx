import { useTranslation } from 'next-i18next';
import PieChart from '../CSC/PieChart';
import RadarChart from '../CSC/RadarChart';
import { useEffect, useState } from 'react';
import useISO from 'hooks/useISO';
import useTeam from 'hooks/useTeam';
import { Loading, Error } from '@/components/shared';

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

const barColors = [
  'rgba(241, 241, 241, 1)',
  'rgba(178, 178, 178, 1)',
  'rgba(255, 0, 0, 1)',
  'rgba(202, 0, 63, 1)',
  'rgba(102, 102, 102, 1)',
  'rgba(255, 190, 0, 1)',
  'rgba(106, 217, 0, 1)',
  'rgba(47, 143, 0, 1)',
];

const ProcessingActivitiesAnalysis = ({
  csc_statuses,
  slug,
}: {
  csc_statuses: { [key: string]: string };
  slug: string;
}) => {
  const { t } = useTranslation('translation');
  const [statuses] = useState(csc_statuses);
  const { isLoading, isError, team } = useTeam(slug as string);
  const { ISO } = useISO(team);

  useEffect(() => {
    console.log('CSC ISO', ISO);
  }, [ISO]);

  if (isLoading || !team || !ISO) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  console.log(statuses);

  return (
    <>
      {/* Cybersecurity Controls */}
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md p-2">
        <div className="flex items-start justify-between mb-2">
          <div className="mb-2 flex items-center justify-between">
            <h4>{t('Cybersecurity Controls Overview')}</h4>
          </div>
          <div className="flex">
            {/* <StatusCscFilter setStatusFilter={setStatusFilter} /> */}
            {/* <ControlSelector controlValue={control} handler={controlHandler} /> */}
          </div>
        </div>
        <div className="mb-4 flex gap-2 items-center dark:bg-gray-800 bg-gray-100 rounded px-2 py-1">
          <h4>Total number of controls</h4>
          <span className="font-sans text-sm font-bold">
            {Object.keys(statuses).length}
          </span>
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
              statuses={statuses}
              barColor={barColors}
              labels={labels}
            />
          </div>
          <div style={{ width: '49%' }} className="stats p-4 stat-value shadow">
            <RadarChart ISO={ISO} statuses={statuses} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessingActivitiesAnalysis;
