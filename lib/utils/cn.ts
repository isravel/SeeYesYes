/** Anything `cn` accepts: strings, numbers, falsy placeholders, nested lists, and `{ className: condition }` records. */
export type ClassValue = string | number | boolean | null | undefined | ClassValue[] | { [className: string]: unknown };

/**
 * Join optional class names for CSS Modules. Falsy values and empty strings are dropped, lists are flattened,
 * and a record keeps the keys whose values are truthy.
 *
 * This only concatenates. It does not know which utilities conflict, so `cn('p-2', 'p-4')` keeps both;
 * resolving conflicts is a Tailwind-specific job this system does not do.
 */
export function cn(...values: ClassValue[]): string {
  const classes: string[] = [];
  const add = (value: ClassValue): void => {
    if (!value && value !== 0) return;
    if (typeof value === 'string') { const trimmed = value.trim(); if (trimmed) classes.push(trimmed); }
    else if (typeof value === 'number') classes.push(String(value));
    else if (Array.isArray(value)) value.forEach(add);
    else if (typeof value === 'object') for (const [name, enabled] of Object.entries(value)) if (enabled) add(name);
  };
  values.forEach(add);
  return classes.join(' ');
}
