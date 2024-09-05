import type { NextPageWithLayout } from 'types';
import type { InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { getTeam } from 'models/team';
import env from '@/lib/env';
import { getFleet } from '@/models/fleet';
import { FleetAccount } from '@prisma/client';
import { getUserBySession } from '@/models/user';
import { getSession } from '@/lib/session';
import { Querys } from '@/components/interfaces/Query';
import { TeamTab } from '@/components/team';


const AllQuerys: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ team, teamFeatures, fleetAccount }) => {
  return (
    <>
      <TeamTab activeTab="querys" team={team} teamFeatures={teamFeatures} />
      <Querys fleetAccount={fleetAccount} team={team} />
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
  const fleetAccount = await getFleet(user.id) || {} as FleetAccount;

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
      },
      fleetAccount: {
        id: fleetAccount.id,
        userId: fleetAccount.userId,
        fleetId: fleetAccount.fleetId,
        accessPhrase: fleetAccount.accessPhrase,
        connected: fleetAccount.connected || false,
      }
    },
  };
};

export default AllQuerys;
