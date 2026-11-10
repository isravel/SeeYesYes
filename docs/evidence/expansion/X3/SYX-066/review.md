# SYX-066 — Drawer

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/drawer.tsx` follows `Dialog`: a React Aria modal named by `title`, a visible close action, focus contained, Escape and outside press close it, focus returns to the trigger. `side` is right, left, top or bottom; `size` is small, medium or large. Outside press and Escape can be turned off for a required task, and the close action stays.
- The panel is clamped to the viewport (`min(extent, 100%)`) and scrolls its own content. Browser checks: each side docks to its edge, and nothing overflows at 320px.
- The slide-in uses `--sys-motion-duration` and is removed under `prefers-reduced-motion` (checked in a browser).
- Glass: the panel blur and the page blur are separate layers, as in Dialog, and both drop out with `backdrop-filter` unsupported, reduced transparency or forced colors (forced colors checked in a browser). Nested glass inside the drawer drops its own blur through `GlassLayerContext`.
- **Not done:** the task said to generalize the shell's `NavigationDrawer`. It is unchanged, so the two drawers share no code or styles. Drawer duplicates Dialog's structure and some CSS. Refactoring them onto one base is open work.
- `side` and `size` are not offered as theme defaults (`noThemeDefaults`), since a drawer's edge is a layout choice.
- Not checked: screen-reader output, right-to-left (left/right are physical, not logical), a drawer opened from inside a Dialog.
