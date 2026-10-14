import { describe, expect, it } from 'vitest';
import { currentDestination } from '@/components/shell/WorkspaceShell';

describe('shell navigation', () => {
  it('marks the destination a path belongs to, using the longest matching route', () => {
    expect(currentDestination('/')?.label).toBe('Overview');
    expect(currentDestination('/components')?.label).toBe('Components');
    expect(currentDestination('/components/button')?.label).toBe('Components');
    expect(currentDestination('/system/rules')?.label).toBe('Rules');
    expect(currentDestination('/docs/setup')?.label).toBe('Documentation');
    expect(currentDestination('/ai/context')?.label).toBe('AI context');
    expect(currentDestination('/getting-started')?.label).toBe('Getting started');
  });

  it('does not match unrelated or unknown paths', () => {
    expect(currentDestination('/nope')).toBeUndefined();
    expect(currentDestination('/components-extra')).toBeUndefined();
    expect(currentDestination('/system')).toBeUndefined();
  });
});
