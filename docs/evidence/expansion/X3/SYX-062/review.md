# SYX-062 — Pagination

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/pagination.tsx` is a named `nav` with a list. With `getHref`, each page is a real link (client-side navigation for page routes, plain anchors for hashes and API routes). Without it, each page is a button that calls `onPageChange`. The caller loads the data.
- The current page has `aria-current="page"`, a filled background and heavier weight, and `Highlight` colors in forced colors. Previous and Next are disabled on the first and last page (plain text in link mode). Ellipses are `aria-hidden` list items and are not focusable.
- `paginationEntries` always shows the first and last page and keeps a constant entry count at every position, so the controls do not jump. It is exported and unit-tested, including zero siblings, one page, zero pages and negative counts.
- The page is clamped into range, so an out-of-range controlled value shows the nearest valid page. Zero or non-finite `pageCount` renders nothing.
- Browser: click and Enter move the page; the entry count is the same at the first and last page; ends disable; link mode follows a hash; the focus ring is solid; the current page differs by fill, also in forced colors.
- Not checked: screen-reader output, very large page counts (it only computes a few entries), right-to-left layout.
