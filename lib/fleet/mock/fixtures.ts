import type {
  DistributedQueryTask,
  FleetAccess,
  FleetSecret,
  FleetTeam,
  NodeWithRelationships,
  Pack,
  Query,
  StatusLog,
  Tag,
  TaskAnalysis,
  TaskResultAnalysis,
} from '@/types/fleet';
import type { FleetMockScenario } from './config';
import {
  createMockFleetAccess,
  createMockFleetMember,
  createMockFleetSecret,
  createMockFleetTeam,
} from './identity';

const CREATED_AT = '2026-01-12T09:00:00.000Z';
const UPDATED_AT = '2026-01-20T14:30:00.000Z';

export interface MockQueryResult {
  id: string;
  query_id: string;
  pack_id?: string;
  query_name: string;
  display_query_name?: string;
  timestamp: string;
  action: string;
  columns: Record<string, unknown>;
  node: {
    id: string;
    node_key?: string;
    host_identifier: string;
    display_name: string;
    owner: {
      id: string;
      role?: string;
      user: {
        id?: string;
        firstname?: string;
        lastname?: string;
        email?: string;
      };
    };
  } | null;
}

export interface MockAuditorStats {
  total_nodes: number;
  active_nodes: number;
  inactive_nodes: number;
  platform_counts: Record<string, number>;
  total_tasks: number;
  new_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  total_query_results: number;
}

export interface FleetMockState {
  team: FleetTeam;
  access: FleetAccess;
  secret: FleetSecret;
  queries: Query[];
  packs: Pack[];
  tags: Tag[];
  nodes: NodeWithRelationships[];
  distributorTasks: DistributedQueryTask[];
  distributedResults: Record<string, Array<Record<string, unknown>>>;
  queryResults: MockQueryResult[];
  assetConfigurations: Record<string, Record<string, unknown>>;
  taskAnalysis: TaskAnalysis;
  resultAnalysis: TaskResultAnalysis;
  auditorStats: MockAuditorStats;
}

const makeTag = (team: FleetTeam, index: number, value: string): Tag => ({
  id: `mock-tag-${index}`,
  created_at: CREATED_AT,
  updated_at: UPDATED_AT,
  team,
  value,
  packs_count: 0,
  nodes_count: 0,
  queries_count: 0,
  file_paths_count: index === 1 ? 3 : 0,
});

const makePack = (
  team: FleetTeam,
  index: number,
  name: string,
  tags: Tag[],
  description: string
): Pack => ({
  id: `mock-pack-${index}`,
  index: String(index),
  name,
  platform: index === 1 ? 'all' : 'linux',
  version: '1',
  description,
  shard: 1,
  team,
  tags,
  created_at: CREATED_AT,
  updated_at: UPDATED_AT,
});

const makeQuery = ({
  team,
  index,
  name,
  sql,
  platform,
  tags,
  packs,
  description,
}: {
  team: FleetTeam;
  index: number;
  name: string;
  sql: string;
  platform: string;
  tags: Tag[];
  packs: Pack[];
  description: string;
}): Query => ({
  id: `mock-query-${index}`,
  created_at: CREATED_AT,
  updated_at: UPDATED_AT,
  team,
  name,
  sql,
  interval: index % 2 === 0 ? 21600 : 3600,
  platform,
  version: '1',
  description,
  value: '1',
  packs,
  tags,
  removed: false,
  shard: 1,
});

const makeStatusLogs = (nodeIndex: number): StatusLog[] => [
  {
    id: `mock-status-log-${nodeIndex}-1`,
    filename: 'osqueryd.INFO',
    line: 41,
    message: 'Fleet mock: scheduled queries loaded successfully',
    created_at: '2026-01-20T14:28:00.000Z',
    updated_at: '2026-01-20T14:28:00.000Z',
  },
  {
    id: `mock-status-log-${nodeIndex}-2`,
    filename: 'osqueryd.INFO',
    line: 57,
    message: 'Fleet mock: distributed query completed',
    created_at: '2026-01-20T14:29:00.000Z',
    updated_at: '2026-01-20T14:29:00.000Z',
  },
];

