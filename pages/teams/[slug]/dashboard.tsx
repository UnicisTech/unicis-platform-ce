import { PieChart, RadarChart } from '@/components/interfaces/CSC';
import { TeamTaskAnalysis } from '@/components/interfaces/CSC/Analysis';
import ProcessingActivitiesAnalysis from '@/components/interfaces/CSC/Analysis/TeamProcessingActivitiesAnalysis';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import useISO from 'hooks/useISO';
import useTasks from 'hooks/useTasks';
import useTeam from 'hooks/useTeam';
import { getCscStatusesBySlug } from 'models/team';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';

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
]


const TeamDashboard = ({
  teamFeatures,
  csc_statuses,
}: {
  teamFeatures: any;
  csc_statuses: { [key: string]: string };
}) => {
  const { t } = useTranslation('common');
  const { isLoading: teamLoading, isError: teamError, team } = useTeam();
  const [statuses, setStatuses] = useState(csc_statuses);
  const { ISO } = useISO(team);

  console.log(statuses);

  if (teamLoading) {
    return <Loading />;
  }

  if (teamError) {
    return <Error message={teamError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <TeamTab activeTab="dashboard" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <TeamTaskAnalysis />
        <ProcessingActivitiesAnalysis />
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
      csc_statuses: await getCscStatusesBySlug(slug),
    },
  };
}

export default TeamDashboard;
