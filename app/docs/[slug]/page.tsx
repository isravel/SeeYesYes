import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localAdapter } from '@/lib/data/adapter';
import { Link } from '@/components/ui/link';
import { loadArticles } from '@/lib/docs/articles';
import { renderMarkdown, withRootLinks } from '@/lib/docs/markdown';
import { CopyArticle } from './CopyArticle';
import styles from '../docs.module.css';

type Props = { params: Promise<{ slug: string }> };
const articles = async () => loadArticles(await localAdapter.get('registry'));

export async function generateStaticParams() { return (await articles()).map(article => ({ slug: article.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = (await articles()).find(article => article.slug === slug);
  return { title: `${found?.title ?? 'Documentation'} — SeeYesYes` };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = (await articles()).find(item => item.slug === slug);
  if (!article) notFound();
  const toc = article.headings.filter(heading => heading.depth === 2);
  return <main className={styles.page}>
    <nav aria-label="Breadcrumb" className={styles.crumbs}><Link href="/docs">Documentation</Link><span aria-hidden="true"> / </span><span aria-current="page">{article.title}</span></nav>
    <div className={styles.articleHeader}>
      <p className={styles.eyebrow}>{article.kind === 'reference' ? 'REFERENCE · GENERATED FROM THE REGISTRY' : 'GUIDE'}</p>
      <CopyArticle markdown={withRootLinks(article.markdown)} />
    </div>
    <div className={styles.articleLayout}>
      {toc.length > 0 && <nav aria-label="On this page" className={styles.toc}><h2>On this page</h2><ul>{toc.map(heading => <li key={heading.id}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ul></nav>}
      <article className={styles.article} dangerouslySetInnerHTML={{ __html: renderMarkdown(article.markdown) }} />
    </div>
  </main>;
}
