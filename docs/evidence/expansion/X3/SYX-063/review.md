# SYX-063 — Breadcrumbs

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/breadcrumbs.tsx` is a named `nav` with an ordered list. Ancestors are links; the last item is a `span` with `aria-current="page"`, so the current page is not a tab stop. Separators (a slash or a chevron) are `aria-hidden`.
- The caller supplies the hierarchy; nothing is read from the URL. An empty list renders nothing; a single item is just the current page.
- The shell `Navigation` keeps its own breadcrumb markup. Replacing it with this component was not done, because its tests and styling are tied to the shell and the visible result would be the same. This is a deliberate choice: SYX-063 asks to "extract/reuse", and only the standalone composition exists.
- Unit: landmark, list, link count, current-page span, separators, label, single and empty trails, hash and API destinations.
- Browser: two ancestor links with the right `href`, current page as a span, a long trail wraps at 320px without horizontal overflow, axe is clean in light, dark, glass and clean.
- Not built: collapsing a long trail into an overflow menu (items wrap instead). Not checked: screen-reader output.
