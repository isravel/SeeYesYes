import { notFound } from 'next/navigation';
import { localAdapter } from '@/lib/data/adapter';
import { StructureFixture } from '@/tests/fixtures/StructureFixture';
export const dynamic = 'force-dynamic';
export default async function StructureChecks() {
  if (process.env.SEEYESYES_TEST_ROUTES !== '1') notFound();
  return <StructureFixture theme={await localAdapter.get('theme')} />;
}
