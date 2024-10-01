import AdminPage from '@/components/interfaces/IAP/AdminPage';
import IapDashboard from '@/components/interfaces/IAP/IapDashboard';
import { PendingInvitations } from '@/components/invitation';
import { Error, Loading } from '@/components/shared';
import { Members, TeamTab } from '@/components/team';
import env from '@/lib/env';
import useIap from 'hooks/useIAP';
import useTeam from 'hooks/useTeam';
import useTeams from 'hooks/useTeams';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const IAP = ({ teamFeatures }) => {
    const { t } = useTranslation('common');
    const { isLoading, isError, team, mutateTeam } = useTeam();
    const { categories, teamCourses, isLoading: isIapDataLoading, isError: isIapError, mutateIap } = useIap(team?.slug)
    const { teams, isLoading: isTeamsLoading, isError: isTeamsError } = useTeams()


    console.log('courses', teamCourses)
    console.log('IAP categories', categories)

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
        //TODO: return message
        return <Error message={t('team-not-found')} />;
    }

    return (
        <>
            <TeamTab activeTab="iap/admin" team={team} teamFeatures={teamFeatures} />

            <div className="space-y-6">
                <AdminPage
                    team={team}
                    teams={teams}
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
