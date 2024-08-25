import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FleetTab } from '@/components/fleet';
import { getFleet} from '@/models/fleet';
import FleetContainer from '@/components/fleet/FleetContainer';
import { FleetAccount } from '@prisma/client';


const Fleet = ({ teamFeatures, fleetAccount, user }) => {
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
        <FleetContainer fleetAccount={fleetAccount} user={user} teamFeatures={teamFeatures}/>
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
        id: fleetAccount.id,
        userId: fleetAccount.userId,
        fleetId: fleetAccount.fleetId,
        accessPhrase: fleetAccount.accessPhrase,
        connected: fleetAccount.connected || false,
        createdAt: fleetAccount.createdAt?.toISOString(), // Serialize Date
        updatedAt: fleetAccount.updatedAt?.toISOString(), // Serialize Date
      }
    },
  };
};

export default Fleet;
