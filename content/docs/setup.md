---
title: Local setup
description: Run the prototype locally and check that it works.
order: 5
---

# Local setup

This is a local prototype. No package is published and nothing is deployed, so you run the repository itself.

## Requirements

Use Node.js 24 LTS and npm. The repository includes an `.nvmrc`, so `nvm use` picks the right version.

## Run it

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production preview, run `npm run build` and then `npm start`.

## Check it

```sh
npm run check
npx playwright install chromium
npm run test:browser
```

`npm run check` type-checks the project, audits components, lints, runs the unit tests, and builds the app. The browser tests use a production build.

## Use a component

Import a component from its own file using the repository alias:

```tsx
import { Button } from "@/components/ui/button";
```

See [Getting started](/getting-started) for a working example, and [Components](/components) for every component's contract.

## Not available yet

A published package, an installer, and a hosted site are not part of this prototype.
