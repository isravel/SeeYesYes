# SYX-070 — Checkbox group

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/checkbox-group.tsx` renders `Fieldset` with a legend and one native `Checkbox` per option, all sharing `name`, so each checked option submits `name=value`.
- Controlled with `value`, or uncontrolled with `defaultValue` (an empty array by default). `onChange` receives the selected values in option order; a value the options do not list is kept after them.
- Options may have a `hint`, which is the checkbox's accessible description, and may be disabled. `disabled` on the group disables all. `error` and `helpText` are text on the fieldset, and `error` also marks each checkbox invalid. `required` is shown in the legend and is not put on every checkbox, which would require all of them.
- Orientation vertical (default) or horizontal; size small, medium (default), large.
- Unit: a named fieldset of native checkboxes with a shared name and nothing checked by default; none, some and all checked for default and controlled values; hint association; disabled option and group; help and error text; both orientations.
- Browser: the hint is the accessible description; checking in reverse order still reports option order; unchecking removes only that value; the disabled option is disabled and skipped by Tab.
- Not checked: the invalid state in the browser, horizontal layout at narrow widths beyond the 320px overflow check, form submission in a real form, and screen-reader output.
