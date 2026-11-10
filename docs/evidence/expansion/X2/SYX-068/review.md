# SYX-068 — Textarea

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/textarea.tsx` adds `autoGrow` (off by default) and `maxRows`. Height comes from `lib/utils/auto-grow.ts`: it grows with content from the `rows` height up to the `maxRows` height, then scrolls. If the reader drags the resize handle taller, that height is kept as a floor and wins over the maximum. Controlled value changes re-measure too.
- Defaults: medium, three rows, auto-grow off, native resizing retained.
- Unit (`SYX-068 Textarea`): defaults; `autoGrow`, rows and size; read-only, required, invalid and disabled pass through; max-height math including a non-numeric line height; grow, cap and scroll; manual floor and a drag beyond the maximum.
- Browser (`auto-grow Textarea…`): typing three lines grows it; more lines grow it to a cap; extra lines leave the height unchanged and set `overflow-y: auto`; clearing shrinks it to its empty height; a fixed textarea stays the same height after six lines; both keep CSS `resize` other than `none`.
- Not checked: a real drag of the resize handle (Playwright cannot drag it); paste of long text; auto-grow inside a Dialog that is still animating.
