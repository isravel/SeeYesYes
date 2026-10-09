# M2.7 shared feedback patterns

Reviewed 2026-10-09. M2.7 complete. The M2 completion gate remains open.

## What changed

Added five shared patterns with typed APIs, contracts, examples, and live previews. LoadingState provides one named status with a spinner or reserved skeleton space. EmptyState explains a successful empty result and offers an optional next action. ErrorState presents a failed request with an alert and retry button. NotFound helps a visitor recover from a missing route or resource. CopyButton reports clipboard success or failure in a polite status.

The patterns use existing Spinner, Skeleton, Alert, Button, and Link components. Retry behavior and request state remain with the consuming screen. Empty results stay distinct from errors. Clipboard failures appear when the browser denies access. No screen claims success before its action succeeds.

The registry now contains 29 components, 57 tokens, eight rules, and 37 examples. All five new contracts remain experimental and not reviewed for accessibility.

## Evidence

- [Check log](checks.txt): registry generation, TypeScript, component implementation audit, lint, and production build pass.
- The implementation audit confirms all 29 components have documented props and defaults, direct CSS token references, and styled compound selectors that agree with their contracts.

The unit and browser test suites were not run for this task. The M2.8 integration review remains open, including keyboard, contrast, screen reader, and mobile review. Clipboard permission behavior still depends on the browser's secure context and user settings; the component reports access failure clearly.

## Next task

M2.8 reviews the component set together across keyboard interactions, both appearances, container sizes, and mobile navigation. Then complete the M2 gate and record the requested evidence. Use GPT-6.1 Sol at Medium, as recommended in the project model guide.
