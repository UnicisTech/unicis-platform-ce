import type { NextPageWithLayout } from 'types';
import type { InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import Dashboard from '@/components/interfaces/pia/Dashboard';
import { getTeamAccess } from '@/lib/teams';

const RiskManagement: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return <Dashboard />;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, req, res, query }: GetServerSidePropsContext = context;

  const access = await getTeamAccess(req, res, query);

  if (!access) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common', 'pia']) : {}),
    },
  };
};

export default RiskManagement;
