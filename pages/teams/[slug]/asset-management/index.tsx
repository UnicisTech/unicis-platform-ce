import env from '@/lib/env';
import type { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import FleetContainer from '@/components/interfaces/AssetManagement/Fleet/FleetContainer';
import { getTeam } from '@/models/team';
import AssetTab from '@/components/interfaces/AssetManagement/AssetTab';
import { TeamTab } from '@/components/team';
import FleetConnectRequired from '@/components/interfaces/AssetManagement/FleetConnectRequired';


const AssetManagement = ({ teamFeatures, team, user, enrollmentToken }) => {

  return (
    <FleetConnectRequired user={user} teamId={team.id} enrollmentToken={enrollmentToken}>
    {() => (
      <>
        <TeamTab activeTab="asset-management" team={team} teamFeatures={teamFeatures} />
        <AssetTab activeTab="fleet" team={team} teamFeatures={teamFeatures} />
        <div className="space-y-6">
          <FleetContainer user={user} team={team} />
        </div>
      </>
    )}
    </FleetConnectRequired>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale, query }: GetServerSidePropsContext = context;
  const slug = query.slug as string;
  const enrollmentToken =
    typeof query.fleetEnrollToken === 'string'
      ? query.fleetEnrollToken
      : null;
  const team = await getTeam({ slug });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common', 'fleet']) : {}),
      team: JSON.parse(JSON.stringify(team)),
      teamFeatures: env.teamFeatures,
      enrollmentToken,
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
};

export default AssetManagement;
