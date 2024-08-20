import { Error, Loading } from '@/components/shared';
import { AccessControl } from '@/components/shared/AccessControl';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { FleetSecret } from '@prisma/client';
import { getUserBySession } from 'models/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FleetAccount, FleetInfo, FleetTab } from '@/components/fleet';
import { getFleet, getFleetSecret } from '@/models/fleet';
import FleetContainer from '@/components/fleet/FleetContainer';
import ConnectFleet from '@/components/fleet/ConnectFleet';


const Fleet = ({ teamFeatures, fleetSecret, fleetAccount, user }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <FleetTab activeTab="fleet" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <ConnectFleet fleetAccount={fleetAccount} user={user} />
        <FleetInfo fleetAccount={fleetAccount} user={user} />
        <FleetContainer fleetAccount={fleetAccount} user={user} teamFeatures={teamFeatures} fleetSecret={fleetSecret} />
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale } = context;

  if (!user) {
    return {
      notFound: true,
    };
  }

  const fleetAccount = await getFleet(user.id) || {} as FleetAccount;
  const FleetSecret = await getFleetSecret(user.id) || {} as FleetSecret;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
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
        id: fleetAccount.id || null,
        userId: fleetAccount.userId || null,
        fleetId: fleetAccount.fleetId || null,
        accessPhrase: fleetAccount.accessPhrase || null,
        connected: fleetAccount.connected || false,
        createdAt: fleetAccount.createdAt?.toISOString() || null, // Serialize Date
        updatedAt: fleetAccount.updatedAt?.toISOString() || null, // Serialize Date
      },
      fleetSecret: {
        id: FleetSecret.id || null,
        teamId: FleetSecret.teamId || null,
        fleetTeamId: FleetSecret.fleetTeamId || null,
        secret: FleetSecret.secret || null,
        active: FleetSecret.active || null,
        createdAt: FleetSecret.createdAt?.toISOString() || null, // Serialize Date
        updatedAt: FleetSecret.updatedAt?.toISOString() || null, // Serialize Date
      }
    },
  };
};

export default Fleet;
