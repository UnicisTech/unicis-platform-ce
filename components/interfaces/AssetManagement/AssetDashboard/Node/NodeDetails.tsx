import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';
import DeleteNode from './DeleteNode';
import FormattedDate from '@/components/shared/Date';
import TableBuilder from '../../TableBuilder';
import { CodeBlock } from '@atlaskit/code';


const NodeDetails = ({ fleetTeamId, nodeID, user }: { fleetTeamId: string, user: Partial<User>, nodeID: string }) => {

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<null | string>(null);

  const { node, isLoading, isError } = useGetNodeId(fleetTeamId, nodeID);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <>
        <Error />
      </>
    );
  }

  const openDeleteModal = async (id: string) => {
    setNodeToDelete(id);
    setDeleteVisible(true);
  };

  return (
    <IssuePanelContainer>
      <div className='grid gap-2'>
        <div>Asset Key: {node?.node_key}</div>
        <div>Asset Board Model: {node?.node_info?.system_info.board_model}</div>
        <div>Asset CPU Brand: {node?.node_info?.system_info.cpu_brand}</div>
        <div>Asset Hardware Model: {node?.node_info?.system_info.hardware_model}</div>
        <div>Asset Operating System: {node?.node_info?.os_version.name}</div>
        <div>Asset Serial Number: {node?.node_info?.system_info.hardware_serial}</div>
        <div>Asset Address: {node?.node_info?.platform_info.address}</div>
        <div>Asset Last Checkin: {node?.last_checkin ? <FormattedDate style={''} dateString={node?.last_checkin} /> : 'Never'}</div>
        <div className="items-center justify-start">
          <h1>Asset Config</h1>
          <CodeBlock language="JSON" shouldWrapLongLines codeBidiWarningTooltipEnabled i18nIsDynamicList={true} showLineNumbers={false} text={JSON.stringify(node?.node_config)} />
        </div>
        <h1 className=''>Status Logs</h1>
        <TableBuilder data={node!.status_logs} />
        <h1 className=''>Result Logs</h1>
        <TableBuilder data={node!.result_logs} />
      </div>
      <DeleteNode
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        nodeId={nodeToDelete!}
        fleetTeamId={fleetTeamId}
      />
    </IssuePanelContainer>
  );
};

export default NodeDetails;
