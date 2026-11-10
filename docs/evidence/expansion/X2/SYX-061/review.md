# SYX-061 — Table

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/table.tsx` keeps semantic headers (`scope="col"`, optional `scope="row"`), a caption, and a focusable, named scroll region for overflow. New props: `header` (`muted` default, or `plain`) and `rowHover` (off by default). Nothing finance-specific. There is no sorting.
- Unit: caption, header scopes, region role, `tabindex="0"` and name; header and hover attributes and defaults; empty state spans all columns and uses the default or a custom message; rows keep the caller's order.
- Browser: at 320px the page does not scroll sideways while the table does inside its region; column and row headers have the right roles; hovering a row changes its background; the region is focusable.
- Existing `structure.spec.ts` covers the overflow and empty table in a scope.
- Not checked: hover and header treatments on a glass Card; very wide cells in forced colors.
