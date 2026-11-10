# SYX-059 — Tabs

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/tabs.tsx` keeps React Aria tab and tabpanel semantics and adds `variant` `line` alongside `boxed`.
- **Default stays `boxed`.** The original matrix proposed `line`, but `boxed` was the only style before X2, so changing it would restyle every existing caller. Unit test `keeps boxed as the default` pins this. Plan resolution (2026-11-10): preserve boxed as the default and use explicit `variant="line"` for compositions that need it. The matrix now agrees; no runtime change or new test result is claimed.
- Unit: default boxed and `line` selectable; tablist, name and orientation; first enabled tab selected; boxed with vertical orientation and an explicit selection; tabs link to panels through `aria-controls`; a disabled tab is marked.
- Browser (`Tabs: line and boxed render…`): ArrowRight moves selection to the next enabled tab and wraps past the disabled one; the selected line tab has an underline and no fill, the unselected one has neither; the boxed tablist is vertical and ArrowDown moves focus down.
- Existing `overlays.spec.ts` covers automatic and manual activation.
- Not checked: Home and End; manual activation with the line style; a vertical line tab.
