import { useState } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import useTeam from 'hooks/useTeam';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import NodeDetails from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/NodeDetails';
import NodeTab from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/NodeTab';
import AssetLogs from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/AssetLogs';
import ResultLogs from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/ResultLogs';
import AssetConfig from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/AssetConfig';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';

const NodeById = ({ teamFeatures: _teamFeatures, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();
  const { nodeId, slug } = router.query;
  const nodeIdStr = Array.isArray(nodeId) ? nodeId[0] : nodeId || '';

  const {
    team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useTeam(slug as string);
  const fleetTeamId = team?.id ?? '';
  useGetNodeId(fleetTeamId, nodeIdStr);

  if (isTeamLoading) {
    return <Loading />;
  }

  if (isTeamError) {
    return <Error message={'isError.message'} />;
  }

  return (
    <>
      <NodeTab activeTab={activeTab} setActiveTab={setActiveTab} />
      {
        activeTab === 'Overview' && (
          <NodeDetails
            user={user}
            fleetTeamId={fleetTeamId}
            nodeID={nodeIdStr}
          />
        )
        // <Card heading={activeTab}>
        //   <Card.Body>
        //   </Card.Body>
        // </Card>
      }
      {
        activeTab === 'Status Logs' && (
          <AssetLogs user={user} fleetTeamId={fleetTeamId} nodeID={nodeIdStr} />
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
            nodeID={nodeIdStr}
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
            nodeID={nodeIdStr}
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

export default NodeById;
