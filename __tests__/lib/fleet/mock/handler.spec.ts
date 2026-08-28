/** @jest-environment node */

import { createFleetMockHandler } from '@/lib/fleet/mock/handler';

const readJson = async <T>(response: Response): Promise<T> => response.json();

describe('Fleet mock handler', () => {
  it('returns the Fleet collections used by the UI', async () => {
    const handler = createFleetMockHandler('default');

    const [queriesResponse, packsResponse, tagsResponse, nodesResponse] =
      await Promise.all([
        handler('v1', '/manager/team-1/queries'),
        handler('v1', '/manager/team-1/packs'),
        handler('v1', '/manager/team-1/tags'),
        handler('v1', '/manager/team-1/nodes'),
      ]);

    const queries = await readJson<{ queries: unknown[] }>(queriesResponse);
    const packs = await readJson<{ packs: unknown[] }>(packsResponse);
    const tags = await readJson<{ tags: unknown[] }>(tagsResponse);
    const nodes = await readJson<{ nodes: unknown[] }>(nodesResponse);

    expect(queries.queries.length).toBeGreaterThan(0);
    expect(packs.packs.length).toBeGreaterThan(0);
    expect(tags.tags.length).toBeGreaterThan(0);
    expect(nodes.nodes.length).toBeGreaterThan(0);
  });

  it('persists create, update, and delete mutations within one session', async () => {
    const handler = createFleetMockHandler('default');
    const createResponse = await handler('v1', '/manager/team-1/query/add', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Created in unit test',
        sql: 'SELECT 1 AS mock_value;',
        interval: 3600,
        platform: 'all',
      }),
    });
    const created = await readJson<{ id: string; name: string }>(
      createResponse
    );

    await handler('v1', `/manager/team-1/query/${created.id}/update`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated in unit test' }),
    });

    const afterUpdateResponse = await handler('v1', '/manager/team-1/queries');
    const afterUpdate = await readJson<{
      queries: Array<{ id: string; name: string }>;
    }>(afterUpdateResponse);
    expect(afterUpdate.queries).toContainEqual(
      expect.objectContaining({
        id: created.id,
        name: 'Updated in unit test',
      })
    );

    await handler('v1', `/manager/team-1/query/${created.id}/delete`, {
      method: 'DELETE',
    });

    const afterDeleteResponse = await handler('v1', '/manager/team-1/queries');
    const afterDelete = await readJson<{
      queries: Array<{ id: string }>;
    }>(afterDeleteResponse);
    expect(afterDelete.queries).not.toContainEqual(
      expect.objectContaining({ id: created.id })
    );
  });

  it('persists the current pack, tag, asset, and distributor UI mutations', async () => {
    const handler = createFleetMockHandler('default');

    const createdPack = await readJson<{ id: string }>(
      await handler('v1', '/manager/team-1/pack/add', {
        method: 'POST',
        body: JSON.stringify({ name: 'Session pack' }),
      })
    );
    await handler('v1', `/manager/team-1/pack/${createdPack.id}/update`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated session pack' }),
    });
    const updatedPack = await readJson<{ name: string }>(
      await handler('v1', `/manager/team-1/pack/${createdPack.id}`)
    );
    expect(updatedPack.name).toBe('Updated session pack');
    await handler('v1', `/manager/team-1/pack/${createdPack.id}/delete`, {
      method: 'DELETE',
    });

    const createdTag = await readJson<{ id: string }>(
      await handler('v1', '/manager/team-1/tag/add', {
        method: 'POST',
        body: JSON.stringify({ tags: 'session-tag' }),
      })
    );
    await handler('v1', `/manager/team-1/tag/${createdTag.id}/update`, {
      method: 'PUT',
      body: JSON.stringify({ value: 'updated-session-tag' }),
    });
    const updatedTag = await readJson<{ value: string }>(
      await handler('v1', `/manager/team-1/tag/${createdTag.id}`)
    );
    expect(updatedTag.value).toBe('updated-session-tag');
    await handler('v1', `/manager/team-1/tag/${createdTag.id}/delete`, {
      method: 'DELETE',
    });

    const initialNodes = await readJson<{
      nodes: Array<{ id: string; node_key: string }>;
    }>(await handler('v1', '/manager/team-1/nodes'));
    const node = initialNodes.nodes[0];
    await handler('v1', '/manager/team-1/queries/distributed/add', {
      method: 'POST',
      body: JSON.stringify({
        sql: 'SELECT hostname FROM system_info;',
        nodes: [node.node_key],
      }),
    });
    const distributorCollection = await readJson<{
      tasks: Array<{ distributed_query: { id: string; sql: string } }>;
    }>(await handler('v1', '/manager/team-1/queries/distributed'));
    const createdTask = distributorCollection.tasks.find(
      ({ distributed_query }) =>
        distributed_query.sql === 'SELECT hostname FROM system_info;'
    );
    expect(createdTask).toBeDefined();
    await handler(
      'v1',
      `/manager/team-1/queries/distributed/delete/${createdTask?.distributed_query.id}`,
      { method: 'DELETE' }
    );

    await handler('v1', `/manager/team-1/node/${node.id}/delete`, {
      method: 'DELETE',
    });
    const remainingNodes = await readJson<{
      nodes: Array<{ id: string }>;
    }>(await handler('v1', '/manager/team-1/nodes'));
    expect(remainingNodes.nodes).not.toContainEqual(
      expect.objectContaining({ id: node.id })
    );
  });

  it('returns empty collections in the empty scenario', async () => {
    const handler = createFleetMockHandler('empty');
    const queriesResponse = await handler('v1', '/manager/team-1/queries');
    const nodesResponse = await handler('v1', '/manager/team-1/nodes');

    await expect(readJson(queriesResponse)).resolves.toEqual({ queries: [] });
    await expect(readJson(nodesResponse)).resolves.toEqual({ nodes: [] });
  });

  it('returns a simulated 503 response in the error scenario', async () => {
    const handler = createFleetMockHandler('error');
    const response = await handler('v1', '/manager/team-1/queries');
    const body = await readJson<{ error: { message: string } }>(response);

    expect(response.status).toBe(503);
    expect(body.error.message).toContain('simulated service unavailable');
  });

  it('fails clearly for an unknown endpoint without a real-backend fallback', async () => {
    const handler = createFleetMockHandler('default');

    await expect(
      handler('v2', '/manager/team-1/not-implemented')
    ).rejects.toThrow(
      'Fleet mock has no handler for GET /api/v2/manager/team-1/not-implemented'
    );
  });
});
