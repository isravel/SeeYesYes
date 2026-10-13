import type { Metadata } from 'next';
import { localAdapter } from '@/lib/data/adapter';
import { TokensView } from './TokensView';

export const metadata: Metadata = { title: 'Tokens — SeeYesYes' };
export default async function TokensPage() {
  const system = await localAdapter.get('registry');
  return <TokensView system={system} />;
}
