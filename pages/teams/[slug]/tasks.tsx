import type { NextPageWithLayout, ISO } from 'types';
import type { InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import useTeam from 'hooks/useTeam';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { Tasks } from '@/components/interfaces/Task';
import { Error, Loading } from '@/components/shared';
import { getTeamAccess } from '@/lib/teams';
import { getTranslationNamespaces } from '@/lib/i18n/getCscTranslationNamespaces';

const AllTasks: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
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

  return <Tasks team={team} />;
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

  const frameworks = (access.teamProperties?.csc_iso ?? []) as ISO[];
  const cscTranslations = getTranslationNamespaces(frameworks);

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, ['common', ...cscTranslations])
        : {}),
    },
  };
};

export default AllTasks;
