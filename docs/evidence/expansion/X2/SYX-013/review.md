# SYX-013 — Input

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/input.tsx` uses the shared `small | medium | large` scale (`FormControlSize`); `small` is the compact toolbar size. Default is medium text.
- Read-only, required, disabled and invalid are native attributes passed through.
- Unit (`SYX-013 Input and SYX-015 Select`): default size and type; all three sizes; `readOnly`, `required`, `disabled` and `aria-invalid` reach the element.
- Browser: toolbar Input and Select both have `data-size="small"` and heights within 2px of each other; a focused Input has a solid outline; typing into a read-only Input leaves its value unchanged.
- Not checked: leading/trailing adornments (the matrix lists them as composition; no adornment prop exists, and none was added); pressed state does not apply to a text field.
