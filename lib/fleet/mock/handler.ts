import type {
  DistributedQuery,
  DistributedQueryTask,
  Pack,
  Query,
  Tag,
} from '@/types/fleet';
import {
  createFleetMockFixtures,
  refreshFleetMockRelationships,
  type FleetMockState,
  type MockQueryResult,
} from './fixtures';
import { getFleetMockScenario, type FleetMockScenario } from './config';
import { createMockFleetUser, mockFleetConnection } from './identity';

export type FleetApiVersion = 'v1' | 'v2';

export type FleetMockHandler = (
  version: FleetApiVersion,
  endpoint: string,
  options?: RequestInit
) => Promise<Response>;

export type FleetPlatformMockHandler = (
  endpoint: string,
  options?: RequestInit
) => Promise<Response>;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const notFoundResponse = (resource: string, id: string) =>
  jsonResponse(
    { error: { message: `Fleet mock ${resource} not found: ${id}` } },
    404
  );

const parseJsonBody = (options?: RequestInit): Record<string, unknown> => {
  if (!options?.body) return {};

  if (typeof options.body !== 'string') {
    throw new Error('Fleet mock only accepts JSON string request bodies');
  }

  try {
    return JSON.parse(options.body) as Record<string, unknown>;
  } catch {
    throw new Error('Fleet mock received an invalid JSON request body');
  }
};

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const selectTags = (state: FleetMockState, value: unknown) => {
  const selected = new Set(toStringList(value));
  return state.tags.filter(
    (tag) => selected.has(tag.id) || selected.has(tag.value)
  );
};

const selectPacks = (state: FleetMockState, value: unknown) => {
  const selected = new Set(toStringList(value));
  return state.packs.filter((pack) => selected.has(pack.id));
};

const updateDerivedStats = (state: FleetMockState) => {
  const tasks = state.distributorTasks;
  state.taskAnalysis = {
    total_queries_task: tasks.length,
    new_queries_task: tasks.filter(({ status }) => status === 0).length,
    pending_queries_task: tasks.filter(({ status }) => status === 1).length,
    completed_queries_task: tasks.filter(({ status }) => status === 2).length,
    failed_queries_task: tasks.filter(({ status }) => status === 3).length,
  };
  state.resultAnalysis = {
    total_queries_result: state.queryResults.length,
  };
  state.auditorStats = {
    ...state.auditorStats,
    total_nodes: state.nodes.length,
    active_nodes: state.nodes.filter(({ is_active }) => is_active).length,
    inactive_nodes: state.nodes.filter(({ is_active }) => !is_active).length,
    total_tasks: tasks.length,
    new_tasks: state.taskAnalysis.new_queries_task,
    pending_tasks: state.taskAnalysis.pending_queries_task,
    completed_tasks: state.taskAnalysis.completed_queries_task,
    failed_tasks: state.taskAnalysis.failed_queries_task,
    total_query_results: state.queryResults.length,
    platform_counts: state.nodes.reduce<Record<string, number>>(
      (counts, node) => {
        const platform =
          node.node_info?.osquery_info.build_platform || 'unknown';
        counts[platform] = (counts[platform] || 0) + 1;
        return counts;
      },
      {}
    ),
  };
};

const serializeQueryResult = (result: MockQueryResult) => ({
  id: result.id,
  query_name: result.query_name,
  display_query_name: result.display_query_name,
  timestamp: result.timestamp,
  action: result.action,
  columns: result.columns,
  node: result.node,
});

const pagination = (total: number) => ({
  alignment: 'center',
  bs_version: '5',
  display_msg: `Fleet mock records: ${total}`,
  page: '1',
  per_page: String(Math.max(total, 1)),
  record_name: 'records',
  show_single_page: true,
  total: String(total),
});

const buildDistributedResult = (
  state: FleetMockState,
  distributedId: string
) => {
  const tasks = state.distributorTasks.filter(
    (task) => task.distributed_query.id === distributedId
  );
  const distributedQuery = tasks[0]?.distributed_query;

  if (!distributedQuery) return null;

  const fallbackQuery: Query = {
    id: distributedQuery.id,
    created_at: distributedQuery.created_at,
    updated_at: distributedQuery.updated_at,
    team: distributedQuery.team,
    name: 'Fleet mock distributed query',
    sql: distributedQuery.sql,
    interval: 0,
    platform: 'all',
    version: '1',
    description: distributedQuery.description || '',
    value: '1',
    packs: [],
    tags: distributedQuery.tags || [],
    removed: false,
    shard: 1,
  };
  const query = state.queries[0]
    ? {
        ...state.queries[0],
        id: distributedQuery.id,
        name: 'Fleet mock distributed query',
        sql: distributedQuery.sql,
      }
    : fallbackQuery;
  const results = state.distributedResults[distributedId] || [];

  return {
    distributed_id: distributedId,
    pagination: pagination(results.length),
    query,
    results,
    status: 'complete',
    tasks,
  };
};

