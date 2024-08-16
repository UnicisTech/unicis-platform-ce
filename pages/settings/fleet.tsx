import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { FleetAccount } from '@/components/fleet';
import { getFleet } from '@/models/fleet';


const Fleet = ({
  user,
  fleetAccount
}) => {
  return <FleetAccount user={user} fleetAccount={fleetAccount}/>;
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

  const fleetAccount = await getFleet(user.id)

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
      fleetAccount: fleetAccount || null
    },
  };
};

export default Fleet;
