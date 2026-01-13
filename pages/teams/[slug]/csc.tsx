import { Error, Loading } from '@/components/shared';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CscDashboard } from '@/components/interfaces/csc';

const Settings = () => {
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

  return <CscDashboard team={team} />;
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  // TODO: define which translations should be added based on csc_iso team prop
  const cscTranslations = [
    'csc/2013',
    'csc/2022',
    'csc/mvps',
    'csc/nistcsfv2',
    'csc/eunis2',
    'csc/gdpr',
    'csc/cisv81',
    'csc/soc2v2',
    'csc/c5_2020',
  ];

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, [
            'common',
            'test',
            ...cscTranslations,
          ])
        : {}),
    },
  };
}

export default Settings;
