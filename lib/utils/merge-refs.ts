import type { Ref } from 'react';

/** Point a forwarded ref (callback or object) at an element, so a component can keep its own reference too. */
export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}
