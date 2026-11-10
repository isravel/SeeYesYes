# SYX-076 — Progress

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/progress.tsx` is a native `<progress>` with a required label. A numeric `value` makes it determinate; omitted or `null` makes it indeterminate. Values clamp to 0 and `max`; an invalid `max` falls back to 100. New `tone`: `primary` (default) or `neutral`.
- Unit: indeterminate has no `value` and no percent; partial shows `value`, `max`, percent and name; 0, complete, over and under range, a custom max, an invalid max, neutral and default tone, and `null`.
- Browser: the determinate bar is a progressbar named "Upload" with `value="40"`; the indeterminate one has `position === -1`; the page passes axe in light and dark.
- Not checked: the indeterminate bar's animation under reduced motion; thickness token at boundary sizes.
