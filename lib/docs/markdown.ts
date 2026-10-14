import { Marked, type Tokens } from 'marked';

export type Heading = { id: string; text: string; depth: number };

export const slugify = (text: string) => text.toLowerCase().replace(/[`*_]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';

/** Headings with unique, stable IDs, used for deep links, search results, and the rendered anchors. */
export function extractHeadings(markdown: string): Heading[] {
  const seen = new Map<string, number>();
  const headings: Heading[] = [];
  for (const token of new Marked().lexer(markdown)) {
    if (token.type !== 'heading') continue;
    const text = token.text.replace(/[`*_]/g, '');
    const base = slugify(token.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count ? `${base}-${count + 1}` : base, text, depth: token.depth });
  }
  return headings;
}

/** Render trusted, repository-owned Markdown. Raw HTML is escaped, headings get anchors, and code blocks are keyboard reachable. */
export function renderMarkdown(markdown: string): string {
  const headings = extractHeadings(markdown);
  let index = 0;
  const marked = new Marked({
    renderer: {
      heading(this, token: Tokens.Heading) { const id = headings[index++]?.id ?? slugify(token.text); return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`; },
      html(token: Tokens.HTML | Tokens.Tag) { return token.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
    },
  });
  return (marked.parse(markdown, { async: false }) as string).replaceAll('<pre>', '<pre tabindex="0">');
}

/** Plain text of a Markdown document, for search. */
export function plainText(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, match => match.replace(/```\w*\n?/g, ' ')).replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/^\s*(?:[#>]+|[-*]\s)/gm, ' ').replace(/[*|]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Markdown for Copy for LLM: links become site-root paths, so the text works away from this page. */
export function withRootLinks(markdown: string): string {
  return markdown.replace(/\]\((?!https?:|mailto:|#)(?!\/)([^)]+)\)/g, (_match, target: string) => `](/${target.replace(/^\.\//, '')})`);
}
