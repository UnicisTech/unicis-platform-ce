import env from '@/lib/env';
import type { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import FleetContainer from '@/components/interfaces/AssetManagement/Fleet/FleetContainer';
import { getTeam } from '@/models/team';
import AssetTab from '@/components/interfaces/AssetManagement/AssetTab';
import { useRouter } from 'next/router';
import { TeamTab } from '@/components/team';


const AssetManagement = ({ teamFeatures, team, user }) => {
  const router = useRouter();
  const { slug } = router.query;
  
  return (
    <>
      <TeamTab activeTab="asset-management" team={team} teamFeatures={teamFeatures} />
      <AssetTab activeTab="fleet" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <FleetContainer user={user}/>
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;
  const team = await getTeam({ slug });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      team: JSON.parse(JSON.stringify(team)),
      teamFeatures: env.teamFeatures,
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
};

export default AssetManagement;