export const createFleetMockHandler = (
  scenario: FleetMockScenario,
  state = createFleetMockFixtures(scenario)
): FleetMockHandler => {
  let sequence = 1000;
  const nextId = (prefix: string) => `mock-${prefix}-${++sequence}`;

  return async (version, endpoint, options) => {
    const method = (options?.method || 'GET').toUpperCase();
    const url = new URL(endpoint, 'https://fleet-mock.example.test');
    const { pathname, searchParams } = url;

    if (scenario === 'error') {
      return jsonResponse(
        {
          error: {
            message: `Fleet mock simulated service unavailable for ${method} /api/${version}${pathname}`,
          },
        },
        503
      );
    }

    const teamMatch = pathname.match(/^\/team\/([^/]+)$/);
    if (method === 'GET' && teamMatch) {
      return jsonResponse({
        ...state.team,
        id: decodeURIComponent(teamMatch[1]),
      });
    }

    if (method === 'POST' && pathname === '/team/create') {
      const body = parseJsonBody(options);
      state.team = {
        ...state.team,
        id: typeof body.id === 'string' ? body.id : state.team.id,
        name: typeof body.name === 'string' ? body.name : state.team.name,
      };
      return jsonResponse({
        ...state.team,
        user_id: state.team.user.id,
        members: [],
        secret: state.secret,
        created_at: '2026-01-12T09:00:00.000Z',
        updated_at: new Date().toISOString(),
      });
    }

    if (method === 'POST' && pathname === '/account/access') {
      return jsonResponse({
        msg: 'Fleet mock access granted',
        access_token: 'FLEET_MOCK_JWT_ACCESS_TOKEN_NOT_REAL',
        refresh_token: 'FLEET_MOCK_JWT_REFRESH_TOKEN_NOT_REAL',
        user: createMockFleetUser(),
        fleet_access: state.access,
        is_temporary_password: false,
      });
    }

    if (method === 'GET' && pathname === '/account/access/verify') {
      return jsonResponse(state.access);
    }

    if (method === 'POST' && pathname === '/account/create') {
      return jsonResponse({ msg: 'Fleet mock account created' }, 201);
    }

    const secretMatch = pathname.match(
      /^\/fleet\/teams\/([^/]+)\/secret(\/renew)?$/
    );
    if (secretMatch) {
      const teamId = decodeURIComponent(secretMatch[1]);

      if (method === 'GET') {
        return jsonResponse({ ...state.secret, team_id: teamId });
      }
      if (method === 'POST' && secretMatch[2] === '/renew') {
        state.secret = {
          ...state.secret,
          secret: `FLEET_MOCK_RENEWED_SECRET_${++sequence}_NOT_REAL`,
          team_id: teamId,
          updated_at: new Date().toISOString(),
        };
        return jsonResponse(state.secret);
      }
      if (method === 'POST' && !secretMatch[2]) {
        state.secret = { ...state.secret, team_id: teamId };
        return jsonResponse(state.secret, 201);
      }
      if (method === 'DELETE' && !secretMatch[2]) {
        state.secret = { ...state.secret, secret: '', team_id: teamId };
        return jsonResponse({ msg: 'Fleet mock secret deleted' });
      }
    }

    const queriesMatch = pathname.match(/^\/manager\/([^/]+)\/queries$/);
    if (method === 'GET' && queriesMatch) {
      return jsonResponse({ queries: state.queries });
    }

    const queryAddMatch = pathname.match(/^\/manager\/([^/]+)\/query\/add$/);
    if (method === 'POST' && queryAddMatch) {
      const body = parseJsonBody(options);
      const now = new Date().toISOString();
      const query: Query = {
        id: nextId('query'),
        created_at: now,
        updated_at: now,
        team: state.team,
        name: String(body.name || 'Untitled Fleet mock query'),
        sql: String(body.sql || 'SELECT 1;'),
        interval: Number(body.interval || 3600),
        platform: String(body.platform || 'all'),
        version: String(body.version || '1'),
        description: String(body.description || ''),
        value: String(body.value || '1'),
        packs: selectPacks(state, body.packs),
        tags: selectTags(state, body.tags),
        removed: Boolean(body.removed),
        shard: Number(body.shard || 1),
      };
      state.queries.push(query);
      refreshFleetMockRelationships(state);
      return jsonResponse(query, 201);
    }

    const queryItemMatch = pathname.match(
      /^\/manager\/([^/]+)\/query\/([^/]+)(\/update|\/delete)?$/
    );
    if (queryItemMatch) {
      const queryId = decodeURIComponent(queryItemMatch[2]);
      const query = state.queries.find(({ id }) => id === queryId);
      if (!query) return notFoundResponse('query', queryId);

      if (method === 'GET' && !queryItemMatch[3]) {
        return jsonResponse(query);
      }
      if (method === 'PUT' && queryItemMatch[3] === '/update') {
        const body = parseJsonBody(options);
        const fields: Array<keyof Query> = [
          'name',
          'sql',
          'interval',
          'platform',
          'version',
          'description',
          'value',
          'removed',
          'shard',
        ];
        fields.forEach((field) => {
          if (body[field] !== undefined) {
            (query as unknown as Record<string, unknown>)[field] = body[field];
          }
        });
        if (body.packs !== undefined)
          query.packs = selectPacks(state, body.packs);
        if (body.tags !== undefined) query.tags = selectTags(state, body.tags);
        query.updated_at = new Date().toISOString();
        refreshFleetMockRelationships(state);
        return jsonResponse(query);
      }
      if (method === 'DELETE' && queryItemMatch[3] === '/delete') {
        state.queries = state.queries.filter(({ id }) => id !== queryId);
        state.queryResults = state.queryResults.filter(
          ({ query_id }) => query_id !== queryId
        );
        refreshFleetMockRelationships(state);
        updateDerivedStats(state);
        return jsonResponse({ msg: 'Fleet mock query deleted', id: queryId });
      }
    }

    const packsMatch = pathname.match(/^\/manager\/([^/]+)\/packs$/);
    if (method === 'GET' && packsMatch) {
      return jsonResponse({ packs: state.packs });
    }

    const packAddMatch = pathname.match(/^\/manager\/([^/]+)\/pack\/add$/);
    if (method === 'POST' && packAddMatch) {
      const body = parseJsonBody(options);
      const now = new Date().toISOString();
      const pack: Pack = {
        id: nextId('pack'),
        index: String(state.packs.length + 1),
        name: String(body.name || 'Untitled Fleet mock pack'),
        platform: String(body.platform || 'all'),
        version: String(body.version || '1'),
        description: String(body.description || ''),
        shard: Number(body.shard || 1),
        team: state.team,
        tags: selectTags(state, body.tags),
        created_at: now,
        updated_at: now,
      };
      state.packs.push(pack);
      refreshFleetMockRelationships(state);
      return jsonResponse(pack, 201);
    }

    const packItemMatch = pathname.match(
      /^\/manager\/([^/]+)\/pack\/([^/]+)(\/update|\/delete)?$/
    );
    if (packItemMatch) {
      const packId = decodeURIComponent(packItemMatch[2]);
      const pack = state.packs.find(({ id }) => id === packId);
      if (!pack) return notFoundResponse('pack', packId);

      if (method === 'GET' && !packItemMatch[3]) {
        return jsonResponse({
          ...pack,
          queries: state.queries.filter((query) =>
            query.packs?.some(({ id }) => id === packId)
          ),
        });
      }
      if (method === 'PUT' && packItemMatch[3] === '/update') {
        const body = parseJsonBody(options);
        const fields: Array<keyof Pack> = [
          'name',
          'platform',
          'version',
          'description',
          'shard',
        ];
        fields.forEach((field) => {
          if (body[field] !== undefined) {
            (pack as unknown as Record<string, unknown>)[field] = body[field];
          }
        });
        if (body.tags !== undefined) pack.tags = selectTags(state, body.tags);
        pack.updated_at = new Date().toISOString();
        refreshFleetMockRelationships(state);
        return jsonResponse(pack);
      }
      if (method === 'DELETE' && packItemMatch[3] === '/delete') {
        state.packs = state.packs.filter(({ id }) => id !== packId);
        refreshFleetMockRelationships(state);
        return jsonResponse({ msg: 'Fleet mock pack deleted', id: packId });
      }
    }

    const tagsMatch = pathname.match(/^\/manager\/([^/]+)\/tags$/);
    if (method === 'GET' && tagsMatch) {
      return jsonResponse({ tags: state.tags });
    }

    const tagAddMatch = pathname.match(/^\/manager\/([^/]+)\/tag\/add$/);
    if (method === 'POST' && tagAddMatch) {
      const body = parseJsonBody(options);
      const values = toStringList(body.tags ?? body.value);
      const now = new Date().toISOString();
      const created = values.map<Tag>((value) => ({
        id: nextId('tag'),
        created_at: now,
        updated_at: now,
        team: state.team,
        value,
        packs_count: 0,
        nodes_count: 0,
        queries_count: 0,
        file_paths_count: 0,
      }));
      state.tags.push(...created);
      refreshFleetMockRelationships(state);
      return jsonResponse(
        created.length === 1 ? created[0] : { tags: created },
        201
      );
    }

    const tagItemMatch = pathname.match(
      /^\/manager\/([^/]+)\/tag\/([^/]+)(\/update|\/delete)?$/
    );
    if (tagItemMatch) {
      const tagId = decodeURIComponent(tagItemMatch[2]);
      const tag = state.tags.find(({ id }) => id === tagId);
      if (!tag) return notFoundResponse('tag', tagId);

      if (method === 'GET' && !tagItemMatch[3]) {
        return jsonResponse({
          ...tag,
          packs: state.packs.filter((pack) =>
            pack.tags?.some(({ id }) => id === tagId)
          ),
          queries: state.queries.filter((query) =>
            query.tags?.some(({ id }) => id === tagId)
          ),
        });
      }
      if (method === 'PUT' && tagItemMatch[3] === '/update') {
        const body = parseJsonBody(options);
        if (body.value !== undefined) tag.value = String(body.value);
        tag.updated_at = new Date().toISOString();
        refreshFleetMockRelationships(state);
        return jsonResponse(tag);
      }
      if (method === 'DELETE' && tagItemMatch[3] === '/delete') {
        state.tags = state.tags.filter(({ id }) => id !== tagId);
        refreshFleetMockRelationships(state);
        return jsonResponse({ msg: 'Fleet mock tag deleted', id: tagId });
      }
    }

    const nodesMatch = pathname.match(
      /^\/manager\/([^/]+)\/nodes(?:\/(active|inactive))?(?:\/\d+)?(?:\/\d+)?$/
    );
    if (method === 'GET' && nodesMatch) {
      const status = nodesMatch[2];
      const nodes = status
        ? state.nodes.filter(({ is_active }) =>
            status === 'active' ? is_active : !is_active
          )
        : state.nodes;
      return jsonResponse({ nodes });
    }

    const nodeLogDeleteMatch = pathname.match(
      /^\/manager\/([^/]+)\/node\/([^/]+)\/delete\/log\/([^/]+)$/
    );
    if (method === 'DELETE' && nodeLogDeleteMatch) {
      const nodeId = decodeURIComponent(nodeLogDeleteMatch[2]);
      const logId = decodeURIComponent(nodeLogDeleteMatch[3]);
      const node = state.nodes.find(({ id }) => id === nodeId);
      if (!node) return notFoundResponse('node', nodeId);
      node.status_logs = node.status_logs.filter(({ id }) => id !== logId);
      return jsonResponse({ msg: 'Fleet mock status log deleted', id: logId });
    }

    const nodeResultDeleteMatch = pathname.match(
      /^\/manager\/([^/]+)\/node\/([^/]+)\/delete\/result\/([^/]+)$/
    );
    if (method === 'DELETE' && nodeResultDeleteMatch) {
      const nodeId = decodeURIComponent(nodeResultDeleteMatch[2]);
      const resultId = decodeURIComponent(nodeResultDeleteMatch[3]);
      state.queryResults = state.queryResults.filter(
        (result) => !(result.id === resultId && result.node?.id === nodeId)
      );
      updateDerivedStats(state);
      return jsonResponse({
        msg: 'Fleet mock query result deleted',
        id: resultId,
      });
    }

    const nodeLogsMatch = pathname.match(
      /^\/manager\/([^/]+)\/node\/([^/]+)\/logs(?:\/\d+)?$/
    );
    if (method === 'GET' && nodeLogsMatch) {
      const nodeId = decodeURIComponent(nodeLogsMatch[2]);
      const node = state.nodes.find(({ id }) => id === nodeId);
      if (!node) return notFoundResponse('node', nodeId);
      return jsonResponse({
        node,
        status_logs: node.status_logs,
        pagination: pagination(node.status_logs.length),
      });
    }

    const nodeActivityMatch = pathname.match(
      /^\/manager\/([^/]+)\/node\/([^/]+)\/activity$/
    );
    if (method === 'GET' && nodeActivityMatch) {
      const nodeId = decodeURIComponent(nodeActivityMatch[2]);
      const node = state.nodes.find(({ id }) => id === nodeId);
      if (!node) return notFoundResponse('node', nodeId);
      const results = state.queryResults.filter(
        (result) => result.node?.id === nodeId
      );
      return jsonResponse({
        node,
        recent: node.result_logs,
        queries: results.map((result) => ({
          guid: `MOCK-ACTIVITY-${result.id}`,
          status: result.action === 'failed' ? 3 : 2,
          timestamp: result.timestamp,
          distributed_query: {
            id: result.query_id,
            sql: state.queries.find(({ id }) => id === result.query_id)?.sql,
            description: 'Fleet mock asset activity',
          },
          results: [
            {
              id: result.id,
              timestamp: result.timestamp,
              columns: result.columns,
            },
          ],
        })),
      });
    }

    const nodeConfigMatch = pathname.match(
      /^\/manager\/([^/]+)\/node\/([^/]+)\/config$/
    );
    if (method === 'GET' && nodeConfigMatch) {
      const nodeId = decodeURIComponent(nodeConfigMatch[2]);
      const config = state.assetConfigurations[nodeId];
      return config
        ? jsonResponse(config)
        : notFoundResponse('node configuration', nodeId);
    }

    const nodeItemMatch = pathname.match(
      /^\/manager\/([^/]+)\/node\/([^/]+)(\/delete)?$/
    );
    if (nodeItemMatch) {
      const nodeId = decodeURIComponent(nodeItemMatch[2]);
      const node = state.nodes.find(({ id }) => id === nodeId);
      if (!node) return notFoundResponse('node', nodeId);

      if (method === 'GET' && !nodeItemMatch[3]) return jsonResponse(node);
      if (method === 'DELETE' && nodeItemMatch[3] === '/delete') {
        state.nodes = state.nodes.filter(({ id }) => id !== nodeId);
        state.queryResults = state.queryResults.filter(
          (result) => result.node?.id !== nodeId
        );
        state.distributorTasks = state.distributorTasks.filter(
          (task) => task.node.id !== nodeId
        );
        delete state.assetConfigurations[nodeId];
        refreshFleetMockRelationships(state);
        updateDerivedStats(state);
        return jsonResponse({ msg: 'Fleet mock node deleted', id: nodeId });
      }
    }

    const resultsSummaryMatch = pathname.match(
      /^\/manager\/([^/]+)\/results\/summary$/
    );
    if (method === 'GET' && resultsSummaryMatch) {
      const recentCutoff = Date.parse('2026-01-19T14:30:00.000Z');
      return jsonResponse({
        total_results: state.queryResults.length,
        recent_results_24h: state.queryResults.filter(
          ({ timestamp }) => Date.parse(timestamp) >= recentCutoff
        ).length,
        unique_queries: new Set(
          state.queryResults.map(({ query_id }) => query_id)
        ).size,
        unique_nodes: new Set(
          state.queryResults.map(({ node }) => node?.id).filter(Boolean)
        ).size,
      });
    }

    const resultsMatch = pathname.match(/^\/manager\/([^/]+)\/results$/);
    if (method === 'GET' && resultsMatch) {
      let results = [...state.queryResults];
      const packId = searchParams.get('pack_id');
      const queryId = searchParams.get('query_id');
      const queryName = searchParams.get('query_name');
      const nodeId = searchParams.get('node_id');
      const fromDate = searchParams.get('from_date');
      const toDate = searchParams.get('to_date');

      if (packId)
        results = results.filter((result) => result.pack_id === packId);
      if (queryId)
        results = results.filter((result) => result.query_id === queryId);
      if (queryName)
        results = results.filter((result) => result.query_name === queryName);
      if (nodeId)
        results = results.filter((result) => result.node?.id === nodeId);
      if (fromDate)
        results = results.filter(
          ({ timestamp }) => Date.parse(timestamp) >= Date.parse(fromDate)
        );
      if (toDate)
        results = results.filter(
          ({ timestamp }) => Date.parse(timestamp) <= Date.parse(toDate)
        );

      const total = results.length;
      const limit = Number(searchParams.get('limit') || 100);
      const offset = Number(searchParams.get('offset') || 0);
      return jsonResponse({
        results: results
          .slice(offset, offset + limit)
          .map(serializeQueryResult),
        total,
        limit,
        offset,
      });
    }

    const distributorDeleteResultMatch = pathname.match(
      /^\/manager\/([^/]+)\/queries\/distributed\/([^/]+)\/results\/delete\/([^/]+)$/
    );
    if (method === 'DELETE' && distributorDeleteResultMatch) {
      const distributedId = decodeURIComponent(distributorDeleteResultMatch[2]);
      const resultId = decodeURIComponent(distributorDeleteResultMatch[3]);
      state.distributedResults[distributedId] = (
        state.distributedResults[distributedId] || []
      ).filter((result) => String(result.result_id || result.id) !== resultId);
      return jsonResponse({
        msg: 'Fleet mock distributed result deleted',
        id: resultId,
      });
    }

    const distributorResultsMatch = pathname.match(
      /^\/manager\/([^/]+)\/queries\/distributed\/results\/([^/]+)(?:\/(?:new|pending|complete|failed))?(?:\/\d+)?$/
    );
    if (method === 'GET' && distributorResultsMatch) {
      const distributedId = decodeURIComponent(distributorResultsMatch[2]);
      const result = buildDistributedResult(state, distributedId);
      return result
        ? jsonResponse(result)
        : notFoundResponse('distributed query', distributedId);
    }

    const distributorAddMatch = pathname.match(
      /^\/manager\/([^/]+)\/queries\/distributed\/add$/
    );
    if (method === 'POST' && distributorAddMatch) {
      const body = parseJsonBody(options);
      const distributedId = nextId('distributor');
      const selectedNodeKeys = new Set(toStringList(body.nodes));
      const selectedNodes = state.nodes.filter(
        (node) =>
          selectedNodeKeys.has(node.id) || selectedNodeKeys.has(node.node_key)
      );
      const distributedQuery: DistributedQuery = {
        id: distributedId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        team: state.team,
        sql: String(body.sql || 'SELECT 1;'),
        description: String(body.description || 'Fleet mock distributed query'),
        not_before:
          typeof body.not_before === 'string'
            ? body.not_before
            : new Date().toISOString(),
        tags: selectTags(state, body.tags),
        total_results: 0,
      };
      const tasks: DistributedQueryTask[] = selectedNodes.map((node) => ({
        id: nextId('distributor-task'),
        created_at: distributedQuery.created_at,
        updated_at: distributedQuery.updated_at,
        guid: `FLEET_MOCK_DISTRIBUTED_GUID_${sequence}_NOT_REAL`,
        status: 0,
        timestamp: distributedQuery.not_before,
        distributed_query: distributedQuery,
        node,
        results: [],
      }));
      state.distributorTasks.push(...tasks);
      state.distributedResults[distributedId] = [];
      updateDerivedStats(state);
      return jsonResponse({ distributed_query: distributedQuery, tasks }, 201);
    }

    const distributorDeleteMatch = pathname.match(
      /^\/manager\/([^/]+)\/queries\/distributed\/delete\/([^/]+)$/
    );
    if (method === 'DELETE' && distributorDeleteMatch) {
      const distributedId = decodeURIComponent(distributorDeleteMatch[2]);
      state.distributorTasks = state.distributorTasks.filter(
        (task) => task.distributed_query.id !== distributedId
      );
      delete state.distributedResults[distributedId];
      updateDerivedStats(state);
      return jsonResponse({
        msg: 'Fleet mock distributed query deleted',
        id: distributedId,
      });
    }

    const distributorsMatch = pathname.match(
      /^\/manager\/([^/]+)\/queries\/distributed$/
    );
    if (method === 'GET' && distributorsMatch) {
      return jsonResponse({ tasks: state.distributorTasks });
    }

    const analysisMatch = pathname.match(
      /^\/manager\/([^/]+)\/analysis\/(tasks|query|auditor-stats)$/
    );
    if (method === 'GET' && analysisMatch) {
      if (analysisMatch[2] === 'tasks') return jsonResponse(state.taskAnalysis);
      if (analysisMatch[2] === 'query')
        return jsonResponse(state.resultAnalysis);
      return jsonResponse(state.auditorStats);
    }

    throw new Error(
      `Fleet mock has no handler for ${method} /api/${version}${pathname}. Add the endpoint to lib/fleet/mock/handler.ts; real Fleet fallback is disabled in mock mode.`
    );
  };
};

