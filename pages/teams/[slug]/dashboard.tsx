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
import useTeam from 'hooks/useTeam';
import useTeamTasks from 'hooks/useTeamTasks';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const TeamDashboard = ({
  slug,
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

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t('Team dashboard')} ({team?.name})
        </h2>
      </div>
      <div className="space-y-6">
        {/* TODO: { [key: string]: string; } is temporary solution */}
        <div className="mb-4 mx-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t(`${slug?.toString().toUpperCase()} Task Overview`)}
          </h2>
        </div>
        <TeamTaskAnalysis
          slug={slug}
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
          team={team}
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
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
      slug: slug,
    },
  };
}

export default TeamDashboard;
