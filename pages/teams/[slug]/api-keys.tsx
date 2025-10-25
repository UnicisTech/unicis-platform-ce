import APIKeysContainer from '@/components/apiKey/APIKeysContainer';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getTeamFeatures } from '@/lib/subscriptions';

const APIKeys = ({ teamFeatures }) => {
  return <APIKeysContainer teamFeatures={teamFeatures} />;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const teamFeatures = await getTeamFeatures(req, res, query);

  if (!teamFeatures.apiKey) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: teamFeatures,
    },
  };
}

export default APIKeys;
