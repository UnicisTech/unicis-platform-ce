import { useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import useTeam from 'hooks/useTeam';
import QueryTab from '@/components/interfaces/AssetManagement/Query/QueryTab';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import DistributorsDetails from '@/components/interfaces/AssetManagement/Distributor/DistributorDetails';
import DistributorsResults from '@/components/interfaces/AssetManagement/Distributor/DistributorResults';

const DistributorById = ({ teamFeatures: _teamFeatures, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();
  const { distributorId, slug } = router.query;
  const {
    team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useTeam(slug as string);
  const fleetTeamId = team?.id ?? '';

  if (isTeamLoading) {
    return <Loading />;
  }

  if (isTeamError) {
    return <Error message={'isError.message'} />;
  }

  return (
    <>
      <Breadcrumb
        taskTitle={'Distributors'}
        backTo={`/teams/${slug}/asset-management/distributors`}
        teamName={slug as string}
        path={distributorId as string}
      />
      <h3 className="text-2xl font-bold">{'Script'}</h3>
      <QueryTab activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Overview' && (
        <DistributorsDetails
          user={user}
          fleetTeamId={fleetTeamId}
          distributorId={distributorId as string}
        />
      )}
      {activeTab === 'Results' && (
        <DistributorsResults
          fleetTeamId={fleetTeamId}
          distributorId={distributorId as string}
        />
      )}
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

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, ['common', 'fleet'])
        : {}),
      teamFeatures: env.teamFeatures,
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

export default DistributorById;
