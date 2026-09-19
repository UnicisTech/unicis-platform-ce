import { useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import QueryTab from '@/components/interfaces/AssetManagement/Query/QueryTab';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import DistributorsDetails from '@/components/interfaces/AssetManagement/Distributor/DistributorDetails';
import DistributorsResults from '@/components/interfaces/AssetManagement/Distributor/DistributorResults';
import { getTeam } from '@/models/team';
import { hasAssetManagementPlan } from '@/lib/asset-management';
import AssetTab from '@/components/interfaces/AssetManagement/AssetTab';
import { TeamTab } from '@/components/team';
import FleetConnectRequired from '@/components/interfaces/AssetManagement/FleetConnectRequired';

const DistributorContent = ({ fleetTeamId, distributorId, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <>
      <QueryTab activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Overview' && (
        <DistributorsDetails
          user={user}
          fleetTeamId={fleetTeamId}
          distributorId={distributorId}
        />
      )}
      {activeTab === 'Results' && (
        <DistributorsResults
          fleetTeamId={fleetTeamId}
          distributorId={distributorId}
        />
      )}
    </>
  );
};

const DistributorById = ({ teamFeatures, team: pageTeam, user }) => {
  const router = useRouter();
  const { distributorId } = router.query;

  return (
    <>
      <TeamTab
        activeTab="asset-management"
        team={pageTeam}
        teamFeatures={teamFeatures}
      />
      <AssetTab
        activeTab="distributors"
        team={pageTeam}
        teamFeatures={teamFeatures}
      />
      <FleetConnectRequired user={user} teamId={pageTeam.id}>
        {() => (
          <DistributorContent
            fleetTeamId={pageTeam.id}
            distributorId={distributorId as string}
            user={user}
          />
        )}
      </FleetConnectRequired>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale, query } = context;
  const slug = query.slug as string;

  if (!user) {
    return {
      notFound: true,
    };
  }

  const team = await getTeam({ slug });

  if (!hasAssetManagementPlan(team.subscription)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale
        ? await serverSideTranslations(locale, ['common', 'fleet'])
        : {}),
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
    },
  };
};

export default DistributorById;
