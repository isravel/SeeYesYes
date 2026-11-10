# SYX-011 — Level

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/level.tsx` shows the caller's text with a leading decorative dot. `tone` is `neutral` (default), `success`, `warning`, `destructive` or `info`.
- Easy, Medium and Hard are example content only. The component never maps a word to a tone, and the default tone is neutral.
- The dot sits in a border-colored ring so a pale tone stays visible on a light surface, and forced colors use `CanvasText`.
- Unit: default neutral; every tone is accepted; the same word keeps the default tone; a custom label renders; the dot is `aria-hidden`.
- Browser: all four example tones render with the right `data-tone`, each has exactly one hidden dot, tone changes the dot color, and the accessible text is the label alone. Axe has no serious findings in light and dark, and nothing overflows at 320px.
- Not checked: dot visibility against every glass tint.
