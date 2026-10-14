import { loadGuides } from '@/lib/docs/articles';
import { localAdapter } from '@/lib/data/adapter';
import { buildLlmsFullTxt } from '@/lib/contract/agent-files';

// Generated once at build time from the registry and the default preset.
export const dynamic = 'force-static';
export async function GET() {
  const system = await localAdapter.get('registry');
  return new Response(buildLlmsFullTxt(system, loadGuides()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
