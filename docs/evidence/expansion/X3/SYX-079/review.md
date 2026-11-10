# SYX-079 — Avatar group

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/avatar-group.tsx` composes `Avatar` in a `role="group"` with a required `label`. `max` defaults to 4, `size` to medium, and people beyond `max` collapse into a `+N` count.
- The count is a named image ("2 more" by default, or the caller's `overflowLabel`), so the number alone is not the only description. It has no popup and no button; a caller who wants to open the full list puts a real control beside the group.
- `max` is floored and clamped at zero, so a fractional, negative or non-finite value cannot break rendering. Zero shows only the count.
- Unit: names the group, shows four avatars and a "2 more" count for six people, no count at exactly `max` or for one person, `max` of zero, an empty list, a fractional and a negative `max`, a custom overflow name, size applied to the group and avatars, and no buttons, links or tab stops.
- Browser: the group is named, five images are present (four people plus the count), the count has its own name and reads "+2", every item overlaps the previous one, a two-person group shows no count, and the group has no focusable descendants.
- Not checked: the overlap ring on a glass background.
- **Left open.** The variation matrix lists an optional overflow trigger with its focus state, and this version does not provide one. The task checkbox stays unchecked until that is built or the matrix is changed.
