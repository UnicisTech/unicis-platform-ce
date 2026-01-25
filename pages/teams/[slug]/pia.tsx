import type { NextPageWithLayout } from 'types';
import type { InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import Dashboard from '@/components/interfaces/pia/Dashboard';

const RiskManagement: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return <Dashboard />;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common', 'pia']) : {}),
    },
  };
};

export default RiskManagement;
