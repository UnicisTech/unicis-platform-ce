import { PieChart, RadarChart } from '@/components/interfaces/CSC';
import ProcessingActivitiesAnalysis from '@/components/interfaces/CSC/Analysis/ProcessingActivitiesAnalysis';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const statusesData = {
  12: 'Well Defined',
  1: 'Quantitatively Controlled',
  2: 'Quantitatively Controlled',
  3: 'Performed Informally',
  21: 'Planned',
};

const TeamDashboard = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <TeamTab activeTab="dashboard" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <div
          style={{
            height: '400px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '10px',
          }}
        >
          <div
            style={{ width: '49%' }}
            className="stats stat-value shadow pl-4 py-4"
          >
            <PieChart statuses={statusesData} />
          </div>
          <div style={{ width: '49%' }} className="stats stat-value shadow">
            <RadarChart ISO={'2013'} statuses={statusesData} />
          </div>
        </div>
        <ProcessingActivitiesAnalysis />
      </div>
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default TeamDashboard;
