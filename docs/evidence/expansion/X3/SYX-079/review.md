# SYX-079 — Avatar group

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/avatar-group.tsx` composes `Avatar` in a `role="group"` with a required `label`. `max` defaults to 4, `size` to medium, and people beyond `max` collapse into a `+N` count.
- The count is a named image ("2 more" by default, or the caller's `overflowLabel`), so the number alone is not the only description. It has no popup and no button; a caller who wants to open the full list puts a real control beside the group.
- `max` is floored and clamped at zero, so a fractional, negative or non-finite value cannot break rendering. Zero shows only the count.
- Unit: names the group, shows four avatars and a "2 more" count for six people, no count at exactly `max` or for one person, `max` of zero, an empty list, a fractional and a negative `max`, a custom overflow name, size applied to the group and avatars, and no buttons, links or tab stops.
- Browser: the group is named, five images are present (four people plus the count), the count has its own name and reads "+2", every item overlaps the previous one, a two-person group shows no count, and the group has no focusable descendants.
- Not checked: the overlap ring on a glass background.

## Overflow trigger (added later)

- New optional props: `overflowContent` (node, or a function that receives `close`) and `overflowTriggerLabel` (default "Show N more"). Without `overflowContent` nothing changes: the +N count is a plain named image and the group has no tab stop.
- With `overflowContent` and at least one hidden person, only the +N count becomes a real button. It opens a popover built on the same React Aria popover as `Popover` and borrowing its styles. The panel is a dialog named by `overflowLabel` ("2 more"). Escape or an outside press closes it and returns focus to the button. Hover never opens it. If nobody overflows, no button is rendered.
- The contract now marks AvatarGroup interactive, lists Enter/Space, Tab and Escape, adds the `focus-visible` and `overflow-list` states and the `color.focus` token, and `wcag-focus-visible` applies to it. The playground has an `overflow-list` state.
- Unit: one named button when content is supplied, no button when nobody overflows, custom trigger label, closed panel not rendered. Browser: the +N button is the only tab stop in its group, at least 24px, hover does not open, Enter opens and moves focus in, Escape closes and returns focus, click opens and a render-function close button closes it, solid focus outline. The existing axe sweep and 320px test pass.
- Not checked: the panel with a very long list (it scrolls only if Popover's styles do), right-to-left, screen readers, the overlap ring on glass.
