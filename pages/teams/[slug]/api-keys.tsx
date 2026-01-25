import APIKeysContainer from '@/components/apiKey/APIKeysContainer';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getTeamAccess } from '@/lib/teams';

const APIKeys = ({ teamFeatures }) => {
  return <APIKeysContainer teamFeatures={teamFeatures} />;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const access = await getTeamAccess(req, res, query);

  if (!access) {
    return {
      notFound: true,
    };
  }

  if (!access.teamFeatures.apiKey) {
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

export default APIKeys;
