import { mockResponse, responseSchemas, ScenarioSchema, type Endpoint } from '@/lib/data/api';
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const endpoint = path[0] === 'components' && path.length === 2 ? 'component' : path[0] as Endpoint;
  if (!Object.hasOwn(responseSchemas, endpoint) || path.length > (endpoint === 'component' ? 2 : 1)) return Response.json({ error: { code: 'NOT_FOUND', message: 'This API route does not exist.' } }, { status: 404 });
  const scenario = ScenarioSchema.safeParse(new URL(request.url).searchParams.get('scenario') ?? 'normal');
  if (!scenario.success) return Response.json({ error: { code: 'INVALID_SCENARIO', message: 'Choose normal, empty, or error.' } }, { status: 400 });
  const result = mockResponse(endpoint, scenario.data, path[1]);
  return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
}
