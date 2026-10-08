import { notFound } from 'next/navigation';
import { localAdapter } from '@/lib/data/adapter';
import { ScopeFixture } from '@/tests/fixtures/ScopeFixture';
export const dynamic = 'force-dynamic';
export default async function ScopeChecks() {
  // The integration fixture is unavailable during normal preview and deployment.
  if (process.env.SEEYESYES_TEST_ROUTES !== '1') notFound();
  const theme = await localAdapter.get('theme');
  return <ScopeFixture theme={theme} />;
}
