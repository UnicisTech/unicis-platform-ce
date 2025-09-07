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
import { getCscStatusesBySlug, getTeam } from 'models/team';
import { getSession } from '@/lib/session';
import useTeamTasks from 'hooks/useTeamTasks';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import { useEffect } from 'react';

const TeamDashboard = ({
    csc_statuses,
    slug,
    user,
    team,
    teamSubscription
  } : {
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

  useEffect(() => {
    console.log("user", user)
  }, [user])
  
  const {
    tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useTeamTasks(slug);

  if (tasksLoading) {
    return <Loading />;
  }

  if (tasksError) {
    return <Error message={tasksError?.message} />;
  }

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t('Team dashboard')} ({team?.name})
        </h2>
      </div>
      <div className="space-y-6">
        {currentPlan === 'ULTIMATE' &&
          <AssetsAnalysis nodes={nodes} team={team} user={user} />
        }
        {/* TODO: { [key: string]: string; } is temporary solution */}
        <div className="mb-4 mx-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t(`${slug?.toString().toUpperCase()} Task Overview`)}
          </h2>
        </div>
        <TeamTaskAnalysis
          slug={slug}
          csc_statuses={csc_statuses as { [key: string]: string }}
        />
        <div className="mb-4 mx-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t(`Data Privacy Overview`)}
          </h2>
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            marginBottom: '10px',
          }}
        >
          <ProcessingActivitiesAnalysis slug={slug} />
          <TeamAssessmentAnalysis slug={slug} />
        </div>
        <div className="space-y-6">
          <div className="mb-4 mx-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t(`pia-overview`)}
            </h2>
          </div>
          <PiaAnalysis tasks={tasks} />
        </div>
        <TeamCscAnalysis
          slug={slug}
          csc_statuses={csc_statuses as { [key: string]: string }}
        />
        <div className="space-y-6">
          <div className="mb-4 px-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('rm-overview')}
            </h2>
          </div>
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
