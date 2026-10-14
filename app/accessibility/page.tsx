import type { Metadata } from 'next';
import { ScenarioSchema } from '@/lib/data/api';
import { localAdapter } from '@/lib/data/adapter';
import { AccessibilityView } from './AccessibilityView';

export const metadata: Metadata = { title: 'Accessibility — SeeYesYes' };
export default async function AccessibilityPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const parsed = ScenarioSchema.safeParse(scenario ?? 'normal');
  const system = await localAdapter.get('registry');
  return <AccessibilityView scenario={parsed.success ? parsed.data : 'normal'} rules={system.rules} />;
}
