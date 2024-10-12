import { Assets } from '@/components/interfaces/AssetDashboard';
import AssetsAllocator from '@/components/interfaces/AssetDashboard/AssetsAllocator';
import { Error, Loading } from '@/components/shared';
import { useNodes } from '@/hooks/fleets/Nodes/useNodes';
import env from '@/lib/env';
import { getUserBySession } from '@/models/user';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const assetsData = [
  {
    host: 'linux',
    total: 15300,
  },
  {
    host: 'windows',
    total: 443,
  },
  {
    host: 'darwin',
    total: 1232,
  },
  {
    host: 'freebsd',
    total: 65762,
  },
  {
    host: 'posix',
    total: 4521,
  },
  {
    host: 'all',
    total: 340,
  }
]

const TeamAssetDashboard = ({
  slug,
  user,
  teamFeatures,
  }) => {
  const { t } = useTranslation('common');
  const { isLoading: teamLoading, isError: teamError, team } = useTeam();
  const { nodes, isLoading: nodesLoading, isError: nodesError } = useNodes(
    team?.fleetTeamId!,
    user?.fleetAccessPhrase!,
  );

  // Combine loading states for team and nodes
  if (teamLoading || nodesLoading) {
    return <Loading />;
  }

  // Combine error states for team and nodes
  if (teamError || nodesError) {
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
        <Assets assets={assetsData} />
        <AssetsAllocator nodes={nodes}/>
      </div>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context.req, context.res);
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;
  const user = await getUserBySession(session);

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
      slug: slug,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        fleetId: user.fleetId,
        fleetAccessPhrase: user.fleetAccessPhrase
      },
    },
  };
}

export default TeamAssetDashboard;
