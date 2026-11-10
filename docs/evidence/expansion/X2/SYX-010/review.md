# SYX-010 — Badge

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/badge.tsx` keeps five tones (neutral default) and takes an optional `icon`. The icon sits in an `aria-hidden` span, so the meaning has to be in the label text (for example "4.8 rating"). The component has no rating or popularity logic; callers choose the text and tone.
- The type omits `role`, `onClick` and `tabIndex`, so a badge cannot become interactive.
- Unit (`SYX-010 Badge`): default tone; all five tones; icon hidden and text kept; long label stays plain text.
- Browser: the control page renders a warning "4.8 rating" and a success "New" badge and passes axe (serious or critical) in light and dark.
- Not checked: wrapping or truncation of a very long label in a narrow card; contrast of each tone in glass over an image.
