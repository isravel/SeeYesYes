# M5.8 Export tests and size comparison

Date: 2026-10-14

Most of M5.8's coverage was built with the screens it tests. This task adds the missing pieces and pins the rest in one place.

Already covered by earlier tasks: exports after Apply and under `system` appearance (M5.1 unit and browser tests); mode and view agreement across overview, task, full, JSON, Markdown, and the Human view (M5.1); fixture counts per demo scenario (M5.4); filters on Rules, Validation, Tokens, and Components (M5.3–M5.5, M4); request recovery with Retry on every data-driven view (M4.6 and the shared data-state suite).

New in `tests/context-completeness.test.ts` (35 tests):
- **Dependency completeness:** for every one of the 29 components as a single-component task, every token, rule, example, composition partner, and example or rule component reference inside the export resolves inside it (as an included component, or a catalog entry for referenced-only ones). System-wide rules are always included, referenced-only components are never also included, and `selection.includedComponentIds` matches the components present.
- **Required guidance intact, unrelated records omitted:** the Spinner fixture keeps its prohibited use, AI guidance, accessibility requirements, effective defaults, and exactly its own tokens, and omits Dialog, Table, and Navigation and the palette. Rule applicability never widens the closure.
- **Local size comparison:** every single-component task export is smaller than the full export in both JSON and Markdown, overview is the smallest, full the largest, a small fixture is under a third of full, and adding a component never shrinks an export. `npm run report:sizes` writes [export-sizes.md](export-sizes.md): for example Overview 8,287 bytes of JSON, Task: spinner 9,611, Task: button 35,198, Task: dialog 46,459, and Full 178,095. These are bytes, not token counts, and they say nothing about agent performance, which the evaluation track measures separately.

Verification: `npm run check` and the full browser suite passed (268 unit tests; 115 browser tests).

M5.8 is complete. Next: M5.9 `/llms.txt` and `/llms-full.txt`, and Copy for LLM on Component Detail.
