# SYX-024 — Checkbox

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/checkbox.tsx` is a native checkbox. `indeterminate` sets the DOM property after each render (HTML has no attribute for it); the checked value still drives the form. New `tone`: `primary` (default) or `neutral`. A shared `assignRef` helper keeps the caller's ref working alongside the internal one.
- Unit: three sizes; neutral tone; `required`, `aria-invalid`, `defaultChecked` and `disabled` pass through.
- Browser: an indeterminate checkbox in the Fieldset reports `indeterminate === true` through the DOM; the page passes axe.
- Not checked: the indeterminate dash and neutral checked fill by eye; a checkbox that toggles from indeterminate after a click.
