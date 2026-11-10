# SYX-022 — Avatar

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/avatar.tsx` keeps the image and initials fallback and adds an optional `ring` (a surface-colored gap, then a primary ring). The ring is visual only; the contract says state belongs in nearby text.
- Defect found and fixed: with a server-rendered image that fails before hydration, React had not attached its error handler, so the initials never replaced the broken image. After mount the component now checks `complete` with `naturalWidth === 0`. The browser test failed before the fix and passes after it.
- Unit: initials as a named image (`role="img"`, `aria-label`); default medium, no ring; an image uses an empty `alt` so the name is not read twice; `ring` and `large`; an empty `alt` gives no role.
- Browser (`Avatar falls back…`): a broken source shows the initials and keeps the name "Maya Chen" with no `img` element left; the ringed avatar has `data-ring` and a box shadow; the unringed one has none.
- Not checked: the loading state before the image resolves; ring contrast on a glass background.