const makeNode = ({
  team,
  index,
  tags,
  longHostname = false,
}: {
  team: FleetTeam;
  index: number;
  tags: Tag[];
  longHostname?: boolean;
}): NodeWithRelationships => {
  const platforms = ['linux', 'darwin', 'windows'];
  const platform = platforms[(index - 1) % platforms.length];
  const hostname = longHostname
    ? `mock-mobile-layout-validation-hostname-${'very-long-segment-'.repeat(6)}${index}.example.test`
    : `mock-${platform}-asset-${String(index).padStart(2, '0')}.example.test`;
  const statusLogs = makeStatusLogs(index);

  return {
    id: `mock-node-${index}`,
    created_at: CREATED_AT,
    updated_at: UPDATED_AT,
    team,
    owner: createMockFleetMember(team.id),
    node_key: `MOCK_NODE_KEY_${String(index).padStart(4, '0')}_NOT_REAL`,
    enroll_secret: 'FLEET_MOCK_ENROLLMENT_SECRET_NOT_REAL',
    enrolled_on: '2026-01-12T10:00:00.000Z',
    host_identifier: `mock-host-identifier-${index}`,
    last_checkin: '2026-01-20T14:30:00.000Z',
    is_active: index % 3 !== 0,
    last_ip: `192.0.2.${(index % 200) + 1}`,
    tags,
    status_logs: statusLogs,
    result_logs: [
      {
        id: `mock-result-log-${index}-1`,
        name: 'mock_system_inventory',
        timestamp: '2026-01-20T14:25:00.000Z',
      },
    ],
    node_config: '{"mock":true}',
    node_info: {
      os_version: {
        _id: `mock-os-version-${index}`,
        arch: 'x86_64',
        codename: platform === 'linux' ? 'jammy' : '',
        major: platform === 'windows' ? '11' : '14',
        minor: '1',
        name:
          platform === 'darwin'
            ? 'macOS'
            : platform === 'windows'
              ? 'Windows 11'
              : 'Ubuntu',
        patch: '0',
        pid_with_namespace: '1',
        platform,
        platform_like: platform === 'linux' ? 'debian' : platform,
        version: platform === 'windows' ? '11.0.22631' : '14.1.0',
      },
      osquery_info: {
        build_distro: platform === 'linux' ? 'ubuntu' : platform,
        build_platform: platform,
        config_hash: `mock-config-hash-${index}`,
        config_valid: '1',
        extensions: 'active',
        instance_id: `mock-instance-${index}`,
        pid: String(4000 + index),
        platform_mask: '0',
        start_time: '1768900000',
        uuid: `mock-osquery-uuid-${index}`,
        version: '5.16.0',
        watcher: '4000',
      },
      platform_info: {
        address: '0x00000000',
        date: '01/01/2026',
        extra: 'Fleet mock platform information',
        firmware_type: 'uefi',
        revision: '1.0',
        size: '16777216',
        vendor: 'Fleet Mock Vendor',
        version: 'MOCK-1.0',
        volume_size: '512000000000',
      },
      system_info: {
        board_model: 'MockBoard-1',
        board_serial: `MOCK-BOARD-SERIAL-${index}`,
        board_vendor: 'Fleet Mock Hardware',
        board_version: '1.0',
        computer_name: hostname,
        cpu_brand: 'Fleet Mock Virtual CPU',
        cpu_logical_cores: '8',
        cpu_microcode: 'mock',
        cpu_physical_cores: '4',
        cpu_sockets: '1',
        cpu_subtype: '0',
        cpu_type: 'x86_64',
        hardware_model: 'Mock Workstation',
        hardware_serial: `MOCK-HARDWARE-SERIAL-${index}`,
        hardware_vendor: 'Fleet Mock Hardware',
        hardware_version: '1.0',
        hostname,
        local_hostname: hostname,
        physical_memory: '17179869184',
        uuid: `mock-system-uuid-${index}`,
      },
    },
  };
};

