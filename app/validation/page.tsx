import type { Metadata } from 'next';
import { ScenarioSchema } from '@/lib/data/api';
import { localAdapter } from '@/lib/data/adapter';
import { ValidationView } from './ValidationView';

export const metadata: Metadata = { title: 'Validation — SeeYesYes' };
export default async function ValidationPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const parsed = ScenarioSchema.safeParse(scenario ?? 'normal');
  const system = await localAdapter.get('registry');
  // Rules, examples, and component names are static registry data; the demo reports load through the adapter.
  return <ValidationView scenario={parsed.success ? parsed.data : 'normal'} rules={system.rules} examples={system.examples} components={system.components.map(c => ({ id: c.id, name: c.name }))} />;
}
