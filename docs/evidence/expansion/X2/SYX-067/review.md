# SYX-067 — Field, Fieldset and Legend

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/form-field.tsx` extends the existing FormField (no new component). Children can be one native control, or a function that receives `id`, `required`, `aria-describedby` and `aria-invalid` so a composite control can put them on the one element the label should name. A caller's own `aria-describedby` is kept.
- `components/ui/fieldset.tsx` is a native fieldset with a legend, optional help and error text described on the fieldset, a required marker with a "(required)" text equivalent, and native `disabled` for descendants.
- Defect found by the keyboard matrix and fixed: Fieldset was implemented but had no contract, so the catalog, AI context and keyboard matrix could not see it. It is now registered as `fieldset` with an example, preview and playground demo, and the matrix allows its two wrapped inputs as tab stops.
- Unit: label, help, error, required wiring on a native control; none added when absent; a caller description is kept; the composite function receives the props once; a non-element child throws a clear error; Fieldset legend, description, `data-invalid`, required text; disabled and no-error cases.
- Browser: the textarea's accessible description is its help text; the Fieldset is a named group whose description includes help and error; its Phone input, indeterminate checkbox and neutral switch are found by role.
- Not checked: a composite control (date picker) in a real page; a screen reader reading the legend plus control.
