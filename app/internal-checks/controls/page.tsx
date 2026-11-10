import { notFound } from 'next/navigation';
import { localAdapter } from '@/lib/data/adapter';
import { ControlsFixture } from '@/tests/fixtures/ControlsFixture';
export const dynamic = 'force-dynamic';
export default async function ControlChecks({ searchParams }: { searchParams: Promise<{ surface?: string; appearance?: string }> }) {
  if (process.env.SEEYESYES_TEST_ROUTES !== '1') notFound();
  const { surface, appearance } = await searchParams;
  return <ControlsFixture theme={await localAdapter.get('theme')} surface={surface === 'clean' ? 'clean' : 'glass'} appearance={appearance === 'dark' ? 'dark' : 'light'} />;
}
