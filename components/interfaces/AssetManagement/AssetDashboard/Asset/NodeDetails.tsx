import { Error, Loading } from '@/components/shared';
import type { User } from '@/generated/client';
import { useTranslation } from 'next-i18next';
import { useGetNodeId } from '@/hooks/fleets/Nodes/useGetNodeId';
import DataInfo from '@/components/shared/DataInfo';

const formatNodeDate = (value: string | undefined | null) => {
  if (!value) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
};

const normalizeNodeValue = (value: string | number | undefined | null) => {
  if (value === -1 || value === '-1') {
    return null;
  }

  return value;
};

function Info({
  header,
  data,
}: {
  header: string;
  data: string | number | undefined | null;
}) {
  return <DataInfo header={header} data={normalizeNodeValue(data)} />;
}

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
        <Info header={t('fleet:asset-key')} data={node?.node_key} />
        <Info
          header={t('fleet:asset-status')}
          data={node ? t(node.is_active ? 'active' : 'inactive') : undefined}
        />
        <Info header={t('host-identifier')} data={node?.host_identifier} />
        <Info
          header={t('enrolled-on')}
          data={formatNodeDate(node?.enrolled_on)}
        />
        <Info
          header={t('last-check')}
          data={formatNodeDate(node?.last_checkin)}
        />
        <Info header={t('last-ip-address')} data={node?.last_ip} />
        <Info
          header={t('created-at')}
          data={formatNodeDate(node?.created_at)}
        />
        <Info
          header={t('updated-at')}
          data={formatNodeDate(node?.updated_at)}
        />
      </Section>

      <Section
        title={t('system-information')}
        description={t('system-information-desc')}
      >
        <Info
          header={t('board-model')}
          data={node?.node_info?.system_info?.board_model}
        />
        <Info
          header={t('board-serial')}
          data={node?.node_info?.system_info?.board_serial}
        />
        <Info
          header={t('board-vendor')}
          data={node?.node_info?.system_info?.board_vendor}
        />
        <Info
          header={t('board-version')}
          data={node?.node_info?.system_info?.board_version}
        />
        <Info
          header={t('computer-name')}
          data={node?.node_info?.system_info?.computer_name}
        />
        <Info
          header={t('cpu-brand')}
          data={node?.node_info?.system_info?.cpu_brand}
        />
        <Info
          header={t('cpu-logical')}
          data={node?.node_info?.system_info?.cpu_logical_cores}
        />
        <Info
          header={t('cpu-microcode')}
          data={node?.node_info?.system_info?.cpu_microcode}
        />
        <Info
          header={t('cpu-physical-cores')}
          data={node?.node_info?.system_info?.cpu_physical_cores}
        />
        <Info
          header={t('cpu-socket')}
          data={node?.node_info?.system_info?.cpu_sockets}
        />
        <Info
          header={t('cpu-subtype')}
          data={node?.node_info?.system_info?.cpu_subtype}
        />
        <Info
          header={t('cpu-type')}
          data={node?.node_info?.system_info?.cpu_type}
        />
        <Info
          header={t('hardware-model')}
          data={node?.node_info?.system_info?.hardware_model}
        />
        <Info
          header={t('hardware-serial')}
          data={node?.node_info?.system_info?.hardware_serial}
        />
        <Info
          header={t('hardware-vendor')}
          data={node?.node_info?.system_info?.hardware_vendor}
        />
        <Info
          header={t('hardware-version')}
          data={node?.node_info?.system_info?.hardware_version}
        />
        <Info
          header={t('hostname')}
          data={node?.node_info?.system_info?.hostname}
        />
        <Info
          header={t('local-hostname')}
          data={node?.node_info?.system_info?.local_hostname}
        />
        <Info
          header={t('physical-memory')}
          data={node?.node_info?.system_info?.physical_memory}
        />
        <Info header={t('uuid')} data={node?.node_info?.system_info?.uuid} />
      </Section>

      <Section
        title={t('agent-information')}
        description={t('agent-information-desc')}
      >
        <Info
          header={t('instance-id')}
          data={node?.node_info?.osquery_info?.instance_id}
        />
        <Info
          header={t('build-distro')}
          data={node?.node_info?.osquery_info?.build_distro}
        />
        <Info
          header={t('build-platform')}
          data={node?.node_info?.osquery_info?.build_platform}
        />
        <Info
          header={t('config-hash')}
          data={node?.node_info?.osquery_info?.config_hash}
        />
        <Info
          header={t('config-valid')}
          data={node?.node_info?.osquery_info?.config_valid}
        />
        <Info
          header={t('extensions')}
          data={node?.node_info?.osquery_info?.extensions}
        />
        <Info header={t('pid')} data={node?.node_info?.osquery_info?.pid} />
        <Info
          header={t('platform-mask')}
          data={node?.node_info?.osquery_info?.platform_mask}
        />
        <Info
          header={t('start-time')}
          data={node?.node_info?.osquery_info?.start_time}
        />
        <Info header={t('uuid')} data={node?.node_info?.osquery_info?.uuid} />
        <Info
          header={t('version')}
          data={node?.node_info?.osquery_info?.version}
        />
        <Info
          header={t('watcher')}
          data={node?.node_info?.osquery_info?.watcher}
        />
      </Section>

      <Section
        title={t('platform-information')}
        description={t('platform-information-desc')}
      >
        <Info
          header={t('address')}
          data={node?.node_info?.platform_info?.address}
        />
        <Info header={t('data')} data={node?.node_info?.platform_info?.date} />
        <Info
          header={t('extra')}
          data={node?.node_info?.platform_info?.extra}
        />
        <Info
          header={t('firmware-type')}
          data={node?.node_info?.platform_info?.firmware_type}
        />
        <Info
          header={t('reversion')}
          data={node?.node_info?.platform_info?.revision}
        />
        <Info header={t('size')} data={node?.node_info?.platform_info?.size} />
        <Info
          header={t('vendor')}
          data={node?.node_info?.platform_info?.vendor}
        />
        <Info
          header={t('version')}
          data={node?.node_info?.platform_info?.version}
        />
        <Info
          header={t('volume-size')}
          data={node?.node_info?.platform_info?.volume_size}
        />
      </Section>

      <Section
        title={t('os-information')}
        description={t('os-information-desc')}
      >
        <Info header={t('id')} data={node?.node_info?.os_version?._id} />
        <Info header={t('arch')} data={node?.node_info?.os_version?.arch} />
        <Info
          header={t('codename')}
          data={node?.node_info?.os_version?.codename}
        />
        <Info header={t('major')} data={node?.node_info?.os_version?.major} />
        <Info header={t('minor')} data={node?.node_info?.os_version?.minor} />
        <Info header={t('name')} data={node?.node_info?.os_version?.name} />
        <Info header={t('patch')} data={node?.node_info?.os_version?.patch} />
        <Info
          header={t('pid-with-namespace')}
          data={node?.node_info?.os_version?.pid_with_namespace}
        />
        <Info
          header={t('platform')}
          data={node?.node_info?.os_version?.platform}
        />
        <Info
          header={t('platform-like')}
          data={node?.node_info?.os_version?.platform_like}
        />
        <Info
          header={t('version')}
          data={node?.node_info?.os_version?.version}
        />
      </Section>
    </div>
  );
};

export default NodeDetails;
