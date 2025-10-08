// import AdminPage from '@/components/interfaces/IAP/admin/AdminPage';
import { AdminPage } from '@/components/interfaces/IAP';
import { useRouter } from 'next/router';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import useIap from 'hooks/useIAP';
import useTeam from 'hooks/useTeam';
import useTeamMembers from 'hooks/useTeamMembers';
import useTeams from 'hooks/useTeams';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Role } from '@prisma/client';
import useCanAccess from 'hooks/useCanAccess';

const IAP = ({ teamFeatures }) => {
  const { canAccess } = useCanAccess();
  const router = useRouter();
  const { slug } = router.query;

  const { t } = useTranslation('common');
  const { isLoading: isTeamLoading, isError: isTeamError, team } = useTeam();
  const {
    categories,
    teamCourses,
    isLoading: isIapDataLoading,
    isError: isIapError,
    mutateIap,
  } = useIap(true, team?.slug);
  const {
    teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useTeams();
  const {
    members,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useTeamMembers(slug as string);

  const isLoading =
    isTeamLoading || isIapDataLoading || isTeamsLoading || isMembersLoading;
  const isError = isTeamError || isIapError || isTeamsError | isMembersError;

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    const message =
      isError?.message ||
      isIapError?.message ||
      isTeamsError?.message ||
      isMembersError?.message;
    return <Error message={message} />;
  }

  if (!team || !teams) {
    return <Error message={t('team-not-found')} />;
  }

  if (!teamCourses || !categories || !members) {
    //TODO: return message
    return <Error message={t('team-not-found')} />;
  }

  if (!isLoading && !canAccess('iap_reports', ['read'])) {
    return <Error message={t('forbidden-resource')} />;
  }

  return (
    <>
      <TeamTab activeTab="iap/admin" team={team} teamFeatures={teamFeatures} />

      <div className="space-y-6">
        <AdminPage
          team={team}
          teams={teams}
          members={members.filter(({ role }) => role !== Role.AUDITOR)}
          teamCourses={teamCourses}
          categories={categories}
          mutateIap={mutateIap}
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
      teamFeatures: env.teamFeatures,
    },
  };
}

export default IAP;
