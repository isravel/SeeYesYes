# SYX-078 — Kbd

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/kbd.tsx` renders native `kbd` elements. One key uses `children`; a sequence uses `keys`, shown as one `kbd` per key with a hidden plus between them. `size` is `small` (default) or `medium`.
- It displays only. It renders no handler, role or tab stop, and the contract says the caller owns binding the shortcut and choosing platform-specific names.
- Unit: one key as a `kbd` with the small default; a three-key sequence has three `kbd` and two hidden separators; empty `keys` falls back to children; medium size; an eight-key sequence keeps every key; no inline handlers.
- Browser: three keys render with the mono font, the keys are not focusable, pressing Ctrl+K changes nothing, the page does not overflow at 320px, and axe has no serious findings in light and dark.
- Not checked: how screen readers read a sequence, and platform-specific key naming, which is the caller's choice by design.
