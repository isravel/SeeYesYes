import type { Metadata } from 'next';
import { localAdapter } from '@/lib/data/adapter';
import { loadArticles } from '@/lib/docs/articles';
import { summarize } from '@/lib/docs/search';
import { DocsIndex } from './DocsIndex';

export const metadata: Metadata = { title: 'Documentation — SeeYesYes' };
export default async function DocsPage() {
  const system = await localAdapter.get('registry');
  return <DocsIndex articles={loadArticles(system).map(summarize)} />;
}
