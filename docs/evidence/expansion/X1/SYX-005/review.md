# SYX-005 — Theme switcher

Revision: `9acfd3f` plus uncommitted working tree.

- `components/theme/ThemeSwitcher.tsx` provides a group of Light, Dark and System buttons with `variant` `icon` (default, accessible names) or `labeled`, and `size` `small`, `medium` (default) or `large`.
- The group has one stable accessible name (`Theme`, overridable). The current preference is exposed with `aria-pressed`. Save progress and failure are announced politely.
- It shares `useAppearance` with `AppearanceSelector`, which now uses the same hook. Both go through `commitAppearance`, the same writer and store, so they cannot disagree. Light, dark and system are preserved.
- Outside a `ThemeLifecycleProvider` the options render disabled rather than throwing.
- Registered as the `theme-switcher` contract (interactive, keyboard documented, covered by `wcag-focus-visible`) with an example, preview and playground demo.
- Checks: browser tests confirm the name stays stable, `aria-pressed` follows the choice, the workspace appearance changes, the header selector agrees, and the choice survives reload. The keyboard matrix covers focus and the visible focus indicator.
- Not done: the pending and save-error states have no dedicated browser test (the writer paths are covered by the existing appearance tests). The disabled state without a provider is untested. Not human-reviewed.