const createAssetConfiguration = (
  node: NodeWithRelationships,
  queries: Query[],
  packs: Pack[]
): Record<string, unknown> => ({
  options: {
    host_identifier: 'uuid',
    logger_plugin: 'tls',
    logger_tls_endpoint: '/api/logger',
    logger_tls_period: 5,
    mock_notice: 'This is a synthetic Fleet mock configuration.',
  },
  packs: Object.fromEntries(
    packs.map((pack) => [
      pack.name,
      {
        discovery: ['SELECT 1;'],
        queries: Object.fromEntries(
          queries
            .filter((query) => query.packs?.some(({ id }) => id === pack.id))
            .map((query) => [
              query.name,
              { query: query.sql, interval: query.interval },
            ])
        ),
      },
    ])
  ),
  schedule: Object.fromEntries(
    queries
      .slice(0, 3)
      .map((query) => [
        query.name,
        { query: query.sql, interval: query.interval },
      ])
  ),
  node_key: node.node_key,
});

const createResultNode = (node: NodeWithRelationships) => ({
  id: node.id,
  node_key: node.node_key,
  host_identifier: node.host_identifier || node.node_key,
  display_name:
    node.node_info?.system_info.computer_name ||
    node.host_identifier ||
    node.node_key,
  owner: {
    id: node.owner.id,
    role: node.owner.role,
    user: {
      id: node.owner.user.id,
      firstname: node.owner.user.firstname,
      lastname: node.owner.user.lastname,
      email: node.owner.user.email,
    },
  },
});

const createQueryResults = (
  queries: Query[],
  nodes: NodeWithRelationships[]
): MockQueryResult[] => {
  if (!queries.length || !nodes.length) return [];

  return [
    {
      id: 'mock-query-result-1',
      query_id: queries[0].id,
      pack_id: queries[0].packs?.[0]?.id,
      query_name: queries[0].name,
      display_query_name: `query: ${queries[0].name}`,
      timestamp: '2026-01-20T14:25:00.000Z',
      action: 'snapshot',
      columns: {
        hostname: nodes[0].node_info?.system_info.hostname,
        cpu_brand: 'Fleet Mock Virtual CPU',
        physical_memory: '17179869184',
      },
      node: createResultNode(nodes[0]),
    },
    {
      id: 'mock-query-result-2',
      query_id: queries[Math.min(1, queries.length - 1)].id,
      pack_id: queries[Math.min(1, queries.length - 1)].packs?.[0]?.id,
      query_name: queries[Math.min(1, queries.length - 1)].name,
      timestamp: '2026-01-20T13:25:00.000Z',
      action: 'added',
      columns: {
        name: 'mock-process',
        path: '/opt/fleet-mock/bin/mock-process',
        pid: '4242',
      },
      node: createResultNode(nodes[Math.min(1, nodes.length - 1)]),
    },
    {
      id: 'mock-query-result-3',
      query_id: queries[0].id,
      pack_id: queries[0].packs?.[0]?.id,
      query_name: queries[0].name,
      timestamp: '2026-01-19T11:15:00.000Z',
      action: 'failed',
      columns: { error: 'Fleet mock simulated query failure' },
      node: createResultNode(nodes[0]),
    },
  ];
};

const createDistributorFixtures = (
  team: FleetTeam,
  tags: Tag[],
  nodes: NodeWithRelationships[]
) => {
  if (!nodes.length) {
    return {
      tasks: [] as DistributedQueryTask[],
      results: {} as Record<string, Array<Record<string, unknown>>>,
    };
  }

  const distributedQuery = {
    id: 'mock-distributor-1',
    created_at: '2026-01-20T12:00:00.000Z',
    updated_at: '2026-01-20T12:05:00.000Z',
    team,
    sql: 'SELECT hostname, uuid FROM system_info;',
    description: 'Synthetic distributed inventory query',
    not_before: '2026-01-20T12:00:00.000Z',
    tags: tags.slice(0, 1),
    total_results: 2,
  };
  const tasks: DistributedQueryTask[] = nodes
    .slice(0, 2)
    .map((node, index) => ({
      id: `mock-distributor-task-${index + 1}`,
      created_at: '2026-01-20T12:00:00.000Z',
      updated_at: '2026-01-20T12:05:00.000Z',
      guid: `MOCK-DISTRIBUTED-GUID-${index + 1}-NOT-REAL`,
      status: 2,
      timestamp: '2026-01-20T12:05:00.000Z',
      distributed_query: distributedQuery,
      node,
      results: [
        {
          hostname: node.node_info?.system_info.hostname,
          uuid: node.node_info?.system_info.uuid,
        },
      ],
    }));

  return {
    tasks,
    results: {
      [distributedQuery.id]: tasks.map((task, index) => ({
        result_id: `mock-distributed-result-${index + 1}`,
        timestamp: task.timestamp,
        host_identifier: task.node.host_identifier,
        status: 'complete',
        hostname: task.node.node_info?.system_info.hostname,
        uuid: task.node.node_info?.system_info.uuid,
      })),
    },
  };
};

