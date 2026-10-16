# SeeYesYes

A design system that humans and AI can understand. Whether agents do better with it has not been measured yet.

M1 builds the shared contract and a working foundation preview. M2.1 adds shared scales and isolated theme scopes. The full workspace is planned in `docs/planning/milestones-and-tasks.md`.

## Run locally

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:8088. For a production preview, run `npm run build` then `npm start` (also on port 8088).

## Check the foundation

```sh
npm run check
npx playwright install chromium
npm run test:browser
```

The checks generate a public-import and preview-key probe, type-check it, lint the project, run focused Node tests, and build the production app. Browser checks use the production build on a dedicated port. Their scope fixture route is available only on the test server. They cover hydration, native activation, mock scenarios, basic axe checks, and screenshots at 320px and desktop.

## How it fits together

- `lib/contract/schema.ts` defines the runtime schemas and their inferred types.
- `lib/data/registry.ts` is the single authored registry. It stores token definitions, not resolved snapshots.
- `lib/contract/validate.ts` checks references, defaults, imports, focus-rule agreement, and theme data.
- `lib/theme/resolve.ts` turns canonical constants and theme paths into CSS values and typed interchange values.
- `lib/contract/context.ts` builds overview, task, and full context without React or browser APIs. Task closure follows references outward and keeps other example components as catalog entries.
- `lib/data/adapter.ts` validates transport responses. Server pages use the local adapter; future client views use the HTTP adapter and scenario-aware registry queries.
- `app/api/[...path]/route.ts` serves read-only mock endpoints. Add `?scenario=normal`, `empty`, or `error` for deterministic responses.
- `components/theme/ThemeScope.tsx` provides scoped variables, component defaults, OS appearance, and React Aria portal containers. The workspace uses `<html>`; previews use their own roots.
- `components/ui` contains minimal Button, Link, and Spinner implementations, expanded in M2. They read their nearest scope and use generated contract defaults when unscoped.

Fonts ship locally through Next.js. Component styles use CSS Modules and shared semantic variables. The generated default CSS comes from the same resolver as context exports.

## Handoff

See [docs/handoff.md](docs/handoff.md) for setup, architecture, what is mocked, acceptance evidence, and open work. The [final gate review](docs/evidence/M7/gate.md) passes the automated checks, including performance. Phase 1 remains open for human accessibility and visual review, plus actual browser zoom testing.

## Current limits

All thirteen views are built: Overview, Getting Started, Theme, Tokens, Components, Component Detail, Layouts, AI Context, Rules, Accessibility, Validation, Playground, and Documentation, plus `/llms.txt` and `/llms-full.txt`. Add `?scenario=empty` or `?scenario=error` to any data-driven screen to see its empty and error states. Results shown as validation or health are demo fixtures. The demo validation endpoint never scans a project. Seed components are experimental and have not had the required human accessibility review. No package is published and no site is deployed.
