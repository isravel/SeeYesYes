# M5.10 AGENTS.md snippet and the M5 gate

Date: 2026-10-14

**Snippet** (`buildAgentsSnippet` in `lib/contract/agent-files.ts`): system name and purpose, principles, project guidance, the theme ID (and base preset when custom) with appearance, one line per component (name, verified import, short purpose, and any effective default that differs from the contract default under the applied theme), every `system` rule as one line (ID, severity, description), and where to get more (AI Context task exports, `/llms-full.txt`, `/llms.txt`). It is an index, not implementation guidance, and every line comes from contract fields. Output is deterministic and independent of record order, and invalid settings are rejected rather than written into a misleading snippet.

**AI Context** has an "Agent instructions" section with the snippet, its size in bytes (labeled as bytes, not token counts, with the 4,096-byte target), Copy with feedback, and a short note on where to paste it (`AGENTS.md`, `CLAUDE.md`, or the instructions file the agent reads). The seeded snippet is 4,211 bytes, near the target with every component and system rule present; nothing was dropped to fit.

Tests: unit tests check that every component line (name, import, short purpose) and every system rule is present, component-specific rules are not, principles and guidance appear, size stays within 1.25 times the target, determinism, update after Apply (theme ID, base, appearance, and only changed defaults), and rejection of invalid settings. The browser test checks the shown size equals the real bytes, the copied text equals the displayed snippet, and the snippet updates after Apply (custom theme with its base, and a Button default of ghost).

**M5 gate check**
- **A08:** overview, task, and full context are deterministic, including under `system` appearance, and agree across Human, JSON, and Markdown (M5.1, M5.8). Every token value is resolved from the named scope and scope, theme ID, and base ID are truthful. Task exports follow the one-way closure and include effective defaults, relevant theme values, and required guidance with no dangling references for all 29 components, and values update after Apply. A single-component task omits unrelated components (M5.8).
- **A09 and A10 for views built so far:** search, filters, copy, and download work on Tokens, Components, Rules, Validation, and AI Context; Design Tokens files pass format validation and Style Dictionary and update after Apply (M4.8); the `AGENTS.md` snippet includes every component with verified imports and every system rule, stays near its target, and shows the new theme ID and changed defaults after Apply (this task). Layouts and Documentation close these in M6.
- **A11:** demo health, validation data, measured contrast, and review evidence stay clearly labeled and apart: "Demo results" labels on the Overview, Validation, and Accessibility screens, no combined score, and "0 of 29 reviewed" stated plainly.
- Agent files generate deterministically for the content that exists. Their full link check, including Getting Started and Documentation articles, runs in M6.
- Exports change with applied settings, every fixture result is labeled, and no action implies scanning or editing a user's project (asserted on Validation).

Verification: `npm run check` passed (279 unit tests). All 120 production browser tests passed. Human screen-reader and WCAG review remain open.

**M5 is complete** within those limits. Next: M6.1 Layouts.
