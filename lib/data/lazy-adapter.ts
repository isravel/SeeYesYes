import type { DataAdapter } from './adapter';

/**
 * Browser views fetch through this adapter. The real adapter validates every response with zod and the registry validator,
 * so it is loaded on the first request instead of with the page, which keeps that code out of the first-load bundle.
 */
export function createLazyHttpAdapter(): DataAdapter {
  let loaded: Promise<DataAdapter> | undefined;
  const load = () => loaded ??= import('./adapter').then(module => module.createHttpAdapter());
  return { get: async (endpoint, options) => (await load()).get(endpoint, options) };
}
