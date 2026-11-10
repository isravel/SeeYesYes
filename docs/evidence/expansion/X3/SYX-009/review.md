# SYX-009 — Chip

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/chip.tsx` has three forms. With no action it is a plain `span`, with no role and no tab stop. With `onSelectedChange` it is a toggle `button` with `aria-pressed` and a check icon when on. With `onRemove` it is a `span` holding the text and a separate remove button. Passing both throws, because a button cannot hold another button.
- Tones: neutral (default), primary, success, warning, destructive, info. They tint the outline and fill only; the text stays at the foreground color, so contrast does not depend on the tone. Sizes: medium (default), small.
- Removal is the caller's. `removing` disables the remove button and shows a spinner with `aria-busy`. `error` shows text, marks the chip invalid and is the remove button's accessible description. The chip stays in place after a failure.
- The remove button's name is `Remove <text>` unless `removeLabel` is given.
- Unit: plain text without role or tab stop; the toggle with `aria-pressed`; a named remove button, with pending and failed states keeping the chip; the throw for both actions; every tone.
- Browser: the static chip is a `span` and not focusable; Space and Enter toggle the selectable chip; removing a chip drops only that one; a failed removal shows its message, keeps the chip, describes the button and the button has a solid focus ring.
- Not checked: the selected chip's contrast in dark mode by measurement (axe passes), long text wrapping beyond the 320px overflow check, disabled in the browser, and screen-reader output.
