# M6.7 Fresh setup walkthrough, example code, route links, and Playground isolation

Date: 2026-10-14

**Fresh local setup.** The committed repository was cloned into an empty directory and the Getting Started commands were run in order ([walkthrough.log](walkthrough.log)): `npm ci` (0 vulnerabilities), `npm run check` (307 unit tests, type check, component audit, lint, production build), `npx playwright install chromium`, and `npm run test:browser` (153 of 153 passed). `npm run dev` then served all sixteen routes checked (every screen, a component page, a docs article, `/llms.txt`, and `/llms-full.txt`) with HTTP 200.

**Limitation recorded:** this machine only has Node.js v25.6.1, not the pinned Node 24 LTS. The walkthrough therefore ran on Node 25 and does not prove Node 24 behavior; the pin is stated in `.nvmrc`, the README, and Getting Started.

**Example code now compiles.** `tests/example-code.test.ts` type-checks every recommended registry example against the real components through the TypeScript compiler (and confirms the check is not vacuous by rejecting a bad variant and a bad import). It found three examples that referenced handlers that did not exist (`createProject`, `reloadComponents`, `contextMarkdown`); they are now self-contained. Examples also import only from contract public modules.

**Route links.** Every site link in Getting Started, every documentation article, `/llms.txt`, and `/llms-full.txt` is checked in unit and browser tests (all return 200; anchors point to real headings and rule IDs).

**Playground portal isolation** was verified with M6.2 (Dialog, Dropdown Menu, and Tooltip portal into the Playground scope, inherit its settings, and leave the workspace unchanged) and still passes.

Verification: `npm run check` passed (351 unit tests) and all 153 production browser tests passed in this repository as well.

M6.7 is complete.
