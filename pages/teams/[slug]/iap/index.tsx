import { IapDashboard } from '@/components/interfaces/IAP';
import { Error, Loading } from '@/components/shared';
import useIap from 'hooks/useIAP';
import useTeam from 'hooks/useTeam';
import useTeams from 'hooks/useTeams';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const IAP = () => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();
  const { categories, teamCourses, isLoading: isIapDataLoading, isError: isIapError } = useIap(team?.slug)
  const { teams, isLoading: isTeamsLoading, isError: isTeamsError } = useTeams()

  if (isLoading || isIapDataLoading || isTeamsLoading) {
    return <Loading />;
  }

  if (isError || isIapError || isTeamsError) {
    return <Error message={isError?.message || isIapError?.message || isTeamsError?.message} />;
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
        <IapDashboard 
          teamCourses={teamCourses} 
          categories={categories} 
        />
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
