# M2.3 native form controls

Reviewed 2026-10-08. M2.3 complete. The M2 completion gate remains open.

## What changed

Added Input, Textarea, Select, Checkbox, RadioGroup, Switch, Label, and FormField with typed native props and CSS Modules. The text controls preserve browser form behavior, including disabled and read-only states. RadioGroup uses native radios with a shared name and legend. Switch uses a native checkbox with switch semantics and a visible label.

FormField connects its visible label to one control, applies the control ID and required state, and links help and error text with `aria-describedby`. Errors set `aria-invalid` and remain visible as text. The registry now contains 18 components and 26 examples; every focusable form control is included in the focus visibility rule.

## Evidence

- [Check log](checks.txt): registry generation/type checking, lint, and production build pass.
- Each form control has a live homepage preview and a recommended example linked to its public import.
- Accessibility status remains not reviewed. Keyboard, contrast, and assistive technology review stays open for M2.8 and the M2 completion gate.

Automated and browser test suites were not run for this task.

## Next task

M2.4 wraps React Aria Dialog, Dropdown Menu, Tabs, and Tooltip. Use GPT-6.1 Sol at Medium for the overlay and focus behavior.
