import { useState } from 'react';
import { Error, Loading } from '@/components/shared';
import type { User } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';
import DeleteNode from './DeleteNode';
import DataInfo from '@/components/shared/DataInfo';

const NodeDetails = ({
  fleetTeamId,
  nodeID,
  user,
}: {
  fleetTeamId: string;
  user: Partial<User>;
  nodeID: string;
}) => {
  const { t } = useTranslation('common');
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<null | string>(null);
  const [status, setStatusToDelete] = useState<string>();
  const { node, isLoading, isError } = useGetNodeId(fleetTeamId, nodeID);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  const openDeleteModal = (id: string) => {
    setNodeToDelete(id);
    setDeleteVisible(true);
  };

  const handleDeleteStatus = (id: string) => {
    setStatusToDelete(id);
  };

  return (
    <div>
      <div className="grid gap-8">
        <div className="grid grid-cols-2 gap-2">
          <DataInfo header={t('asset-key')} data={node?.node_key} />
          <DataInfo
            header={t('asset-status')}
            data={node?.is_active ? '🟢 ' + t('active') : '🔴 ' + t('inactive')}
          />
          <DataInfo header={t('host-identifier')} data={node?.host_identifier} />
          <DataInfo header={t('enrolled-on')} data={node?.enrolled_on} />
          <DataInfo header={t('last-check')} data={node?.last_checkin} />
          <DataInfo header={t('last-ip-address')} data={node?.last_ip} />
          <DataInfo header={t('created-at')} data={node?.created_at} />
          <DataInfo header={t('updated-at')} data={node?.updated_at} />
        </div>

        <div>
          <DataInfo header={t('system-information')} data={t('system-information-desc')} />
          <div className="grid grid-cols-2 gap-2">
            <DataInfo header={t('board-model')} data={node?.node_info?.system_info?.board_model} />
            <DataInfo header={t('board-serial')} data={node?.node_info?.system_info?.board_serial} />
            <DataInfo header={t('board-vendor')} data={node?.node_info?.system_info?.board_vendor} />
            <DataInfo header={t('board-version')} data={node?.node_info?.system_info?.board_version} />
            <DataInfo header={t('computer-name')} data={node?.node_info?.system_info?.computer_name} />
            <DataInfo header={t('cpu-brand')} data={node?.node_info?.system_info?.cpu_brand} />
            <DataInfo header={t('cpu-logical')} data={node?.node_info?.system_info?.cpu_logical_cores} />
            <DataInfo header={t('cpu-microcode')} data={node?.node_info?.system_info?.cpu_microcode} />
            <DataInfo header={t('cpu-physical-cores')} data={node?.node_info?.system_info?.cpu_physical_cores} />
            <DataInfo header={t('cpu-socket')} data={node?.node_info?.system_info?.cpu_sockets} />
            <DataInfo header={t('cpu-subtype')} data={node?.node_info?.system_info?.cpu_subtype} />
            <DataInfo header={t('cpu-type')} data={node?.node_info?.system_info?.cpu_type} />
            <DataInfo header={t('hardware-model')} data={node?.node_info?.system_info?.hardware_model} />
            <DataInfo header={t('hardware-serial')} data={node?.node_info?.system_info?.hardware_serial} />
            <DataInfo header={t('hardware-vendor')} data={node?.node_info?.system_info?.hardware_vendor} />
            <DataInfo header={t('hardware-version')} data={node?.node_info?.system_info?.hardware_version} />
            <DataInfo header={t('hostname')} data={node?.node_info?.system_info?.hostname} />
            <DataInfo header={t('local-hostname')} data={node?.node_info?.system_info?.local_hostname} />
            <DataInfo header={t('physical-memory')} data={node?.node_info?.system_info?.physical_memory} />
            <DataInfo header={t('uuid')} data={node?.node_info?.system_info?.uuid} />
          </div>
        </div>

        <div>
          <DataInfo header={t('agent-information')} data={t('agent-information-desc')} />
          <div className="grid grid-cols-4 gap-2">
            <DataInfo header={t('instance-id')} data={node?.node_info?.osquery_info?.instance_id} />
            <DataInfo header={t('build-distro')} data={node?.node_info?.osquery_info?.build_distro} />
            <DataInfo header={t('build-platform')} data={node?.node_info?.osquery_info?.build_platform} />
            <DataInfo header={t('config-hash')} data={node?.node_info?.osquery_info?.config_hash} />
            <DataInfo header={t('config-valid')} data={node?.node_info?.osquery_info?.config_valid} />
            <DataInfo header={t('extensions')} data={node?.node_info?.osquery_info?.extensions} />
            <DataInfo header={t('pid')} data={node?.node_info?.osquery_info?.pid} />
            <DataInfo header={t('platform-mask')} data={node?.node_info?.osquery_info?.platform_mask} />
            <DataInfo header={t('start-time')} data={node?.node_info?.osquery_info?.start_time} />
            <DataInfo header={t('uuid')} data={node?.node_info?.osquery_info?.uuid} />
            <DataInfo header={t('version')} data={node?.node_info?.osquery_info?.version} />
            <DataInfo header={t('watcher')} data={node?.node_info?.osquery_info?.watcher} />
          </div>
        </div>

        <div>
          <DataInfo header={t('platform-information')} data={t('platform-information-desc')} />
          <div className="grid grid-cols-4 gap-2">
            <DataInfo header={t('address')} data={node?.node_info?.platform_info?.address} />
            <DataInfo header={t('data')} data={node?.node_info?.platform_info?.date} />
            <DataInfo header={t('extra')} data={node?.node_info?.platform_info?.extra} />
            <DataInfo header={t('firmware-type')} data={node?.node_info?.platform_info?.firmware_type} />
            <DataInfo header={t('reversion')} data={node?.node_info?.platform_info?.revision} />
            <DataInfo header={t('size')} data={node?.node_info?.platform_info?.size} />
            <DataInfo header={t('vendor')} data={node?.node_info?.platform_info?.vendor} />
            <DataInfo header={t('version')} data={node?.node_info?.platform_info?.version} />
            <DataInfo header={t('volume-size')} data={node?.node_info?.platform_info?.volume_size} />
          </div>
        </div>

        <div>
          <DataInfo header={t('os-information')} data={t('os-information-desc')} />
          <div className="grid grid-cols-4 gap-2">
            <DataInfo header={t('id')} data={node?.node_info?.os_version?._id} />
            <DataInfo header={t('arch')} data={node?.node_info?.os_version?.arch} />
            <DataInfo header={t('codename')} data={node?.node_info?.os_version?.codename} />
            <DataInfo header={t('major')} data={node?.node_info?.os_version?.major} />
            <DataInfo header={t('minor')} data={node?.node_info?.os_version?.minor} />
            <DataInfo header={t('name')} data={node?.node_info?.os_version?.name} />
            <DataInfo header={t('patch')} data={node?.node_info?.os_version?.patch} />
            <DataInfo header={t('pid-with-namespace')} data={node?.node_info?.os_version?.pid_with_namespace} />
            <DataInfo header={t('platform')} data={node?.node_info?.os_version?.platform} />
            <DataInfo header={t('platform-like')} data={node?.node_info?.os_version?.platform_like} />
            <DataInfo header={t('version')} data={node?.node_info?.os_version?.version} />
          </div>
        </div>
      </div>

      <DeleteNode
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        nodeId={nodeToDelete!}
        fleetTeamId={fleetTeamId}
      />
    </div>
  );
};

export default NodeDetails;
