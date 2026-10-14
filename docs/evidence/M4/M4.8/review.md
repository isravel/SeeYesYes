# M4.8 Design Tokens exporter and the M4 gate

Date: 2026-10-14

**Exporter** (`lib/contract/design-tokens.ts`, a pure module with no React or browser APIs, so the Phase 2 MCP server can reuse it) turns the applied theme's resolved tokens into the Design Tokens Format Module 2025.10 (pinned at M1): one file per mode, `seeyesyes.light.tokens.json` and `seeyesyes.dark.tokens.json`, plus `seeyesyes.export-notes.json`.

- Groups nest from the token ID (`color.on-primary`). Every token has `$type`, `$value`, `$description` (its purpose), and `$extensions["com.seeyesyes"]` with `id`, `cssVariable`, `kind`, and `exampleIds`. Values come from each token's explicit `interchange` value for the selected mode, never from parsing CSS: structured OKLCH colors, `{ value, unit }` dimensions and durations, four-number easing, structured shadow layers (inset only when true), font family names, font weights, and numbers. A no-shadow scale exports as a transparent zero shadow, never the string `none`.
- Mode-independent tokens appear in both files. Output is deterministic and independent of input order.
- Values the contract marks `unsupported` stay out of the files and appear in the notes with their ID, reason, and affected modes. The notes summary says "N of M registry tokens" whenever exclusions exist and only says "every" when none do. The seeded registry has no unsupported tokens today.
- An invalid supported value (out-of-range color, unknown unit, bad easing, negative blur or duration, empty font family, weight outside 1–1000, non-finite number, an ID that cannot form a valid group, or a group/token collision) fails the whole export with an error naming the token and mode. Nothing is silently dropped or downgraded to a string.
- A format-shape validator (`validateTokenDocument`) checks every emitted file before it is offered.

**Tokens screen:** a "Download design tokens" section offers the light and dark files and the export notes, states the format and that tools such as Style Dictionary read it, lists any exclusions with reasons, and shows an error instead of downloads if an export would be invalid. Downloads follow the applied theme: an unapplied draft changes nothing, and applying one changes the files and the notes' theme and `basedOn` IDs.

**Style Dictionary (mandatory interoperability check):** `style-dictionary` 5.6.1 is a pinned development dependency. Tests parse both real files with `usesDtcg: true` and warnings treated as errors; all 57 tokens resolve per mode, structured OKLCH colors reach CSS as hex, an edited theme's radius reaches the parsed CSS, and every representative fixture type parses. This check ran and passed; it was not skipped.

**Gate check (M4):** A02: all 29 components are metadata-complete with implementation, contract, and recommended example (M4.7 inventory test). A09 (component- and token-related): Tokens search, filters, and copy (M4.1), component contract copy and code copy (M4.4–M4.5), and the Design Tokens export with format validation, Style Dictionary parsing, exclusions, and invalid-value rejection (this task) all work; the `AGENTS.md` snippet part of A09 belongs to M5. A12: every interactive component passes the automated keyboard matrix (M4.7). Every required component has a real detail route and a working preview with controls (M4.3–M4.4).

Verification: `npm run check` passed (200 unit tests, 37 new for the exporter, validator, fixtures, exclusions, invalid values, applied-theme changes, and Style Dictionary). All 75 production browser tests passed, including a new download journey that reads the downloaded files and notes and checks the draft-versus-applied behavior.

Limits: automated evidence only. Human screen-reader and WCAG review remain open for M2–M4, and no component is marked reviewed.

**M4 is complete** within those limits. Next: M5.1 context logic and exports.
