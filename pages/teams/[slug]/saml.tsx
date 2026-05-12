import { Error, Loading } from '@/components/shared';
import SSOConnections from '@/components/team/SSOConnections';
import { TeamTab } from '@/components/team';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import { getTeamAccess } from '@/lib/teams';

const TeamSSO = ({ teamFeatures, SPConfigURL }) => {
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
      <TeamTab activeTab="saml" team={team} teamFeatures={teamFeatures} />
      <SSOConnections team={team} spMetadataUrl={SPConfigURL} />
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const access = await getTeamAccess(req, res, query);

  if (!access || !access.teamFeatures.sso) {
    return {
      notFound: true,
    };
  }

  const SPConfigURL = env.jackson.selfHosted
    ? `${env.jackson.externalUrl}/.well-known/saml-configuration`
    : '/well-known/saml-configuration';

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: access.teamFeatures,
      SPConfigURL,
    },
  };
}

export default TeamSSO;
