import { useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Card } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import PackTab from '@/components/interfaces/AssetManagement/Pack/PackTab';
import PackDetails from '@/components/interfaces/AssetManagement/Pack/PackDetails';
import PackResults from '@/components/interfaces/AssetManagement/Pack/PackResults';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import { getTeam } from '@/models/team';
import { hasAssetManagementPlan } from '@/lib/asset-management';
import AssetTab from '@/components/interfaces/AssetManagement/AssetTab';
import { TeamTab } from '@/components/team';
import FleetConnectRequired from '@/components/interfaces/AssetManagement/FleetConnectRequired';

const PackContent = ({ fleetTeamId, packId, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <>
      <PackTab activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Overview' && (
        <Card heading="Details">
          <Card.Body>
            <PackDetails
              user={user}
              fleetTeamId={fleetTeamId}
              packID={packId}
            />
          </Card.Body>
        </Card>
      )}

      {activeTab === 'Results' && (
        <Card heading="Pack Query Results">
          <Card.Body>
            <PackResults teamId={fleetTeamId} packId={packId} />
          </Card.Body>
        </Card>
      )}
    </>
  );
};

const PackById = ({ teamFeatures, team: pageTeam, user }) => {
  const router = useRouter();
  const { packId } = router.query;

  return (
    <>
      <TeamTab
        activeTab="asset-management"
        team={pageTeam}
        teamFeatures={teamFeatures}
      />
      <AssetTab activeTab="packs" team={pageTeam} teamFeatures={teamFeatures} />
      <FleetConnectRequired user={user} teamId={pageTeam.id}>
        {() => (
          <PackContent
            fleetTeamId={pageTeam.id}
            packId={packId as string}
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

export default PackById;
