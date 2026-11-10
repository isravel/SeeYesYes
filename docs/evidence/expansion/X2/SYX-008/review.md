# SYX-008 — Card

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/card.tsx` reads the scope's surface and exposes it as `data-surface`. Glass is a theme treatment, not a variant, so `default`, `outlined` and `elevated` are unchanged and there is no new prop.
- A Card inside another glass surface (another Card, or a Dialog panel) gets `data-nested` and drops its own blur but keeps tint and edge, so blurred layers never stack.
- No click, role or tab-index semantics; the type omits them.
- Unit: all three variants render with no `role` or `tabindex`; default is `default`; clean surface reports `data-surface="clean"` and no `data-nested`.
- Browser: under glass an elevated Card computes `backdrop-filter: blur(20px)…`; a Card nested in it has `backdrop-filter: none`; the same page with `?surface=clean` computes `none`.
- Opaque fallbacks are in `Card.module.css` for no `backdrop-filter` support, reduced transparency and forced colors.
- Not checked: forced-colors and reduced-transparency in the browser for Card (CSS inspected only); dense table or form content over glass by eye; overflow of very long unbroken content.
- Human visual review is pending (SYX-001 gate).
