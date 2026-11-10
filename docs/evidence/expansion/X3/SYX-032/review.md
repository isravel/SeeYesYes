# SYX-032 — Disclosure

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/disclosure.tsx` is a native `button` with `aria-expanded` and `aria-controls`. The panel is `hidden` while collapsed, so it is neither focusable nor announced. Controlled with `open`, or uncontrolled with `defaultOpen`.
- `openOnHover` is a mouse-only enhancement (`pointerType === 'mouse'`). Hover shows the content and leaving hides it; a click while previewing pins it open. Keyboard and touch use only the click path, and the default is off.
- `headingLevel` places the trigger in a heading and names the panel as a region; without it there is no heading or region role.
- Unit: native button wiring, default and controlled state, heading and region only when requested, disabled, no inline handlers.
- Browser: click, Enter and Space toggle; Tab skips hidden panel content and reaches it once open; mouse hover previews and leaves; click pins; keyboard focus alone does not open it; focus ring is solid.
- Not built: height animation (only the chevron turns, and that stops under reduced motion). Not checked: touch behavior on a real device, screen-reader output.
