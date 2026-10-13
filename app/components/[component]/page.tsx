import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ScenarioSchema } from '@/lib/data/api';
import { localAdapter } from '@/lib/data/adapter';
import { ComponentDetail } from './ComponentDetail';

type Props = { params: Promise<{ component: string }>; searchParams: Promise<{ scenario?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { component } = await params;
  const system = await localAdapter.get('registry');
  const found = system.components.find(item => item.id === component);
  return { title: `${found?.name ?? 'Component'} — SeeYesYes` };
}

export default async function ComponentPage({ params, searchParams }: Props) {
  const { component } = await params;
  const { scenario } = await searchParams;
  const system = await localAdapter.get('registry');
  // Unknown IDs are a 404 in every scenario.
  if (!system.components.some(item => item.id === component)) notFound();
  const parsed = ScenarioSchema.safeParse(scenario ?? 'normal');
  return <ComponentDetail componentId={component} scenario={parsed.success ? parsed.data : 'normal'} />;
}
