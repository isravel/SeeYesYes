# SYX-004 — Theme provider

Revision: `9acfd3f` plus uncommitted working tree.

## Done

- The artifact now exports the existing runtime: `ThemeLifecycleProvider`, `useThemeStores`, `useThemeSystem`, `useSurface`, `buildThemeBootstrapScript` and `SETTINGS_STORAGE_KEY`. `zustand` is a declared peer dependency, and the exporter's closure check passes with 82 modules.
- No new provider logic was written. Persistence, bootstrap, storage-failure recovery, cross-tab sync, nested `ThemeScope` and portal inheritance are the existing, already-tested code.
- Existing browser tests for nested scopes and portal inheritance (`theme-scope.spec.ts`), storage and cache failure (`theme-appearance.spec.ts`) and overlays still pass.

## Not done (so SYX-004 stays unchecked)

- The milestone gate asks for a **packed consumer** that loads the styles, changes appearance, reloads without a flash, and opens an overlay in a nested theme. I exported the artifact to a temp directory but did not pack it, install it into a consumer app, or run it. Nothing here claims that it works.
- No consumer setup doc was written for `ThemeLifecycleProvider` (it needs a `ThemeSystem` and the bootstrap script placed in `<head>`).

Next action: pack with `--pack-to` into a scratch Next app, then record the result.