export const refreshFleetMockRelationships = (state: FleetMockState) => {
  const tagsById = new Map(state.tags.map((tag) => [tag.id, tag]));
  const packsById = new Map(state.packs.map((pack) => [pack.id, pack]));

  state.packs.forEach((pack) => {
    pack.tags = (pack.tags || [])
      .map((tag) => tagsById.get(tag.id))
      .filter((tag): tag is Tag => Boolean(tag));
  });
  state.queries.forEach((query) => {
    query.tags = (query.tags || [])
      .map((tag) => tagsById.get(tag.id))
      .filter((tag): tag is Tag => Boolean(tag));
    query.packs = (query.packs || [])
      .map((pack) => packsById.get(pack.id))
      .filter((pack): pack is Pack => Boolean(pack));
  });
  state.nodes.forEach((node) => {
    node.tags = (node.tags || [])
      .map((tag) => tagsById.get(tag.id))
      .filter((tag): tag is Tag => Boolean(tag));
  });
  state.tags.forEach((tag) => {
    tag.packs_count = state.packs.filter((pack) =>
      pack.tags?.some(({ id }) => id === tag.id)
    ).length;
    tag.queries_count = state.queries.filter((query) =>
      query.tags?.some(({ id }) => id === tag.id)
    ).length;
    tag.nodes_count = state.nodes.filter((node) =>
      node.tags?.some(({ id }) => id === tag.id)
    ).length;
  });
};

const calculateAuditorStats = (
  nodes: NodeWithRelationships[],
  tasks: DistributedQueryTask[],
  results: MockQueryResult[]
): MockAuditorStats => {
  const platformCounts = nodes.reduce<Record<string, number>>(
    (counts, node) => {
      const platform = node.node_info?.osquery_info.build_platform || 'unknown';
      counts[platform] = (counts[platform] || 0) + 1;
      return counts;
    },
    {}
  );

  return {
    total_nodes: nodes.length,
    active_nodes: nodes.filter(({ is_active }) => is_active).length,
    inactive_nodes: nodes.filter(({ is_active }) => !is_active).length,
    platform_counts: platformCounts,
    total_tasks: tasks.length,
    new_tasks: tasks.filter(({ status }) => status === 0).length,
    pending_tasks: tasks.filter(({ status }) => status === 1).length,
    completed_tasks: tasks.filter(({ status }) => status === 2).length,
    failed_tasks: tasks.filter(({ status }) => status === 3).length,
    total_query_results: results.length,
  };
};

