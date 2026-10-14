'use client';
import { CopyButton } from '@/components/ui/copy-button';

export function CopyArticle({ markdown }: { markdown: string }) {
  return <CopyButton label="for LLM" text="Copy for LLM" value={markdown} successMessage="Copied this article as Markdown." />;
}
