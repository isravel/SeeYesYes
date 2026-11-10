# SYX-007 — Highlight

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/highlight.tsx` is a native `mark` with no role, tab stop or animation. It inherits the surrounding text size.
- `Highlight.module.css` tints the brand color into the surface and keeps the foreground text color, so contrast comes from the text. Selection swaps to the solid brand pair. It falls back to the muted fill without `color-mix`, and to the system `Mark`/`MarkText` colors in forced colors.
- Usage guidance against overuse is in the contract: one phrase in a short passage, and never the only signal for status.
- Unit: renders a `mark` with its words, no role or tab index, and passes `className`.
- Browser: tag is `MARK`, the text over the tint is at least 4.5:1 in light and in dark (the browser converts each computed color to sRGB before the ratio), the sentence reads unchanged, and forced colors give text and background different system colors.
- Not checked: contrast over a busy glass background, and the tint beside a long wrapped phrase across lines on a real device.
