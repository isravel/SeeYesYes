import { z } from 'zod';
import { QueryClient, queryOptions } from '@tanstack/react-query';
import { responseSchemas, ErrorEnvelopeSchema, mockResponse, type Endpoint, type EndpointData, type Scenario } from './api';
import { validateRegistry } from '@/lib/contract/validate';

export class DataError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message); this.name = 'DataError'; }
}
export type DataAdapter = { get<K extends Endpoint>(endpoint: K, options?: { scenario?: Scenario; componentId?: string; signal?: AbortSignal }): Promise<EndpointData<K>> };
export function parseResponse<K extends Endpoint>(endpoint: K, status: number, body: unknown): EndpointData<K> {
  if (status < 200 || status >= 300) {
    const error = ErrorEnvelopeSchema.parse(body).error;
    throw new DataError(error.code, error.message, status);
  }
  const envelope = z.strictObject({ data: z.unknown() }).parse(body);
  const data = responseSchemas[endpoint].parse(envelope.data) as EndpointData<K>;
  if (endpoint === 'registry') return validateRegistry(data) as EndpointData<K>;
  return data;
}
/** Server calls use this adapter directly; they never fetch the app's own API. */
export const localAdapter: DataAdapter = {
  async get(endpoint, options = {}) {
    const result = mockResponse(endpoint, options.scenario, options.componentId);
    return parseResponse(endpoint, result.status, result.body);
  },
};
export function createHttpAdapter(fetcher: typeof fetch = fetch): DataAdapter {
  return { async get(endpoint, options = {}) {
    const path = endpoint === 'component' ? `components/${encodeURIComponent(options.componentId ?? '')}` : endpoint;
    const response = await fetcher(`/api/${path}?scenario=${options.scenario ?? 'normal'}`, { signal: options.signal });
    return parseResponse(endpoint, response.status, await response.json());
  } };
}
export const REGISTRY_VERSION = '1.0:0.1.0';
export const registryQueryKey = (scenario: Scenario) => ['registry', REGISTRY_VERSION, scenario] as const;
export function registryQuery(adapter: DataAdapter, scenario: Scenario = 'normal') {
  return queryOptions({ queryKey: registryQueryKey(scenario), queryFn: ({ signal }) => adapter.get('registry', { scenario, signal }), staleTime: Infinity, gcTime: Infinity, retry: false });
}
export const getRegistry = (client: QueryClient, adapter: DataAdapter, scenario: Scenario = 'normal') => client.fetchQuery(registryQuery(adapter, scenario));
