import type { Metadata } from 'next';
import { ScenarioSchema } from '@/lib/data/api';
import { localAdapter } from '@/lib/data/adapter';
import { tokenUsage } from '@/lib/tokens/browse';
import { TokensView } from './TokensView';

export const metadata: Metadata = { title: 'Tokens — SeeYesYes' };
export default async function TokensPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const parsed = ScenarioSchema.safeParse(scenario ?? 'normal');
  const system = await localAdapter.get('registry');
  // Fonts and usage links are static registry data; the token list itself loads through the adapter.
  return <TokensView scenario={parsed.success ? parsed.data : 'normal'} fonts={system.fonts} usage={tokenUsage(system)} />;
}
