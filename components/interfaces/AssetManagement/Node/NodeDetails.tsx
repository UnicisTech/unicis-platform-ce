import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';
import DeleteNode from './DeleteNode';
import FormattedDate from '@/components/shared/Date';


const NodeDetails = ({ fleetTeamId, nodeID, user }: { fleetTeamId: string, user: Partial<User>, nodeID: string }) => {  

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<null | string>(null);
  
  const { node, isLoading, isError } = useGetNodeId(fleetTeamId, nodeID, user?.fleetAccessPhrase!);

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
        <div>Node Key: {node?.node_key}</div>
        <div>Node Board Model: {node?.node_info?.system_info.board_model}</div>
        <div>Node CPU Brand: {node?.node_info?.system_info.cpu_brand}</div>
        <div>Node Hardware Model: {node?.node_info?.system_info.hardware_model}</div>
        <div>Node Operating System: {node?.node_info?.os_version.name}</div>
        <div>Node Serial Number: {node?.node_info?.system_info.hardware_serial}</div>
        <div>Node Address: {node?.node_info?.platform_info.address}</div>
        <div>Node Last Checkin: {node?.last_checkin? <FormattedDate style={''} dateString={node?.last_checkin} /> : 'Never'}</div>
        {node?.status_logs.map((log, index) => (
          <div key={log.id}>
            <div tabIndex={index} className="collapse collapse-plus border-base-300 bg-base-200 border">
              <div className="collapse-title text-xl font-medium">{log.message}</div>
              <div className="collapse-content">
                <div>{log.filename}</div>
                <div>{log.line}</div>
                <div>At: {log.created_at}</div>
              </div>
            </div>
          </div>
        ))}
        {node?.result_logs.map((log, index) => (
          <div key={log.id}>
            <div tabIndex={index} className="collapse collapse-plus border-base-300 bg-base-200 border">
              <div className="collapse-title text-xl font-medium">{log.message}</div>
              <div className="collapse-content">
                <div>At: {log.created_at}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <DeleteNode
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        nodeId={nodeToDelete!}
        fleetTeamId={fleetTeamId}
        fleetAccessPhrase={user.fleetAccessPhrase!}
      />
    </IssuePanelContainer>
  );
};

export default NodeDetails;
