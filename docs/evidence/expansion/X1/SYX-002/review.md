# SYX-002 — `cn()`

Revision: `9acfd3f` plus uncommitted working tree.

- `lib/utils/cn.ts` joins optional class names for CSS Modules. It drops false, null, undefined and empty strings, flattens lists, keeps the keys of truthy records, and trims names.
- It does **not** resolve conflicting utilities. `cn('p-2', 'p-4')` returns both, and the doc comment and test say so. No Tailwind or class-merging dependency was added.
- Exported from the artifact (`cn`, `ClassValue`) and included in the evaluation fixture's source closure (`evaluation/reset.mjs`).
- Used by `Backdrop` and `ThemeSwitcher`. Existing components were left on template strings to avoid churn.
- Checks: `tests/utils-cn.test.ts` covers empty, conditional, combined and unresolved-conflict cases.
