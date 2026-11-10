# SYX-064 — Tooltip

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/tooltip.tsx` is the React Aria tooltip on a trigger button. Defaults: top, 600ms delay. Opening waits two animation frames so a focus-driven scroll finishes first. The tooltip takes the scope's surface, so it is glass under a glass theme.
- Browser (`Tooltip opens on focus…`): focusing the trigger shows the tooltip with the text "Short label"; it computes `blur(20px)`; Escape closes it and focus stays on the trigger.
- Existing `overlays.spec.ts` covers hover, focus, scope inheritance and Escape (run again, passing).
- Not checked: all four placements at the viewport edges; reduced transparency (CSS inspected only); the 600ms default delay timing.
