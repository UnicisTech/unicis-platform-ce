import { Error, Loading } from '@/components/shared';
import type { User } from '@/generated/client';
import { useTranslation } from 'next-i18next';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';
import DataInfo from '@/components/shared/DataInfo';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {title}
        </span>
        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3">
        {children}
      </div>
    </div>
  );
}

const NodeDetails = ({
  fleetTeamId,
  nodeID,
  user: _user,
}: {
  fleetTeamId: string;
  user: Partial<User>;
  nodeID: string;
}) => {
  const { t } = useTranslation(['common', 'fleet']);
  const { node, isLoading, isError } = useGetNodeId(fleetTeamId, nodeID);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  return (
    <div className="space-y-3">
      <Section title={t('fleet:asset-overview', { defaultValue: 'Overview' })}>
        <DataInfo header={t('fleet:asset-key')} data={node?.node_key} />
        <DataInfo
          header={t('fleet:asset-status')}
          data={node ? t(node.is_active ? 'active' : 'inactive') : undefined}
        />
        <DataInfo header={t('host-identifier')} data={node?.host_identifier} />
        <DataInfo header={t('enrolled-on')} data={node?.enrolled_on} />
        <DataInfo header={t('last-check')} data={node?.last_checkin} />
        <DataInfo header={t('last-ip-address')} data={node?.last_ip} />
        <DataInfo header={t('created-at')} data={node?.created_at} />
        <DataInfo header={t('updated-at')} data={node?.updated_at} />
      </Section>

      <Section
        title={t('system-information')}
        description={t('system-information-desc')}
      >
        <DataInfo
          header={t('board-model')}
          data={node?.node_info?.system_info?.board_model}
        />
        <DataInfo
          header={t('board-serial')}
          data={node?.node_info?.system_info?.board_serial}
        />
        <DataInfo
          header={t('board-vendor')}
          data={node?.node_info?.system_info?.board_vendor}
        />
        <DataInfo
          header={t('board-version')}
          data={node?.node_info?.system_info?.board_version}
        />
        <DataInfo
          header={t('computer-name')}
          data={node?.node_info?.system_info?.computer_name}
        />
        <DataInfo
          header={t('cpu-brand')}
          data={node?.node_info?.system_info?.cpu_brand}
        />
        <DataInfo
          header={t('cpu-logical')}
          data={node?.node_info?.system_info?.cpu_logical_cores}
        />
        <DataInfo
          header={t('cpu-microcode')}
          data={node?.node_info?.system_info?.cpu_microcode}
        />
        <DataInfo
          header={t('cpu-physical-cores')}
          data={node?.node_info?.system_info?.cpu_physical_cores}
        />
        <DataInfo
          header={t('cpu-socket')}
          data={node?.node_info?.system_info?.cpu_sockets}
        />
        <DataInfo
          header={t('cpu-subtype')}
          data={node?.node_info?.system_info?.cpu_subtype}
        />
        <DataInfo
          header={t('cpu-type')}
          data={node?.node_info?.system_info?.cpu_type}
        />
        <DataInfo
          header={t('hardware-model')}
          data={node?.node_info?.system_info?.hardware_model}
        />
        <DataInfo
          header={t('hardware-serial')}
          data={node?.node_info?.system_info?.hardware_serial}
        />
        <DataInfo
          header={t('hardware-vendor')}
          data={node?.node_info?.system_info?.hardware_vendor}
        />
        <DataInfo
          header={t('hardware-version')}
          data={node?.node_info?.system_info?.hardware_version}
        />
        <DataInfo
          header={t('hostname')}
          data={node?.node_info?.system_info?.hostname}
        />
        <DataInfo
          header={t('local-hostname')}
          data={node?.node_info?.system_info?.local_hostname}
        />
        <DataInfo
          header={t('physical-memory')}
          data={node?.node_info?.system_info?.physical_memory}
        />
        <DataInfo
          header={t('uuid')}
          data={node?.node_info?.system_info?.uuid}
        />
      </Section>

      <Section
        title={t('agent-information')}
        description={t('agent-information-desc')}
      >
        <DataInfo
          header={t('instance-id')}
          data={node?.node_info?.osquery_info?.instance_id}
        />
        <DataInfo
          header={t('build-distro')}
          data={node?.node_info?.osquery_info?.build_distro}
        />
        <DataInfo
          header={t('build-platform')}
          data={node?.node_info?.osquery_info?.build_platform}
        />
        <DataInfo
          header={t('config-hash')}
          data={node?.node_info?.osquery_info?.config_hash}
        />
        <DataInfo
          header={t('config-valid')}
          data={node?.node_info?.osquery_info?.config_valid}
        />
        <DataInfo
          header={t('extensions')}
          data={node?.node_info?.osquery_info?.extensions}
        />
        <DataInfo header={t('pid')} data={node?.node_info?.osquery_info?.pid} />
        <DataInfo
          header={t('platform-mask')}
          data={node?.node_info?.osquery_info?.platform_mask}
        />
        <DataInfo
          header={t('start-time')}
          data={node?.node_info?.osquery_info?.start_time}
        />
        <DataInfo
          header={t('uuid')}
          data={node?.node_info?.osquery_info?.uuid}
        />
        <DataInfo
          header={t('version')}
          data={node?.node_info?.osquery_info?.version}
        />
        <DataInfo
          header={t('watcher')}
          data={node?.node_info?.osquery_info?.watcher}
        />
      </Section>

      <Section
        title={t('platform-information')}
        description={t('platform-information-desc')}
      >
        <DataInfo
          header={t('address')}
          data={node?.node_info?.platform_info?.address}
        />
        <DataInfo
          header={t('data')}
          data={node?.node_info?.platform_info?.date}
        />
        <DataInfo
          header={t('extra')}
          data={node?.node_info?.platform_info?.extra}
        />
        <DataInfo
          header={t('firmware-type')}
          data={node?.node_info?.platform_info?.firmware_type}
        />
        <DataInfo
          header={t('reversion')}
          data={node?.node_info?.platform_info?.revision}
        />
        <DataInfo
          header={t('size')}
          data={node?.node_info?.platform_info?.size}
        />
        <DataInfo
          header={t('vendor')}
          data={node?.node_info?.platform_info?.vendor}
        />
        <DataInfo
          header={t('version')}
          data={node?.node_info?.platform_info?.version}
        />
        <DataInfo
          header={t('volume-size')}
          data={node?.node_info?.platform_info?.volume_size}
        />
      </Section>

      <Section
        title={t('os-information')}
        description={t('os-information-desc')}
      >
        <DataInfo header={t('id')} data={node?.node_info?.os_version?._id} />
        <DataInfo header={t('arch')} data={node?.node_info?.os_version?.arch} />
        <DataInfo
          header={t('codename')}
          data={node?.node_info?.os_version?.codename}
        />
        <DataInfo
          header={t('major')}
          data={node?.node_info?.os_version?.major}
        />
        <DataInfo
          header={t('minor')}
          data={node?.node_info?.os_version?.minor}
        />
        <DataInfo header={t('name')} data={node?.node_info?.os_version?.name} />
        <DataInfo
          header={t('patch')}
          data={node?.node_info?.os_version?.patch}
        />
        <DataInfo
          header={t('pid-with-namespace')}
          data={node?.node_info?.os_version?.pid_with_namespace}
        />
        <DataInfo
          header={t('platform')}
          data={node?.node_info?.os_version?.platform}
        />
        <DataInfo
          header={t('platform-like')}
          data={node?.node_info?.os_version?.platform_like}
        />
        <DataInfo
          header={t('version')}
          data={node?.node_info?.os_version?.version}
        />
      </Section>
    </div>
  );
};

export default NodeDetails;
