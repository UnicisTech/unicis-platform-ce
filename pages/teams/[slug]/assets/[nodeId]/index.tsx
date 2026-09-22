import { useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import NodeDetails from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/NodeDetails';
import NodeTab from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/NodeTab';
import AssetLogs from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/AssetLogs';
import ResultLogs from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/ResultLogs';
import AssetConfig from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/AssetConfig';
import FleetConnectRequired from '@/components/interfaces/AssetManagement/FleetConnectRequired';
import { getTeam } from '@/models/team';
import { hasAssetManagementPlan } from '@/lib/asset-management';

const NodeContent = ({ fleetTeamId, nodeId, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <>
      <NodeTab activeTab={activeTab} setActiveTab={setActiveTab} />
      {
        activeTab === 'Overview' && (
          <NodeDetails
            user={user}
            fleetTeamId={fleetTeamId}
            nodeID={nodeId}
          />
        )
        // <Card heading={activeTab}>
        //   <Card.Body>
        //   </Card.Body>
        // </Card>
      }
      {
        activeTab === 'Status Logs' && (
          <AssetLogs user={user} fleetTeamId={fleetTeamId} nodeID={nodeId} />
        )
        // <Card heading={activeTab}>
        //   <Card.Body>
        //   </Card.Body>
        // </Card>
      }
      {
        activeTab === 'Result Logs' && (
          <ResultLogs
            user={user}
            fleetTeamId={fleetTeamId}
            nodeID={nodeId}
          />
        )
        // <Card heading={activeTab}>
        //   <Card.Body>
        //   </Card.Body>
        // </Card>
      }
      {
        activeTab === 'Asset Configurations' && (
          <AssetConfig
            user={user}
            fleetTeamId={fleetTeamId}
            nodeID={nodeId}
          />
        )
        // <Card heading={activeTab}>
        //   <Card.Body>
        //   </Card.Body>
        // </Card>
      }
    </>
  );
};

const NodeById = ({ teamFeatures: _teamFeatures, team, user }) => {
  const router = useRouter();
  const { nodeId } = router.query;
  const nodeIdStr = Array.isArray(nodeId) ? nodeId[0] : nodeId || '';

  return (
    <FleetConnectRequired user={user} teamId={team.id}>
      {() => (
        <NodeContent
          fleetTeamId={team.id}
          nodeId={nodeIdStr}
          user={user}
        />
      )}
    </FleetConnectRequired>
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
      teamFeatures: env.teamFeatures,
      team: JSON.parse(JSON.stringify(team)),
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

export default NodeById;
