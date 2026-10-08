# M2.2 primitive components

Reviewed 2026-10-08. M2.2 complete. The M2 completion gate remains open.

## What changed

Button, Link, and Spinner now share the expanded primitive inventory with Card, Badge, Separator, Avatar, Alert, Progress, and Skeleton. Each new component has a typed public API, CSS Module styles using semantic variables, generated theme defaults, a registry contract, and a working preview. Examples remain connected to the generated public import checks.

The registry validates 10 components, 57 tokens, 8 rules, and 18 examples. Component maturity remains experimental and accessibility review remains marked not reviewed. Progress uses the native progress element and keeps missing values indeterminate; Alert uses status or alert semantics by tone; Avatar falls back to initials; decorative placeholders stay hidden from assistive technology.

## Evidence

- [Check log](checks.txt): registry generation/type checking, lint, and production build pass.
- The homepage preview renders all 10 component examples. The displayed count and milestone label now match the expanded inventory.
- New CSS token references are listed in their contracts. The broader M2.6 contract and accessibility review is still open.

No test suite was run for this task. Human keyboard, contrast, and assistive technology review remains open for M2.8 and the M2 completion gate.

## Next task

M2.3 builds native form controls. Return to GPT-6.1 Sol for M2.4 overlays, M2.6 contract review, and the M2 completion gate.
