# M4.5 Usage boundaries, tokens, rules, and the structured contract

Date: 2026-10-13

Component Detail gained the remaining reference sections.

- **Usage boundaries:** Prohibited use (the contract list plus violation examples as code and explanation) and Composition (linked partner components plus the contract's constraints) from M4.3 now sit beside the new sections below. No separate summary section was added, to avoid repeating the same contract text.
- **Tokens:** each token links to its card on the Tokens screen and shows its CSS variable and its value under the applied theme. For mode-dependent tokens the value is the mode currently in effect, and the section says which mode that is; it follows OS changes under `system` appearance.
- **Rules:** a new section lists every rule linked to the component (component and accessibility rule IDs, deduplicated) with its severity, category, description, and suggested fix, resolved from the registry. Rules are shown inline and anchored (`#rule-<id>`) rather than linked, because the Rules screen arrives in M5; linking to it now would 404.
- **Contract:** a structured, canonically ordered JSON view of the component's registry record with a Copy button that confirms "Contract copied to clipboard." (or the shared failure message). Code blocks (matching code, shared examples, violations, contract) are keyboard-focusable and labeled so scrolled code is reachable.

Not in this task: "Copy for LLM" (the task-mode Markdown export belongs with the M5 context work).

Verification: `npm run check` passed (159 unit tests). All 53 production browser tests passed, including two new ones: token values and the mode in effect change when the OS mode changes, rules and constraints and prohibited uses match the contract for Button; and the displayed contract JSON equals the registry record, copies with feedback, and the code block takes keyboard focus. The all-components check now expects the Rules and Contract headings on all 29 routes. Human screen-reader and WCAG review remain open.

M4.5 is complete. Next: M4.6 exercise loading, empty, error/retry, no-match, and unknown-component behavior across the screens.
