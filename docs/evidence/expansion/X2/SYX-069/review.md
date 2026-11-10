# SYX-069 — Radio group

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/radio-group.tsx` keeps native radios in a named fieldset. Options can now carry `hint` and `error`; each is described on that radio together with the group's own help and error. No selection is implied; `value` (controlled) wins over `defaultValue`.
- Unit: named fieldset with no checked radio, vertical by default, no `aria-required`; `defaultValue` and controlled `value` (controlled wins, one checked); option hints and errors get ids and are listed after the group's description; horizontal, required and a disabled option.
- Browser: radios report their own hint ("For one person") and error ("Needs an admin") as accessible descriptions; none is checked at first; ArrowDown from Basic checks Team.
- Not checked: hover and pressed states; a group-level error together with an option error by eye; uncontrolled form submission.
