# M1 foundation review

Reviewed 2026-10-08. M1.1–M1.8 complete.

The app runs locally and builds for production. The registry seeds Button, Link, Spinner, 37 token definitions, eight rules, eleven examples, one preset, two self-hosted fonts, and project guidance. Layout metadata stays empty until M6.

## Evidence

- [Check log](checks.txt): type checking, lint, 78 Node tests, and production build pass.
- [Browser log](browser.txt): three tests pass against the production build on the dedicated port 3107. Native Button activation works. Core preview has no hydration/page/console errors and no serious or critical axe findings. API fixtures recover with the normal scenario; unknown IDs return 404 and writes return 405.
- [Dependency audit](dependency-audit.json): zero reported vulnerabilities for the final lockfile.
- [Registry and context report](registry-and-context.json): validated seed counts and fixed Link task/full byte comparison. Task context keeps referenced-only components out of its full contracts.
- Screenshots: [light mobile](light-320.png), [light desktop](light-1280.png), [dark mobile](dark-320.png), [dark desktop](dark-1280.png). Reviewed for legibility, visible seed previews, and basic overflow.

A02 seeded registry integrity and A15 foundation evidence pass. Full inventory acceptance stays open until M4; complete product journeys and A15 final acceptance stay open until M7. This review does not claim screen-reader testing, complete WCAG conformance, full component interaction coverage, or the later theme lifecycle.

## Decisions

- Next.js 15.5.27 was still supported, but its dependency audit found vulnerable PostCSS. The architecture spec and change log record the move to current stable Next.js 16.4.0 and React 19.3.0.
- Use Zod 4.6.5, React Aria Components 1.22.0, TanStack Query 5.104.1, and Zustand 5.0.15. Dependencies are pinned in the lockfile. State and complex-control libraries are reserved for their planned milestones.
- Run on Node 24 LTS (verified 24.19.0). Vitest 5.0.3, Playwright 1.64.0, and axe-core's Playwright integration supply focused checks. ESLint 10 uses TypeScript and React Hooks rules; the Next lint preset was removed because its glob dependency had an unpatched advisory. Browser axe checks remain required.
- React Aria provides `UNSAFE_PortalProvider` from `@react-aria/overlays`, with `getContainer: () => HTMLElement | null`. The generated probe type-checks that signature, every public component import, and recommended/layout preview keys. M2 implements actual scope and overlay behavior.
- Pin the Design Tokens Format Module 2025.10. Its exporter and mandatory Style Dictionary checks remain in M4.8.
- Fonts are bundled locally and loaded through `next/font/local`. CSS font tokens use framework variables; their canonical interchange values keep readable family names.
- Minimal component implementations stay experimental and accessibility-unreviewed. The preview reads metadata through the local adapter; client preview lookup stays inside a client component.

Version/support references checked at implementation start: [Next.js support](https://nextjs.org/support-policy), [React Aria portals](https://react-aria.adobe.com/PortalProvider), [Design Tokens 2025.10](https://www.designtokens.org/tr/2025.10/format/). Exact package versions and audit status were checked against npm.

## Handoff

No open M1 blockers. Validation results are demo fixtures; no scanning, project editing, package publishing, or deployment happens.

Next: M2.1, scales, semantic variables, ThemeScope, and style ownership. Use GPT-6.1 Sol at Medium. Relevant specs: `docs/specs/02-architecture-and-theme.md` (Theme scopes and complex-control portal boundary), `docs/specs/05-visual-system-and-components.md` (foundations and ownership), and `docs/specs/03-design-system-contract.md` (component defaults). After M2.1 passes, focused M2.2–M2.3 component work can use GPT-5.6 Luna at Medium; switch back to Sol for M2.4 overlays and the M2 gate.
