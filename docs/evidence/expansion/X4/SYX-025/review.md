# SYX-025 AnimatedBadge review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check.

`AnimatedBadge` (`components/ui/animated-badge.tsx`) is `Badge` with an optional glint along its border. It renders Badge, so tone, fill, text and the Badge theme default are unchanged.

- The glint is a 1px gradient ring on a `::before`, cut out of the border box by a mask, so it never covers the fill or the text. It uses `color.accent` and `motion.duration`.
- Off by default (`animated` is false). Removed by `prefers-reduced-motion` and by forced colors, which leave a plain Badge.
- It has no interaction and no role.

## Evidence

- Unit (`tests/x4-effects.test.ts`): static by default, `data-animated` only when asked, label and tone kept.
- Browser (`tests/browser/x4-effects.spec.ts`): animation runs only on the animated badge; the static one has none; text size matches; animation is `none` under reduced motion; the ring is hidden in forced colors; axe sweep in light, dark, glass and clean.

## Not covered

How the glint looks over glass (needs human review), contrast of the glint colour against each tone fill (the glint is decorative and sits on the 1px border, not on text), and the cost of many animated badges on one page (the contract says one in view).
