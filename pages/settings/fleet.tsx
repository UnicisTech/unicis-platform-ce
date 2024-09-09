import type { NextPageWithLayout } from 'types';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { FleetAccountManager } from '@/components/account';
import env from '@/lib/env';
import { getFleet } from '@/models/fleet';


type AccountProps = inferSSRProps<typeof getServerSideProps>;

const Fleet: NextPageWithLayout<AccountProps> = ({
  user,
  fleetAccount,
  allowEmailChange,
}) => {
  return (
    <>
      <FleetAccountManager fleetAccount={fleetAccount} user={user} allowEmailChange={allowEmailChange} />
    </>
  )
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      },
      allowEmailChange: env.confirmEmail === false,
      fleetAccount: {
        id: fleetAccount?.id, // Ensure id is not undefined
        userId: fleetAccount?.userId,
        fleetId: fleetAccount?.fleetId,
        accessPhrase: fleetAccount?.accessPhrase,
        connected: fleetAccount?.connected,
      }
    },
  };
};

export default Fleet;
