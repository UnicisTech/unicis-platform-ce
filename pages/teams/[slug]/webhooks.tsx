import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { Webhooks } from '@/components/webhook';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getTeamAccess } from '@/lib/teams';

const WebhookList = ({ teamFeatures }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('errors.teamNotFound')} />;
  }

  return (
    <>
      <TeamTab activeTab="webhooks" team={team} teamFeatures={teamFeatures} />
      <Webhooks team={team} />
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const access = await getTeamAccess(req, res, query);

  if (!access || !access.teamFeatures.webhook) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: access.teamFeatures,
    },
  };
}

export default WebhookList;