export const createFleetMockFixtures = (
  scenario: FleetMockScenario
): FleetMockState => {
  const team = createMockFleetTeam();
  const isLongContent = scenario === 'long-content';
  const isManyRows = scenario === 'many-rows';
  const isEmpty = scenario === 'empty';
  const tagValues = isLongContent
    ? [
        `mobile-layout-tag-${'long-segment-'.repeat(12)}production-like-but-synthetic`,
        `security-validation-${'nested-label-'.repeat(10)}mock-only`,
        'fleet-mock-offline-assets',
      ]
    : ['workstations', 'security-review', 'offline-assets'];
  const tags = isEmpty
    ? []
    : tagValues.map((value, index) => makeTag(team, index + 1, value));
  const packs = isEmpty
    ? []
    : [
        makePack(
          team,
          1,
          isLongContent
            ? `Endpoint baseline pack ${'with an intentionally long name '.repeat(7)}`
            : 'Endpoint baseline',
          tags.slice(0, 2),
          'Synthetic baseline checks for Fleet mock development.'
        ),
        makePack(
          team,
          2,
          'Linux security signals',
          tags.slice(1, 2),
          'Synthetic Linux-focused checks.'
        ),
      ];
  const longSql = `SELECT si.hostname, si.cpu_brand, si.physical_memory, os.name, os.version, p.name AS process_name, p.path AS process_path FROM system_info AS si LEFT JOIN os_version AS os ON 1 = 1 LEFT JOIN processes AS p ON p.pid > 0 WHERE si.hostname LIKE '%fleet-mock%' AND p.path NOT LIKE '/definitely/not/real/%' ORDER BY p.start_time DESC LIMIT 250; -- ${'long-content-mobile-layout-check '.repeat(20)}`;
  const baseQueries = isEmpty
    ? []
    : [
        makeQuery({
          team,
          index: 1,
          name: isLongContent
            ? `Fleet mock query ${'with an intentionally long descriptive title '.repeat(8)}`
            : 'System inventory',
          sql: isLongContent ? longSql : 'SELECT * FROM system_info;',
          platform: 'all',
          tags: tags.slice(0, 1),
          packs: packs.slice(0, 1),
          description: 'Synthetic system inventory data.',
        }),
        makeQuery({
          team,
          index: 2,
          name: 'Recently started processes',
          sql: 'SELECT name, path, pid, start_time FROM processes ORDER BY start_time DESC LIMIT 25;',
          platform: 'all',
          tags: tags.slice(0, 2),
          packs,
          description: 'Synthetic process activity query.',
        }),
        makeQuery({
          team,
          index: 3,
          name: 'Linux listening ports',
          sql: 'SELECT * FROM listening_ports WHERE port > 0;',
          platform: 'linux',
          tags: tags.slice(1, 2),
          packs: packs.slice(1, 2),
          description: 'Synthetic network listener query.',
        }),
        makeQuery({
          team,
          index: 4,
          name: 'Disk encryption status',
          sql: 'SELECT * FROM disk_encryption;',
          platform: 'all',
          tags: tags.slice(1, 3),
          packs: packs.slice(0, 1),
          description: 'Synthetic disk encryption query.',
        }),
      ];
  const queries = isManyRows
    ? [
        ...baseQueries,
        ...Array.from({ length: 76 }, (_, offset) => {
          const index = offset + 5;
          return makeQuery({
            team,
            index,
            name: `Generated Fleet mock query ${String(index).padStart(3, '0')}`,
            sql: `SELECT '${index}' AS mock_row, hostname FROM system_info;`,
            platform: ['all', 'linux', 'windows', 'macos'][index % 4],
            tags: tags.length ? [tags[index % tags.length]] : [],
            packs: packs.length ? [packs[index % packs.length]] : [],
            description: 'Generated synthetic row for the many-rows scenario.',
          });
        }),
      ]
    : baseQueries;
  const nodeCount = isEmpty ? 0 : isManyRows ? 65 : 6;
  const nodes = Array.from({ length: nodeCount }, (_, offset) => {
    const index = offset + 1;
    return makeNode({
      team,
      index,
      tags: tags.length ? [tags[offset % tags.length]] : [],
      longHostname: isLongContent && index === 1,
    });
  });
  const queryResults = createQueryResults(queries, nodes);
  const distributorFixtures = createDistributorFixtures(team, tags, nodes);
  const taskAnalysis: TaskAnalysis = {
    total_queries_task: distributorFixtures.tasks.length,
    new_queries_task: distributorFixtures.tasks.filter(
      ({ status }) => status === 0
    ).length,
    pending_queries_task: distributorFixtures.tasks.filter(
      ({ status }) => status === 1
    ).length,
    completed_queries_task: distributorFixtures.tasks.filter(
      ({ status }) => status === 2
    ).length,
    failed_queries_task: distributorFixtures.tasks.filter(
      ({ status }) => status === 3
    ).length,
  };
  const state: FleetMockState = {
    team,
    access: createMockFleetAccess(),
    secret: createMockFleetSecret(team.id),
    queries,
    packs,
    tags,
    nodes,
    distributorTasks: distributorFixtures.tasks,
    distributedResults: distributorFixtures.results,
    queryResults,
    assetConfigurations: Object.fromEntries(
      nodes.map((node) => [
        node.id,
        createAssetConfiguration(node, queries, packs),
      ])
    ),
    taskAnalysis,
    resultAnalysis: { total_queries_result: queryResults.length },
    auditorStats: calculateAuditorStats(
      nodes,
      distributorFixtures.tasks,
      queryResults
    ),
  };

  refreshFleetMockRelationships(state);
  return state;
};
