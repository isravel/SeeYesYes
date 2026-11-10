import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils/cn';

describe('cn (SYX-002)', () => {
  it('returns an empty string when nothing is supplied', () => {
    expect(cn()).toBe('');
    expect(cn('', undefined, null, false)).toBe('');
  });
  it('omits false and empty values and trims names', () => {
    const hidden = false as boolean;
    expect(cn('root', hidden && 'hidden', undefined, ' spaced ', '')).toBe('root spaced');
    expect(cn(0, 1)).toBe('0 1');
  });
  it('combines strings, lists and conditional records in order', () => {
    expect(cn('a', ['b', ['c', false]], { d: true, e: false, f: 1 }, 'g')).toBe('a b c d f g');
  });
  it('does not resolve conflicting utilities: that is deliberately not its job', () => {
    expect(cn('p-2', 'p-4')).toBe('p-2 p-4');
  });
  it('splits a multi-class string through unchanged', () => {
    expect(cn('one two', { 'three four': true })).toBe('one two three four');
  });
});
