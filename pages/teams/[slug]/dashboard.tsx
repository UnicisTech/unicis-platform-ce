import AssetsAnalysis from '@/components/interfaces/AssetManagement/AssetDashboard/AssetAnalysis';
import {
  TeamAssessmentAnalysis,
  TeamCscAnalysis,
  TeamTaskAnalysis,
  PiaAnalysis,
} from '@/components/interfaces/TeamDashboard';
import RmAnalysis from '@/components/interfaces/TeamDashboard/RmAnalysis';
import ProcessingActivitiesAnalysis from '@/components/interfaces/TeamDashboard/TeamProcessingActivities';
import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import { getCurrentPlan } from '@/lib/subscriptions';
import { isTeamHasSubscription } from '@/models/subscription';
import { getUserBySession } from '@/models/user';
import { Subscription, Team, User } from '@prisma/client';
import useTeam from 'hooks/useTeam';
<<<<<<< HEAD
import { getCscStatusesBySlug, getTeam } from 'models/team';
import { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
=======
import useTeamTasks from 'hooks/useTeamTasks';
import { getCscStatusesBySlug } from 'models/team';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
>>>>>>> origin/main
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';

const TeamDashboard = ({
  csc_statuses,
  slug,
<<<<<<< HEAD
  user,
  team,
  teamSubscription
}: {
  teamFeatures: any;
  teamSubscription: Subscription;
  user: User;
  team: Team;
  csc_statuses: { [key: string]: string };
  slug: string;
}) => {
  const { t } = useTranslation('common');
  const currentPlan = getCurrentPlan(teamSubscription);
  const { nodes, isLoading, isError } = useNodes(team.id, 'all');

  // if (teamLoading) {
  //   return <Loading />;
  // }

  // if (teamError) {
  //   return <Error message={teamError.message} />;
  // }
=======
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation('common');
  const { isLoading: teamLoading, isError: teamError, team } = useTeam();
  const {
    tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useTeamTasks(slug);

  if (teamLoading || tasksLoading) {
    return <Loading />;
  }

  if (teamError || tasksError) {
    return <Error message={teamError?.message || tasksError?.message} />;
  }
>>>>>>> origin/main

  // if (!team) {
  //   return <Error message={t('team-not-found')} />;
  // }

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t('Team dashboard')} ({team?.name})
        </h2>
      </div>
      <div className="space-y-6">
<<<<<<< HEAD
        {currentPlan === 'ULTIMATE' &&
          <AssetsAnalysis nodes={nodes} team={team} user={user} />
        }
        <TeamTaskAnalysis slug={slug} csc_statuses={csc_statuses} />
=======
        {/* TODO: { [key: string]: string; } is temporary solution */}
        <TeamTaskAnalysis
          slug={slug}
          csc_statuses={csc_statuses as { [key: string]: string }}
        />
>>>>>>> origin/main
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '10px',
          }}
        >
          <ProcessingActivitiesAnalysis slug={slug} />
          <TeamAssessmentAnalysis slug={slug} />
        </div>
        <div className="space-y-6">
          <PiaAnalysis tasks={tasks} />
        </div>
        {/* TODO: { [key: string]: string; } is temporary solution */}
        <TeamCscAnalysis
          slug={slug}
          csc_statuses={csc_statuses as { [key: string]: string }}
        />
        <div className="space-y-6">
          <RmAnalysis slug={slug} />
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context.req, context.res);
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;
  const user = await getUserBySession(session);
  const team = await getTeam({ slug });
  const teamSubscription = await isTeamHasSubscription(team.id);

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
      team: JSON.parse(JSON.stringify(team)),
      teamSubscription: JSON.parse(JSON.stringify(teamSubscription)),
      csc_statuses: await getCscStatusesBySlug(slug),
      slug: slug,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      },
    },
  };
}

export default TeamDashboard;
