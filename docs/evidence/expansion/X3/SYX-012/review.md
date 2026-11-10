# SYX-012 — Live dot

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/live-dot.tsx` renders a dot and required status text. `status` is `live` (filled dot) or `inactive` (hollow ring); `size` is `small` (default) or `medium`; `animated` is off by default.
- Meaning survives without color or motion: the text states the status, and the two statuses differ by shape (filled versus a 2px ring, which is slightly larger because of the border).
- The ping applies only to a live status. `animated` on an inactive dot is ignored, and the attribute is not rendered.
- Reduced motion removes the animation, and forced colors hide the ping and draw the dot in `CanvasText`.
- Unit: defaults (live, small, static); animation only when asked and only while live; both statuses and both sizes keep the text and a hidden dot.
- Browser: live and inactive differ by background and border width; the animated dot has a running animation and the static one has none; with reduced motion the animation is `none` and the text still reads; with forced colors the ping is `display: none`.
- Not checked: the ping on a real low-power device, and the dot against a glass background.
