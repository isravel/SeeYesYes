import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { localAdapter, createHttpAdapter, parseResponse, getRegistry, registryQueryKey, DataError } from '@/lib/data/adapter';
import { mockResponse, responseSchemas, type Endpoint } from '@/lib/data/api';
import { demoReports } from '@/lib/data/fixtures';
import { registry } from '@/lib/data/registry';
import { GET } from '@/app/api/[...path]/route';

describe('typed adapters and reproducible mock transport', () => {
  it.each(Object.keys(responseSchemas) as Endpoint[])('validates the normal %s endpoint', async endpoint => {
    const data = await localAdapter.get(endpoint, {componentId: 'button'});
    expect(responseSchemas[endpoint].safeParse(data).success).toBe(true);
  });
  it.each(['tokens', 'components', 'rules', 'validation', 'layouts'] as const)('returns empty arrays for %s without a secondary registry request', async endpoint => {
    expect(await localAdapter.get(endpoint, {scenario: 'empty'})).toEqual([]);
  });
  it.each(['registry', 'system', 'theme', 'component', 'ai-context'] as const)('uses missing-data errors for singleton %s', async endpoint => {
    await expect(localAdapter.get(endpoint, {scenario: 'empty', componentId: 'button'})).rejects.toMatchObject({code: 'MISSING_DATA', status: 404});
  });
  it('keeps unknown component IDs 404 in every scenario', async () => {
    for (const scenario of ['normal', 'empty', 'error'] as const) await expect(localAdapter.get('component', {scenario, componentId: 'unknown'})).rejects.toMatchObject({code: 'NOT_FOUND', status: 404});
  });
  it('rejects invalid success and error envelopes at the transport boundary', () => {
    expect(() => parseResponse('registry', 200, {data: {}})).toThrow();
    expect(() => parseResponse('tokens', 200, {data: [], extra: 'unexpected'})).toThrow();
    expect(() => parseResponse('registry', 503, {error: 'oops'})).toThrow();
    const s = structuredClone(registry); s.tokens[0].exampleIds.push('missing');
    expect(() => parseResponse('registry', 200, {data: s})).toThrow(/missing examples/);
  });
  it('forwards scenario and component ID through the HTTP adapter', async () => {
    const fetcher = vi.fn(async (url: string | URL | Request) => {
      expect(String(url)).toBe('/api/components/button?scenario=empty');
      const result = mockResponse('component', 'empty', 'button');
      return Response.json(result.body, {status: result.status});
    });
    await expect(createHttpAdapter(fetcher as typeof fetch).get('component', {scenario: 'empty', componentId: 'button'})).rejects.toBeInstanceOf(DataError);
  });
  it('caches registry once per version/scenario and permits explicit retry', async () => {
    const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
    const get = vi.spyOn(localAdapter, 'get');
    const adapter = localAdapter;
    const first = await getRegistry(client, adapter);
    expect(await getRegistry(client, adapter)).toBe(first);
    expect(get).toHaveBeenCalledTimes(1);
    await expect(getRegistry(client, adapter, 'error')).rejects.toMatchObject({code: 'DEMO_ERROR'});
    await expect(getRegistry(client, adapter, 'empty')).rejects.toMatchObject({code: 'MISSING_DATA'});
    expect(registryQueryKey('error')).not.toEqual(registryQueryKey('normal'));
    await client.invalidateQueries({queryKey: registryQueryKey('normal')});
    expect(await getRegistry(client, adapter)).toEqual(first);
    expect(get).toHaveBeenCalledTimes(4);
    client.clear();
    get.mockRestore();
  });
  it('registry adapter includes examples, presets, fonts, layouts, and project guidance atomically', async () => {
    const s = await localAdapter.get('registry');
    expect(s).toEqual(registry);
    for (const component of s.components) expect(s.examples.some(e => component.exampleIds.includes(e.id))).toBe(true);
    expect(s.themePresets[0].id).toBe(s.defaultThemeId);
    expect(s.project.guidance.length).toBeGreaterThan(0);
    // Layouts are intentionally empty until M6; schema and transport already preserve them.
    expect(s.layouts).toEqual([]);
  });
  it('labels demo reports and resolves every rule and example', () => {
    const reports = demoReports(registry);
    expect(reports.map(r => r.scenarioId)).toEqual(['clean', 'mixed', 'failing']);
    for (const report of reports) for (const finding of report.items) {
      expect(report.source).toBe('demo-fixture');
      const rule = registry.rules.find(r => r.id === finding.ruleId)!;
      expect(rule).toBeDefined();
      expect(registry.examples.some(e => e.id === finding.exampleId)).toBe(true);
      if (finding.status !== 'passed') expect(finding.status).toBe(rule.severity);
    }
  });
  it('route rejects unknown paths/scenarios and uses deterministic production-compatible responses', async () => {
    const call = (path: string[], query = '') => GET(new Request(`http://localhost/api/${path.join('/')}?${query}`), {params: Promise.resolve({path})});
    expect((await call(['missing'])).status).toBe(404);
    expect((await call(['registry', 'extra'])).status).toBe(404);
    expect((await call(['tokens'], 'scenario=oops')).status).toBe(400);
    expect(await (await call(['tokens'], 'scenario=empty')).json()).toEqual({data: []});
    expect((await call(['components', 'unknown'], 'scenario=error')).status).toBe(404);
    expect((await call(['registry'], 'scenario=error')).status).toBe(503);
  });
});
