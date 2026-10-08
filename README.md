# SeeYesYes

A design system that humans and AI can understand.

The first milestone builds the shared contract and a working foundation preview. The full workspace is planned in `docs/planning/milestones-and-tasks.md`.

## Run locally

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production preview, run `npm run build` then `npm start`.

## Check the foundation

```sh
npm run check
npx playwright install chromium
npm run test:browser
```

The checks generate a public-import and preview-key probe, type-check it, lint the project, run focused Node tests, and build the production app. Browser checks use the production build. They cover hydration, native activation, mock scenarios, basic axe checks, and screenshots at 320px and desktop.

## How it fits together

- `lib/contract/schema.ts` defines the runtime schemas and their inferred types.
- `lib/data/registry.ts` is the single authored registry. It stores token definitions, not resolved snapshots.
- `lib/contract/validate.ts` checks references, defaults, imports, focus-rule agreement, and theme data.
- `lib/theme/resolve.ts` turns canonical constants and theme paths into CSS values and typed interchange values.
- `lib/contract/context.ts` builds overview, task, and full context without React or browser APIs. Task closure follows references outward and keeps other example components as catalog entries.
- `lib/data/adapter.ts` validates transport responses. Server pages use the local adapter; future client views use the HTTP adapter and scenario-aware registry queries.
- `app/api/[...path]/route.ts` serves read-only mock endpoints. Add `?scenario=normal`, `empty`, or `error` for deterministic responses.
- `components/ui` contains minimal Button, Link, and Spinner implementations, expanded in M2.

Fonts ship locally through Next.js. Component styles use CSS Modules and shared semantic variables. The generated default CSS comes from the same resolver as context exports.

## Current limits

This is the M1 foundation, not the complete Phase 1 workspace. Theme editing and persistence, the full component set, layouts, documentation, and export screens come in later milestones. The demo validation endpoint returns fixtures; it never scans a project. Seed components are experimental and have not had the required human accessibility review. No package is published and no site is deployed.
