import type { Metadata } from 'next';
import { ScenarioSchema } from '@/lib/data/api';
import { localAdapter } from '@/lib/data/adapter';
import { registryReadiness } from '@/lib/contract/readiness';
import { ComponentsCatalog } from './ComponentsCatalog';

export const metadata: Metadata = { title: 'Components — SeeYesYes' };
export default async function ComponentsPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const parsed = ScenarioSchema.safeParse(scenario ?? 'normal');
  const system = await localAdapter.get('registry');
  return <ComponentsCatalog scenario={parsed.success ? parsed.data : 'normal'} readiness={registryReadiness(system)} />;
}
