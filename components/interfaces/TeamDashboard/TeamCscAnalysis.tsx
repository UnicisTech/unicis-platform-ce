import { useTranslation } from 'next-i18next';
import PieChart from '../CSC/PieChart';
import RadarChart from '../CSC/RadarChart';
import { useEffect, useState } from 'react';
import useISO from 'hooks/useISO';
import useTeam from 'hooks/useTeam';
import { Loading, Error } from '@/components/shared';
import { Card } from '@/components/shadcn/ui/card';

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
      <div className="mx-auto mt-4 w-full max-w-7xl rounded-md p-2">
        <div className="mb-4 mx-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t(`Cybersecurity Controls Overview`)}
          </h2>
        </div>
        <Card
          style={{
            height: '400px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '10px',
          }}
        >
          <div style={{ width: '49%' }} className="stats p-4 stat-value">
            <PieChart
              page_name={`dashboard`}
              statuses={statuses}
              barColor={barColors}
              labels={labels}
            />
          </div>
          <div style={{ width: '49%' }} className="stats p-4 stat-value shadow-sm">
            <RadarChart ISO={ISO} statuses={statuses} />
          </div>
        </Card>
      </div>
    </>
  );
};

export default ProcessingActivitiesAnalysis;
