# SYX-023 — Switch

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/switch.tsx` is still a native checkbox input with `role="switch"` inside its label. New `tone`: `primary` (default, unchanged) or `neutral`, which uses foreground colors so brand color stays for actions. Theme defaults can set the tone.
- Unit (`SYX-023 Switch and SYX-024 Checkbox`): role, type, label and neutral tone; default tone primary; the input is wrapped by its label; `required`, `aria-invalid`, `defaultChecked` and `disabled` pass through.
- Browser: the control page renders a neutral switch inside a Fieldset, found by role and name, and passes axe in light and dark.
- Not checked: hover, pressed and focus ring of the neutral tone in the browser; sizes small and large.
