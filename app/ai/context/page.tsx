import type { Metadata } from 'next';
import { ScenarioSchema } from '@/lib/data/api';
import { ContextView } from './ContextView';

export const metadata: Metadata = { title: 'AI Context — SeeYesYes' };
export default async function AIContextPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const parsed = ScenarioSchema.safeParse(scenario ?? 'normal');
  return <ContextView scenario={parsed.success ? parsed.data : 'normal'} />;
}
