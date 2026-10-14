import type { Metadata } from 'next';
import { ScenarioSchema } from '@/lib/data/api';
import { RulesView } from './RulesView';

export const metadata: Metadata = { title: 'Rules — SeeYesYes' };
export default async function RulesPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const parsed = ScenarioSchema.safeParse(scenario ?? 'normal');
  return <RulesView scenario={parsed.success ? parsed.data : 'normal'} />;
}
