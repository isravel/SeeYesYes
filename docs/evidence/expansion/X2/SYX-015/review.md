# SYX-015 — Select

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/select.tsx` remains a native `<select>`. It uses the same size scale as Input, so a small Select sits level with a small Input in a toolbar.
- No invented value: it renders the options the caller passes and no role override.
- Unit: sizes; `required` and `aria-invalid` pass through; two options render as two native options with no `role`; a disabled placeholder option with `defaultValue=""` renders.
- Browser: same toolbar test as Input (matching size attribute and height); the control page passes axe.
- Not checked: the open option list (drawn by the browser, not styleable); empty options list.
