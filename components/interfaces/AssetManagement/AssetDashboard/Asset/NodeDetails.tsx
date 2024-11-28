import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
import { IssuePanelContainer } from '@/sharedStyles';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';
import DeleteNode from './DeleteNode';
import DataInfo from '@/components/shared/DataInfo';


const NodeDetails = ({ fleetTeamId, nodeID, user }: { fleetTeamId: string, user: Partial<User>, nodeID: string }) => {

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<null | string>(null);
  const [status, setStatusToDelete] = useState<string>();

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

  const handleDeleteStatus = (id: string) => {
    setStatusToDelete(id)
  };

  return (
    <IssuePanelContainer>
      <div className='grid gap-8'>
        <div className="grid grid-cols-2 gap-2">
          <DataInfo header='Asset Key' data={node?.node_key} />
          <DataInfo header='Asset Status' data={node?.is_active ? '🟢 Active' : '🔴 Inactive'} />
          <DataInfo header='Host Identifier' data={node?.host_identifier} />
          <DataInfo header='Enrolled On' data={node?.enrolled_on} />
          <DataInfo header='Last Check' data={node?.last_checkin} />
          <DataInfo header='Last IP Address' data={node?.last_ip} />
          <DataInfo header='Created At' data={node?.created_at} />
          <DataInfo header='Updated At' data={node?.updated_at} />
        </div>
        {/* Asset Info */}
        <div className=''>
          <DataInfo header='System Information' data='The system information logged during asset enrollment' />
          <div className="grid grid-cols-2 gap-2">
            <DataInfo header='Board Model' data={node?.node_info?.system_info?.board_model} />
            <DataInfo header='Board Serial' data={node?.node_info?.system_info?.board_serial} />
            <DataInfo header='Board Vendor' data={node?.node_info?.system_info?.board_vendor} />
            <DataInfo header='Board Version' data={node?.node_info?.system_info?.board_version} />
            <DataInfo header='Computer Name' data={node?.node_info?.system_info?.computer_name} />
            <DataInfo header='CPU Brand' data={node?.node_info?.system_info?.cpu_brand} />
            <DataInfo header='CPU Logical' data={node?.node_info?.system_info?.cpu_logical_cores} />
            <DataInfo header='CPU Microcode' data={node?.node_info?.system_info?.cpu_microcode} />
            <DataInfo header='CPU Physical Cores' data={node?.node_info?.system_info?.cpu_physical_cores} />
            <DataInfo header='CPU Socket' data={node?.node_info?.system_info?.cpu_sockets} />
            <DataInfo header='CPU Subtype' data={node?.node_info?.system_info?.cpu_subtype} />
            <DataInfo header='CPU Type' data={node?.node_info?.system_info?.cpu_type} />
            <DataInfo header='Hardware Model' data={node?.node_info?.system_info?.hardware_model} />
            <DataInfo header='Hardware Serial' data={node?.node_info?.system_info?.hardware_serial} />
            <DataInfo header='Hardware Vendor' data={node?.node_info?.system_info?.hardware_vendor} />
            <DataInfo header='Hardware Version' data={node?.node_info?.system_info?.hardware_version} />
            <DataInfo header='Hostname' data={node?.node_info?.system_info?.hostname} />
            <DataInfo header='Local Hostname' data={node?.node_info?.system_info?.local_hostname} />
            <DataInfo header='Physical Memory' data={node?.node_info?.system_info?.physical_memory} />
            <DataInfo header='UUID' data={node?.node_info?.system_info?.uuid} />
          </div>
        </div>
        <div>
          <DataInfo header='Agent Information' data='The agent information logged during asset enrollment' />
          <div className="grid grid-cols-4 gap-2">
            <DataInfo header='Instance ID' data={node?.node_info?.osquery_info?.instance_id} />
            <DataInfo header='Build Distro' data={node?.node_info?.osquery_info?.build_distro} />
            <DataInfo header='Build Platform' data={node?.node_info?.osquery_info?.build_platform} />
            <DataInfo header='Config Hash' data={node?.node_info?.osquery_info?.config_hash} />
            <DataInfo header='Config Valid' data={node?.node_info?.osquery_info?.config_valid} />
            <DataInfo header='Extensions' data={node?.node_info?.osquery_info?.extensions} />
            <DataInfo header='PID' data={node?.node_info?.osquery_info?.pid} />
            <DataInfo header='Platform Mask' data={node?.node_info?.osquery_info?.platform_mask} />
            <DataInfo header='Start Time' data={node?.node_info?.osquery_info?.start_time} />
            <DataInfo header='UUID' data={node?.node_info?.osquery_info?.uuid} />
            <DataInfo header='Version' data={node?.node_info?.osquery_info?.version} />
            <DataInfo header='Watcher' data={node?.node_info?.osquery_info?.watcher} />
          </div>
        </div>
        <div>
          <DataInfo header='Platform Information' data='The platform information logged during asset enrollment' />
          <div className="grid grid-cols-4 gap-2">
            <DataInfo header='Address' data={node?.node_info?.platform_info?.address} />
            <DataInfo header='Data' data={node?.node_info?.platform_info?.date} />
            <DataInfo header='Extra' data={node?.node_info?.platform_info?.extra} />
            <DataInfo header='Firmware Type' data={node?.node_info?.platform_info?.firmware_type} />
            <DataInfo header='Reversion' data={node?.node_info?.platform_info?.revision} />
            <DataInfo header='Size' data={node?.node_info?.platform_info?.size} />
            <DataInfo header='Vendor' data={node?.node_info?.platform_info?.vendor} />
            <DataInfo header='Version' data={node?.node_info?.platform_info?.version} />
            <DataInfo header='Volume Size' data={node?.node_info?.platform_info?.volume_size} />
          </div>
        </div>
        <div>
          <DataInfo header='OS Information' data='The os information logged during asset enrollment' />
          <div className="grid grid-cols-4 gap-2">
            <DataInfo header='_ID' data={node?.node_info?.os_version?._id} />
            <DataInfo header='Arch' data={node?.node_info?.os_version?.arch} />
            <DataInfo header='Codename' data={node?.node_info?.os_version?.codename} />
            <DataInfo header='Major' data={node?.node_info?.os_version?.major} />
            <DataInfo header='Minor' data={node?.node_info?.os_version?.minor} />
            <DataInfo header='Name' data={node?.node_info?.os_version?.name} />
            <DataInfo header='Patch' data={node?.node_info?.os_version?.patch} />
            <DataInfo header='PID With Namespace' data={node?.node_info?.os_version?.pid_with_namespace} />
            <DataInfo header='Platform' data={node?.node_info?.os_version?.platform} />
            <DataInfo header='Platform Like' data={node?.node_info?.os_version?.platform_like} />
            <DataInfo header='Version' data={node?.node_info?.os_version?.version} />

          </div>
        </div>
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
