# SYX-065 — Popover

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/popover.tsx` wraps React Aria's `Popover` in a `DialogTrigger`. The panel is a dialog named by `label`, because it holds interactive content. It renders into the nearest `ThemeScope`, so it inherits that scope's tokens.
- Escape or a press outside closes it, and focus returns to the trigger. Focus moves into the panel on open. `placement` defaults to `bottom` and React Aria flips it to stay inside the viewport.
- **Deviation from the plan:** the plan asked for a non-modal panel. With React Aria's `isNonModal` a click on the trigger opened the panel and closed it again in the same gesture, so the panel never stayed open. A normal popover works, but the page behind is inert while it is open. The contract says "light-dismiss" and points to Dialog for tasks that must finish. A truly non-modal panel is open work.
- Glass uses the denser tint and a blur, and falls back to a solid surface without `backdrop-filter`, with reduced transparency, or in forced colors (forced colors checked in a browser).
- Browser: opens from Enter, is named and scoped, closes on Escape with focus returning, closes on an outside press and on its own action; axe finds nothing serious in light, dark, glass and clean.
- Not checked: screen-reader output, placement flipping near a viewport edge, right-to-left layout, a popover inside a Dialog.
