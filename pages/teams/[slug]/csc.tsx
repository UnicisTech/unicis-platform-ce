import { Error, Loading } from '@/components/shared';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CscDashboard } from '@/components/interfaces/csc';
import { getTeamAccess } from '@/lib/teams';
import { getTranslationNamespaces } from '@/lib/i18n/getCscTranslationNamespaces';
import type { ISO } from 'types';

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
    return <Error message={t('errors.teamNotFound')} />;
  }

  return <CscDashboard team={team} />;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  const access = await getTeamAccess(req, res, query);

  if (!access) {
    return {
      notFound: true,
    };
  }

  const frameworks = (access.teamProperties?.csc_iso ?? []) as ISO[];
  const cscTranslations = getTranslationNamespaces(frameworks);

  console.log('cscTranslations', cscTranslations)

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, ['common', ...cscTranslations])
        : {}),
    },
  };
}

export default Settings;
