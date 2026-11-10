# SYX-077 — Separator

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/separator.tsx` is horizontal and decorative by default (`<hr aria-hidden>`). `decorative={false}` exposes `role="separator"` with `aria-orientation`. Vertical renders a `<span>`. The line comes from the hairline token. Its type omits `role`, `onClick` and `tabIndex`, so semantics only change through `decorative`.
- Unit: default is an `hr`, hidden, with no role; structural has the role and orientation and no `aria-hidden`; vertical structural is a `span` with vertical orientation; vertical decorative is hidden.
- Browser: a structural separator is exposed as role `separator` on the control page.
- Not checked: a vertical separator inside a flex toolbar by eye.
