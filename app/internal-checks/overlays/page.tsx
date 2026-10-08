import { notFound } from 'next/navigation';
import { localAdapter } from '@/lib/data/adapter';
import { OverlayFixture } from '@/tests/fixtures/OverlayFixture';
export const dynamic = 'force-dynamic';
export default async function OverlayChecks() {
  if (process.env.SEEYESYES_TEST_ROUTES !== '1') notFound();
  return <OverlayFixture theme={await localAdapter.get('theme')} />;
}
