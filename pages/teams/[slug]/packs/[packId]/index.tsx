import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import Breadcrumb from '../../../../../components/interfaces/Task/Breadcrumb';
import PackTab from '@/components/interfaces/Pack/PackTab';
import PackDetails from '@/components/interfaces/Pack/PackDetails';
import { getFleet } from '@/models/fleet';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';

const PackById = ({teamFeatures, fleetAccount, user}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { packId, slug } = router.query;

  const {
    team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useTeam(slug as string);

  if (isTeamLoading) {
    return <Loading />;
  }

  if (isTeamError) {
    return <Error message={'isError.message'} />;
  }

  return (
    <>
      <h3 className="text-2xl font-bold">{'Pack Details'}</h3>
      <PackTab activeTab={activeTab} setActiveTab={setActiveTab} />
      <PackDetails fleetAccount={fleetAccount} teamId={team?.id!} packID={packId as string} />
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
        id: fleetAccount?.id!,
        userId: fleetAccount?.userId!,
        fleetId: fleetAccount?.fleetId!,
        accessPhrase: fleetAccount?.accessPhrase!,
        connected: fleetAccount?.connected!,
      }
    },
  };
};

export default PackById;
