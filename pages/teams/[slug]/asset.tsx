import { Assets } from '@/components/interfaces/AssetManagement/AssetDashboard';
import env from '@/lib/env';
import { getUserBySession } from '@/models/user';
import { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getTeam } from '@/models/team';
import { isTeamHasSubscription } from '@/models/subscription';

const TeamAssetDashboard = ({
  slug: _slug,
  user,
  team,
  teamFeatures: _teamFeatures,
  teamSubscription: _teamSubscription,
}) => {
  return (
    <div className="space-y-6">
      <Assets user={user} team={team} />
    </div>
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

  // Get user's role in this team
  const { prisma } = await import('@/lib/prisma');
  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: user.id,
      },
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
      teamFeatures: env.teamFeatures,
      team: JSON.parse(JSON.stringify(team)),
      teamSubscription: JSON.parse(JSON.stringify(teamSubscription)),
      slug: slug,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        role: member?.role,
      },
    },
  };
}

export default TeamAssetDashboard;
