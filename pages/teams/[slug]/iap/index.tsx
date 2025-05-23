import { IapDashboard } from '@/components/interfaces/IAP';
import { Error, Loading } from '@/components/shared';
import useIap from 'hooks/useIAP';
import useTeam from 'hooks/useTeam';
import useTeams from 'hooks/useTeams';
import useCanAccess from 'hooks/useCanAccess';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const IAP = () => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const {
    categories,
    teamCourses,
    isLoading: isIapDataLoading,
    isError: isIapError,
  } = useIap(false, team?.slug);
  const {
    teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useTeams();

  const { canAccess } = useCanAccess();

  if (isLoading || isIapDataLoading || isTeamsLoading) {
    return <Loading />;
  }

  if (!canAccess('iap_course', ['update'])) {
    return <Error message={t('forbidden-resource')} />;
  }

  if (isError || isIapError || isTeamsError) {
    return (
      <Error
        message={
          isError?.message || isIapError?.message || isTeamsError?.message
        }
      />
    );
  }

  if (!team || !teams) {
    return <Error message={t('team-not-found')} />;
  }

  if (!teamCourses || !categories) {
    return <Error message={t('iap-no-data')} />;
  }

  return (
    <>
      <div className="space-y-6">
        <IapDashboard teamCourses={teamCourses} categories={categories} />
      </div>
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default IAP;
