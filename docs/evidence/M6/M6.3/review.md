# M6.3 Getting Started

Date: 2026-10-14

`/getting-started` is a server-rendered page (no loading state) with five steps, written against the actual local setup:

1. **Run it locally** (`npm ci`, `npm run dev`, `npm run check`, `npx playwright install chromium`, `npm run test:browser`) with the pinned Node version, each command copyable.
2. **Set a theme** (Theme editor, draft until Apply, Tokens, Playground).
3. **Use a component** with a live, working Button example and its copyable code from the registry's recommended example, plus a link to Components.
4. **How it is wired into the app:** the real root layout setup (provider and early theme script) and the repository files involved.
5. **Export context for an AI agent:** links to AI Context (where its Agent instructions section holds the `AGENTS.md` snippet) and to `/llms.txt` and `/llms-full.txt`.

It states up front that this is a local prototype with no published package, and ends with a clearly labeled "Not available yet" future package workflow, with no install command or hosted URL claimed. AI Context links back here, the Overview links here, and `/llms.txt` now lists it.

**Checked against the repository** (`tests/getting-started.test.ts`): every `npm run` script named exists in `package.json`, the Node version matches `.nvmrc` and the README, every file and folder named exists, the layout snippet's key lines are present in `app/layout.tsx`, and the example's import is a real public import.

**Defect found and fixed by the new axe test:** the page's header CSS (`.header p`) overrode the Alert title color inside the header, giving 1.02:1 contrast. The rule is now scoped to the header's direct children, so page styles no longer reach into a component's internals.

Verification: `npm run check` passed (290 unit tests, 5 new). All 141 production browser tests passed, including 4 new Getting Started journeys (every step and copyable command, a live example that really runs and copies; every internal link returns 200 and the context step lands on AI Context; no claims of a package, installer, or hosting; narrow and wide fit in both appearances with no serious axe findings). Human screen-reader and WCAG review remain open.

M6.3 is complete. Next: M6.4 concept and configuration articles with registry-derived reference documentation.
