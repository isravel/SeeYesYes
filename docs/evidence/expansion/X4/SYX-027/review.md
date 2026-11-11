# SYX-027 MenuToggle review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check.

`MenuToggle` (`components/ui/menu-toggle.tsx`) is a native `button` that shows and hides a menu or panel. It owns no menu: the page reacts in `onExpandedChange` and points `controls` at the panel id.

- The accessible name is the required `label` and never changes. `aria-expanded` carries the state.
- Three bars become a close mark when expanded: the outer bars cross and the middle bar goes. The state is a shape, not only a colour.
- `animated` (on by default) eases the change. Reduced motion applies it instantly. Forced colors keep the bars visible.
- Sizes small, medium and large change the icon only; the target never drops below `spacing.target-minimum`.
- Controlled (`expanded`) and uncontrolled (`defaultExpanded`) forms; a controlled value is never overridden.

## Evidence

- Unit: native button, `type="button"`, name, `aria-expanded`, `aria-controls`, sizes, disabled, animation attribute.
- Browser: Enter and Space toggle; name stays "Site menu"; the controlled panel shows and hides; the middle bar fades out when expanded; uncontrolled `defaultExpanded`; disabled is not pressable; every target is at least 24px; transition duration is 0s under reduced motion; focus ring is visible; axe in four conditions; no horizontal scroll at 320px.
- `keyboard-matrix` includes MenuToggle: reachable by Tab, named, visible focus.

## Deviations from the plan

- The plan says "bars-to-close transition". The transition is a CSS transform and opacity change on three spans, not an SVG morph.
- `NavigationDrawer` in the shell still has its own trigger; it was not refactored to use MenuToggle.

## Not covered

Screen-reader announcement of the expanded state, right-to-left layout, and use inside the shell navigation.
