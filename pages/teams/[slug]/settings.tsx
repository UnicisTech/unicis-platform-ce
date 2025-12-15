import { Error, Loading } from '@/components/shared';
import { AccessControl } from '@/components/shared/AccessControl';
import {
  RemoveTeam,
  TeamSettings,
  TeamTab,
  CSCSettings,
} from '@/components/team';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getTeamFeatures } from '@/lib/subscriptions';

const Settings = ({ teamFeatures }) => {
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
      <TeamTab activeTab="settings" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <TeamSettings team={team} />
        <CSCSettings team={team} />
        <AccessControl resource="team" actions={['delete']}>
          <RemoveTeam team={team} />
        </AccessControl>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const teamFeatures = await getTeamFeatures(req, res, query);

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: teamFeatures,
    },
  };
}

export default Settings;
