# M2.6 component contract review

Reviewed 2026-10-08. M2.6 complete. The M2 completion gate remains open.

## What changed

Checked all 24 required components against their public props, defaults, direct CSS token references, variant selectors, relevant states, and composition. [The inventory](inventory.md) records each component's states, theme-editable defaults, and styled compounds.

Fixed 16 missing CSS token references and removed Avatar's unused radius.control reference. Direct token lists now match each component's stylesheet. Child components keep their own token contracts and are included through composition dependencies.

Expanded the form states to cover checked/selected values, read-only and invalid controls, required labels, help, and errors. Added image/fallback states for Avatar, structural/decorative states for Separator, reduced-motion states for Spinner and Switch, hover/focus states for menus and tabs, and contained overflow/focus for Table. RadioGroup now documents its help, error, required props, and both change callback arguments. FormField lists the compatible single-control components. Overlay contracts document className and refs.

Button, Link, and Select now require children in their public types, matching the contracts. JSX callers already supplied content. Callers using createElement must put children in the props record; the server-rendering tests were updated to do that. Input applies its generated text default, and Textarea applies its generated three-row default. The Notes preview omits an explicit row count so the browser check verifies that fallback.

The only CSS rule combining two variant keys is Button's small ghost rule. Its compound description now matches the actual spacing rule. Size or orientation selectors combined with native checked/focus states are ordinary state styling. No unsupported compound combinations were added. Theme defaults stay within the schema's variant and size keys; tones, shape, orientation, and activation remain instance choices. Destructive Button remains excluded from theme defaults.

## Repeatable checks

Added audit:components to the standard check workflow. The audit reads the shipped public functions and CSS Modules. It checks documented prop existence, required props in both directions, allowed literal values, explicit literal defaults or generated default use, exact direct CSS tokens, styled compound selectors, and CSS states. Existing registry validation checks theme-default allowlists, reference integrity, compound values, and review evidence requirements.

Nine regression cases test the CSS audit with missing, unused, and unknown tokens, invalid variant values, missing states, compound drift, selector key ordering, private variables, and state-only selectors. This source audit follows the current CSS and function conventions. It is a guard against contract drift, not an accessibility audit or a substitute for testing behavior.

## Evidence

- [Check log](checks.txt): all 24 component audits pass, along with generation, type checking, lint, 95 unit tests, and production build.
- [Browser log](browser.txt): all 16 browser checks pass, including the default Textarea rows, keyboard overlays, scope inheritance, mobile drawer, skip link, native table semantics, contained scrolling, and viewport checks.
- M2.5's [screenshots](../M2.5/review.md) document the existing light/dark presentation. This task changes metadata, type requirements, and default application rather than the visual design.

All components remain experimental and accessibility status remains not reviewed. Human contrast, assistive technology, and the broader cross-container review remain open for M2.8 and the completion gate.

## Next task

M2.7 adds shared loading, empty, error/retry, not-found, and copy-feedback patterns. Follow the established primitives. Return to GPT-6.1 Sol for M2.8 and the completion gate.
