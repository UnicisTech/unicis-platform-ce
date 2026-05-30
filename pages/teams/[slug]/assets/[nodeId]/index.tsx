import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loading, Error, Card } from '@/components/shared';
import { GetServerSidePropsContext } from 'next';
import useTeam from 'hooks/useTeam';
import { getSession } from '@/lib/session';
import { getUserBySession } from '@/models/user';
import env from '@/lib/env';
import Breadcrumb from '@/components/shared/Breadcrumb';
import NodeDetails from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/NodeDetails';
import NodeTab from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/NodeTab';
import AssetLogs from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/AssetLogs';
import ResultLogs from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/ResultLogs';
import AssetConfig from '@/components/interfaces/AssetManagement/AssetDashboard/Asset/AssetConfig';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';


const NodeById = ({ teamFeatures, user }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const router = useRouter();
  const { t } = useTranslation('common');
  const { nodeId, slug } = router.query;
  const nodeIdStr = Array.isArray(nodeId) ? nodeId[0] : nodeId || '';

  const {
    team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useTeam(slug as string);
  const { node } = useGetNodeId(team?.id || '', nodeIdStr);

  const shortNodeId =
    nodeIdStr.length > 16
      ? `${nodeIdStr.slice(0, 8)}...${nodeIdStr.slice(-4)}`
      : nodeIdStr;
  const assetBreadcrumbLabel =
    node?.node_key ||
    node?.node_info?.system_info?.computer_name ||
    node?.host_identifier ||
    shortNodeId;

  if (isTeamLoading) {
    return <Loading />;
  }

  if (isTeamError) {
    return <Error message={'isError.message'} />;
  }

  return (
    <>
      <Breadcrumb
        taskTitle={'Assets'}
        backTo={`/teams/${slug}/asset`}
        teamName={team?.name || (slug as string)}
        teamSlug={slug as string}
        path={assetBreadcrumbLabel}
      />
      <h3 className="text-2xl font-bold">{'Asset Details'}</h3>
      <NodeTab activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'Overview' &&
            <NodeDetails user={user} fleetTeamId={team?.id!} nodeID={nodeIdStr} />
        // <Card heading={activeTab}>
        //   <Card.Body>
        //   </Card.Body>
        // </Card>
      }
      {activeTab === 'Status Logs' &&
            <AssetLogs user={user} fleetTeamId={team?.id!} nodeID={nodeIdStr} />
        // <Card heading={activeTab}>
        //   <Card.Body>
        //   </Card.Body>
        // </Card>
      }
      {activeTab === 'Result Logs' &&
            <ResultLogs user={user} fleetTeamId={team?.id!} nodeID={nodeIdStr} />
        // <Card heading={activeTab}>
        //   <Card.Body>
        //   </Card.Body>
        // </Card>
      }
      {activeTab === 'Asset Configurations' &&
            <AssetConfig user={user} fleetTeamId={team?.id!} nodeID={nodeIdStr} />
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
      ...(locale ? await serverSideTranslations(locale, ['common', 'fleet']) : {}),
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