export const createFleetPlatformMockHandler = (
  scenario: FleetMockScenario,
  state = createFleetMockFixtures(scenario)
): FleetPlatformMockHandler => {
  let secretSequence = 2000;

  return async (endpoint, options) => {
    const method = (options?.method || 'GET').toUpperCase();
    const url = new URL(endpoint, 'https://platform-mock.example.test');
    const { pathname, searchParams } = url;

    if (method === 'GET' && pathname === '/api/fleet/access/verify') {
      return state.access.is_active
        ? jsonResponse(state.access)
        : jsonResponse(
            { error: { message: 'Fleet mock access is not configured' } },
            401
          );
    }

    if (pathname === '/api/fleet/connection') {
      if (method === 'GET' || method === 'POST') {
        return jsonResponse(mockFleetConnection);
      }
    }

    if (pathname === '/api/fleet/secret') {
      const teamId = searchParams.get('teamId') || state.team.id;

      if (method === 'GET') {
        return state.secret.secret
          ? jsonResponse({ ...state.secret, team_id: teamId })
          : jsonResponse(
              { error: { message: 'Fleet mock secret not found' } },
              404
            );
      }
      if (method === 'DELETE') {
        state.secret = { ...state.secret, secret: '', team_id: teamId };
        return jsonResponse({ msg: 'Fleet mock secret deleted' });
      }
    }

    if (method === 'POST' && pathname === '/api/fleet/bootstrap') {
      const body = parseJsonBody(options);
      const teamId =
        typeof body.teamId === 'string' ? body.teamId : state.team.id;
      const fleetToken = 'FLEET_MOCK_BOOTSTRAP_TOKEN_NOT_REAL';
      const updatedAt = new Date().toISOString();

      state.access = {
        ...state.access,
        is_active: true,
        is_expired: false,
        secret_key: fleetToken,
        updated_at: updatedAt,
      };
      state.secret = {
        ...state.secret,
        id: `mock-fleet-secret-${++secretSequence}`,
        secret: `FLEET_MOCK_BOOTSTRAP_SECRET_${secretSequence}_NOT_REAL`,
        team_id: teamId,
        updated_at: updatedAt,
      };

      return jsonResponse({
        success: true,
        fleetToken,
        secret: { id: state.secret.id, secret: state.secret.secret },
      });
    }

    if (method === 'GET' && pathname === '/api/fleet/check-account') {
      return jsonResponse({ exists: state.access.is_active });
    }

    throw new Error(
      `Fleet platform mock has no handler for ${method} ${pathname}. Add the endpoint to lib/fleet/mock/handler.ts; real platform fallback is disabled in mock mode.`
    );
  };
};

let activeScenario: FleetMockScenario | undefined;
let activeFleetHandler: FleetMockHandler | undefined;
let activePlatformHandler: FleetPlatformMockHandler | undefined;

const ensureActiveHandlers = () => {
  const scenario = getFleetMockScenario();

  if (
    !activeFleetHandler ||
    !activePlatformHandler ||
    activeScenario !== scenario
  ) {
    const state = createFleetMockFixtures(scenario);
    activeScenario = scenario;
    activeFleetHandler = createFleetMockHandler(scenario, state);
    activePlatformHandler = createFleetPlatformMockHandler(scenario, state);
  }

  return { fleet: activeFleetHandler, platform: activePlatformHandler };
};

export const handleFleetMockRequest: FleetMockHandler = async (
  version,
  endpoint,
  options
) => {
  const { fleet } = ensureActiveHandlers();

  return fleet(version, endpoint, options);
};

export const handleFleetPlatformMockRequest: FleetPlatformMockHandler = async (
  endpoint,
  options
) => {
  const { platform } = ensureActiveHandlers();

  return platform(endpoint, options);
};
