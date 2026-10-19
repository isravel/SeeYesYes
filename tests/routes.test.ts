import { describe, expect, it } from 'vitest';
import { isPageRoute } from '@/lib/routes';

describe('isPageRoute', () => {
  it('treats in-app paths as client-side page routes', () => {
    expect(isPageRoute('/')).toBe(true);
    expect(isPageRoute('/components')).toBe(true);
    expect(isPageRoute('/components/button')).toBe(true);
  });

  it('ignores query strings and fragments when checking for a file extension', () => {
    expect(isPageRoute('/components?filter=action')).toBe(true);
    expect(isPageRoute('/components#button')).toBe(true);
    expect(isPageRoute('/llms.txt?download=1')).toBe(false);
  });

  it('keeps API routes, files, and external URLs as plain anchors', () => {
    expect(isPageRoute('/api/registry')).toBe(false);
    expect(isPageRoute('/robots.txt')).toBe(false);
    expect(isPageRoute('https://example.com/docs')).toBe(false);
    expect(isPageRoute('mailto:someone@example.com')).toBe(false);
  });

  it('handles a bare fragment or query without a path segment', () => {
    expect(isPageRoute('#main')).toBe(false);
    expect(isPageRoute('?tab=tokens')).toBe(false);
  });
});
