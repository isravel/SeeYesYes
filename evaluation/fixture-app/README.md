# Evaluation fixture app

A minimal Next.js app with one empty page per task (`/t1` to `/t8`). It contains the shipped component source and its types, and nothing else: no registry, documentation, exports, or `AGENTS.md`.

Do not run it from here. Build a clean copy with the reset script from the repository root:

```sh
node evaluation/reset.mjs            # writes evaluation/work/fixture-app
node evaluation/reset.mjs --verify   # also type-checks and builds the copy
```

Add condition context with `node --import tsx evaluation/context.ts <C0|C1|C2|C3> <T1..T8>`.
