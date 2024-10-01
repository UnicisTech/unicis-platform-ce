import { Assets } from '@/components/interfaces/AssetDashboard';
import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


const TeamAssetDashboard = ({
  slug,
}: {
  teamFeatures: any;
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
          {t('Asset dashboard')} ({team?.name})
        </h2>
      </div>
      <div className="space-y-6">
        <Assets/>
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

export default TeamAssetDashboard;
