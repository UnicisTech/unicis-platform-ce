import FleetAPIKeysContainer from '@/components/apiKey/FleetAPIKeysContainer';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';

const FleetAPIKeys = ({ teamFeatures }) => {
  return <FleetAPIKeysContainer teamFeatures={teamFeatures} />;
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.fleetApiKey) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default FleetAPIKeys;
