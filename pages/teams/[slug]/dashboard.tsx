import {
  TeamAssessmentAnalysis,
  TeamCscAnalysis,
  TeamTaskAnalysis,
} from '@/components/interfaces/TeamDashboard';
import RmAnalysis from '@/components/interfaces/TeamDashboard/RmAnalysis';
import ProcessingActivitiesAnalysis from '@/components/interfaces/TeamDashboard/TeamProcessingActivities';
import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import { getCscStatusesBySlug } from 'models/team';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const TeamDashboard = ({
  csc_statuses,
  slug,
}: {
  teamFeatures: any;
  csc_statuses: { [key: string]: string };
  slug: string;
}) => {
  const { t } = useTranslation('common');
  const { isLoading: teamLoading, isError: teamError, team } = useTeam();

  if (teamLoading) {
    return <Loading />;
  }

  if (teamError) {
    return <Error message={teamError.message} />;
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
        <TeamTaskAnalysis slug={slug} csc_statuses={csc_statuses} />
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
        <TeamCscAnalysis slug={slug} csc_statuses={csc_statuses} />
        <div className="space-y-6">
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
      csc_statuses: await getCscStatusesBySlug(slug),
      slug: slug,
    },
  };
}

export default TeamDashboard;
