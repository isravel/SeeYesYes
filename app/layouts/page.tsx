import type { Metadata } from 'next';
import { ScenarioSchema } from '@/lib/data/api';
import { LayoutsView } from './LayoutsView';

export const metadata: Metadata = { title: 'Layouts — SeeYesYes' };
export default async function LayoutsPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const parsed = ScenarioSchema.safeParse(scenario ?? 'normal');
  return <LayoutsView scenario={parsed.success ? parsed.data : 'normal'} />;
}
