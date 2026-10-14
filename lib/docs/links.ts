/** Markdown for Copy for LLM and agent files: links become site-root paths, so the text works away from this page. */
export function withRootLinks(markdown: string): string {
  return markdown.replace(/\]\((?!https?:|mailto:|#)(?!\/)([^)]+)\)/g, (_match, target: string) => `](/${target.replace(/^\.\//, '')})`);
}
