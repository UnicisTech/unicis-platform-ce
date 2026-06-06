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

const AssetManagement = ({
  teamFeatures,
  team,
  user,
  enrollmentToken,
  isTeamAdmin,
}) => {
  return (
    <FleetConnectRequired
      user={user}
      teamId={team.id}
      enrollmentToken={enrollmentToken}
      isTeamAdmin={isTeamAdmin}
    >
      {() => (
        <>
          <TeamTab
            activeTab="asset-management"
            team={team}
            teamFeatures={teamFeatures}
          />
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
    typeof query.fleetEnrollToken === 'string' ? query.fleetEnrollToken : null;
  const team = await getTeam({ slug });

  if (!user) {
    return {
      notFound: true,
    };
  }

  // Get team member role
  const { prisma } = await import('@/lib/prisma');
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      teamId: team.id,
      userId: user.id,
    },
    select: {
      role: true,
    },
  });

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, ['common', 'fleet'])
        : {}),
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
      isTeamAdmin: teamMember?.role === 'ADMIN' || teamMember?.role === 'OWNER',
    },
  };
};

export default AssetManagement;
