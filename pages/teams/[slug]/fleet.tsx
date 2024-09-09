import { Error, Loading } from '@/components/shared';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getFleet} from '@/models/fleet';
import FleetContainer from '@/components/interfaces/Fleet/FleetContainer';
import { TeamTab } from '@/components/team';
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
      <TeamTab activeTab="fleet" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <FleetContainer fleetAccount={fleetAccount} user={user}/>
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

  const fleetAccount = await getFleet(user.id);

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
        id: fleetAccount?.id!, // Ensure id is not undefined
        userId: fleetAccount?.userId!,
        fleetId: fleetAccount?.fleetId!,
        accessPhrase: fleetAccount?.accessPhrase!,
        connected: fleetAccount?.connected!, // Default to false if undefined
      }
    },
  };
};

export default Fleet;
