# Architecture and theme behavior

## Stack

The original baseline is Next.js 15, React 19, and strict TypeScript. Implementation uses Next.js 16.4 and React 19.3: the M1 dependency audit found a vulnerable PostCSS dependency in the supported Next.js 15.5.27 baseline. The patched current stable major avoids carrying that dependency into a new app. At M1.1, confirm that this baseline is still supported and receives security fixes. If it does not, use the current stable major and record the change and its reason. Resolve compatible patch versions at implementation start and commit the lockfile.

- Native CSS and CSS custom properties are the styling foundation.
- Use CSS Modules for component-local styles. Keep global CSS limited to reset, fonts, foundations, and theme variables. SCSS is not required.
- Apply OOCSS principles within components: reusable structure, token-driven appearance, and independence from parent layouts. See [Visual system and components](05-visual-system-and-components.md) for naming and ownership rules.
- Tailwind v4 is optional support. Components must not require utility-class composition.
- Use Phosphor Icons, with accessible names where needed.
- Use TanStack Query for client requests to mock data.
- Use Zod for registry schemas, response validation, draft validation, and stored settings. Derive TypeScript types from the schemas.
- Theme controls write directly to the draft store. Add React Hook Form only if a real submit-style form needs it; do not run two sources of truth for live theme controls.
- Use Zustand only for applied settings, the Theme draft, and Playground session state.
- Prefer CSS motion. Add Framer Motion only for an interaction that needs it.
- Use React Aria Components (Adobe's unstyled, accessible primitives) for Dialog, Dropdown Menu, Tabs, and Tooltip. See [Complex controls with React Aria](#complex-controls-with-react-aria). Any other headless library needs a recorded reason and the same portal-container support.
- Fonts come from the registry's font allowlist. Self-host them through the framework's font loader. Do not load arbitrary user-entered font families.
- Test tooling is chosen in M1.1. A typical set is a unit runner such as Vitest, a browser runner such as Playwright, and axe-core for automated accessibility checks.

Do not add a runtime styling engine. Keep editing, filtering, and previews in focused client components.

### Complex controls with React Aria

React Aria supplies keyboard behavior, focus management, and screen-reader semantics. SeeYesYes supplies the API, styles, and contract.

- Wrap each React Aria component in a SeeYesYes component with its own typed props. Do not re-export React Aria props wholesale; the contract documents only the SeeYesYes API.
- Style wrappers with CSS Modules through `className`. React Aria's state data attributes (such as `data-focus-visible`, `data-pressed`, `data-selected`) are allowed state selectors at this integration boundary. Elsewhere, prefer native selectors as described in [Naming and style ownership](05-visual-system-and-components.md#naming-and-style-ownership).
- `ThemeScope` passes its portal container to React Aria, so Dialog, Dropdown Menu, and Tooltip overlays render inside the right theme scope. Confirm the current portal-container API at M1.1 and record it.
- Keep native elements where they are enough: Select stays a native `select`, and Radio Group, Checkbox, and Switch use native inputs unless a recorded requirement says otherwise.
- Import per component so routes that do not use these controls do not load them. Record their JavaScript cost in the performance report.

## Data flow

Store system identity, principles, fonts, token definitions, theme presets, component contracts, rules, examples, and layout metadata in one serializable registry (`DesignSystem` in the contract). Demo validation scenarios are separate fixtures. Keep React implementations in a separate map keyed by contract ID. Contract data must remain independent of React and CSS Modules; generated class names are private implementation details, not public customization hooks.

Pure functions resolve theme values into tokens and compose context from the registry and current settings. Screens use typed access functions/hooks rather than importing raw fixtures.

Use a shared adapter interface so real transport can replace mocks. Avoid a generalized plugin framework.

### Server and client boundaries

Server components read the registry through the typed access functions directly. They never fetch the app's own route handlers, which are not available at build time.

Client views that load registry data through adapters are the **data-driven views**. Each has a primary request. A secondary request (usually the full registry, for linked examples and components) runs only after the primary request succeeds with at least one item, using a dependent query. An empty primary list therefore shows the empty state without waiting on, or failing because of, the registry.

| View | Primary request | Secondary request | `empty` scenario shows | `error` scenario shows |
| --- | --- | --- | --- | --- |
| Tokens | `/api/tokens` | — | Empty list with a next action | Error with Retry |
| Components | `/api/components` | — | Empty list with a next action | Error with Retry |
| Component Detail | `/api/components/:id` | Registry | Missing-data error with Retry (a singleton is never “empty”) | Error with Retry |
| Rules | `/api/rules` | Registry | Empty list with a next action | Error with Retry |
| Layouts | `/api/layouts` | Registry | Empty list with a next action | Error with Retry |
| AI Context | Registry | — | Missing-data error with Retry; catalog emptiness is covered by search with no matches | Error with Retry |
| Validation | `/api/validation` | — | “No demo reports” with a next action | Error with Retry |
| Accessibility | `/api/components` and `/api/validation` | — | Each section shows its own empty state | Each section shows its own error with Retry |
| Overview | `/api/validation` (demo health panel only) | — | “No demo results” | Error with Retry in the panel only |

Unknown component IDs return 404 in every scenario and show the not-found view.

Overview text, Getting Started, and Documentation articles are server-rendered from the registry and have no loading state. The Theme editor and Playground initialize from bundled defaults and applied settings so Reset draft never depends on a request. Keep the largest above-the-fold content server-rendered so client loading states do not delay LCP.

## Mock transport

| Endpoint | Returns |
| --- | --- |
| GET /api/registry | Complete validated `DesignSystem`, including fonts, presets, token definitions, contracts, rules, examples, layouts, and project guidance |
| GET /api/system | Identity, principles, and fonts |
| GET /api/theme | Default theme configuration |
| GET /api/tokens | Token definitions only (`TokenDefinition[]`); the Tokens screen resolves values locally against the applied theme |
| GET /api/components | Component contracts |
| GET /api/components/:id | One contract; unknown IDs return 404 |
| GET /api/rules | Usage and quality rules |
| GET /api/ai-context | Overview context for the default theme, with `scope: "default-theme"` |
| GET /api/validation | Demo validation scenarios |
| GET /api/layouts | Layout metadata and example references |

`getRegistry()` loads `/api/registry` through a typed adapter and validates the complete `DesignSystem`. Cache this immutable registry once per scenario and registry version using TanStack Query. Detail, Rules, Layouts, and AI Context reuse it; they never import raw fixture objects or guess missing example data. Component Detail also loads the selected contract through its adapter so unknown IDs retain the specified 404 behavior.

The narrower endpoints remain useful for lists and focused requests. They are projections of the same registry, not separate copies. A successful registry response is atomic and internally complete. For `scenario=empty`, this singleton returns a typed missing-data error; list endpoints may return empty lists. Cache keys include the scenario so an error/empty test cannot reuse a normal response. All request dependencies on a data-driven screen share its scenario and participate in its loading/error/retry state, following the table in [Server and client boundaries](#server-and-client-boundaries).

Downloading the full registry to the frontend does not mean exporting it to every agent task. The browser still produces the selected overview/task/full projection locally. No browser settings or validation fixtures are included in `/api/registry`.

`/llms.txt` and `/llms-full.txt` are static route handlers generated at build time from the registry and default preset; see [Agent-readable files](03-design-system-contract.md#agent-readable-files-and-copy-for-llm). They are not adapter endpoints and ignore the `scenario` parameter.

Keep `lib/contract` and `lib/theme` resolution free of React and browser APIs so a Phase 2 MCP server can import them in Node.

The browser derives tokens and context for its applied settings locally, using the same pure functions as the endpoints. Theme editing does not write to the server. Overview, task, and full exports are projections of the same registry. Scope task context through stable IDs and reference traversal, not AI inference or a retrieval service. Keep full exports available for audits; do not attach them to every task.

Use a typed response envelope: `{ data: T }` on success and `{ error: { code, message } }` on failure, with appropriate HTTP status. Validate responses at the adapter boundary.

Keep simulated latency short and deterministic. Never use random failures. List endpoints can return empty lists. A missing singleton is an error.

### Demo scenarios

A `scenario` query parameter selects `normal`, `empty`, or `error` responses for data-driven views. The adapter forwards it to the mock handlers. This works in production builds so acceptance checks can run against them. Development builds also show a visible scenario selector; production builds do not show it in normal navigation. Retry repeats the request with the current scenario; switching back to `normal` enables recovery.

This mock scenario is separate from the Validation screen's clean, mixed, and failing demo reports.

## Theme lifecycle

There are three configurations:

1. **Default:** the bundled default preset.
2. **Applied:** workspace settings (`WorkspaceSettings`: theme plus appearance) used by the workspace, Tokens, Accessibility contrast checks, and AI exports.
3. **Draft:** a theme edited in Theme, reflected immediately in that screen's preview only. The draft does not contain appearance.

“Apply to workspace” validates the draft, sets its theme identity as described in [Theme identity](03-design-system-contract.md#theme-identity), replaces the applied theme, and stores the settings locally. It never changes the appearance preference. “Discard changes” restores the draft from the applied theme. “Reset draft” loads the default preset into the preview; Apply is still required to change the workspace.

The workspace appearance preference changes only through the appearance selector. It commits through the settings writer, with pending feedback while saving, and does not touch the draft or the unsaved indicator. In session-only mode it applies locally without a persistent write.

Draft changes survive navigation during the session. Refresh restores applied settings and creates a fresh draft from them. Show an unsaved indicator when the draft theme differs from the applied theme.

### Persistence

Store one `PersistenceEnvelope` (defined in the [contract](03-design-system-contract.md#minimum-typed-model)) under a versioned localStorage key, for example `seeyesyes:settings:v1`. It contains canonical `WorkspaceSettings`, the `themeRevision`, and an optional derived bootstrap cache. The downloadable settings file contains only `WorkspaceSettings`, without the cache. Validate settings on read. Cache data is disposable and never replaces the settings source of truth. Invalid or incompatible data falls back to defaults with a brief notice. If storage is blocked, settings work for the session and the UI explains that refresh will reset them.

#### Multiple tabs

One settings writer handles every save. In supported secure contexts, serialize all app settings writes across tabs with an exclusive [Web Lock](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) named `seeyesyes:settings:v1:write`. Acquire the lock before reading the latest envelope, validating it, merging the change, producing any cache, and writing the complete envelope with one `setItem`. Keep all of those steps inside the lock. A read-before-write sequence without the lock is not sufficient.

Apply changes only the theme and its derived cache; it preserves the latest stored appearance. The appearance selector changes only appearance and preserves the latest theme/revision/cache. Appearance requests are applied in lock acquisition order. Increment `themeRevision` only when the theme actually changes. All app writers use this same lock; the guarantee does not cover manual storage changes or external scripts that bypass it.

Record `draftBaseThemeRevision` as session state when creating a draft or loading applied settings through Discard. When Apply acquires the lock, compare that baseline with the latest stored revision. If another tab has changed the theme, reject Apply without writing, preserve the draft, adopt the latest applied settings, and show “The theme changed in another tab. Your draft is still here.” Offer Discard changes to load the latest applied theme. Do not automatically overwrite or merge two competing theme drafts. Reset draft changes the draft values but does not erase a stale baseline. After a successful Apply, refresh the draft baseline from the written revision.

Show a pending save state while waiting for the lock and prevent duplicate submits. Commit applied settings and report a persisted save only after the write succeeds. A cancelled or failed lock request leaves the pending action unsaved and offers Retry; never fall back to an unlocked persistent write.

Each tab listens for the browser `storage` event on the settings key. Treat the event as an invalidation signal: reread and validate the current stored envelope instead of adopting an event payload that may already be superseded. Adopt the latest applied settings and reapply workspace variables and appearance. An open draft and its baseline stay intact; recalculate its unsaved indicator against the latest theme. Playground state is unaffected. The writing tab adopts the envelope it wrote directly because it does not receive its own storage event.

If Web Locks is unavailable, do not write shared localStorage. Initialize from validated saved settings if readable, then use session-only settings and show “Changes stay in this tab and reset on refresh.” Use the same session fallback when storage is blocked. A tab in session-only mode ignores remote settings events so another tab does not replace its local work. The cross-tab guarantee applies to persistent saves through the serialized writer; session-only settings never overwrite another tab's stored values.

### Early initialization

Do not read browser storage during server rendering. A small inline script runs before first paint and uses a validated bootstrap cache with:

- A cache format version and token-resolver version.
- A `themeRevision` integer. The settings writer increments the envelope's `themeRevision` whenever the applied theme changes and writes the same number into the cache in the same write. The script compares the two numbers; it does not serialize or compare themes.
- Mode-independent CSS variable values and separate light/dark maps of mode-dependent values (colors, and shadows whose color changes with mode), derived by the same token resolver.

Persist settings and both mode maps atomically after Apply. When the workspace appearance selector changes, persist the new preference through the same writer without changing `themeRevision`, so the cache stays valid. Preview changes never update persistence.

Before applying any cache values, the script checks the envelope, revision match, and versions. It checks every variable name against `^--sys-[a-z0-9-]+$` and every value against a short allowlist of value patterns rather than a full token list, so the script stays small. The allowlist covers every value form the resolver emits:

- OKLCH colors and the keyword `transparent`
- Lengths, durations, and unitless numbers
- Shadow lists built from those parts, and `none`
- `cubic-bezier(…)` with four numbers
- Font-family lists of quoted or unquoted names separated by commas
- `var(--sys-…)` and `var(--font-…)` references, for aliases and framework font variables

A resolver test checks that every value it produces matches one of these patterns, so adding a new value form fails the test until the allowlist is extended. If any name or value fails, the script discards the whole cache and the page renders defaults until hydration; it never applies part of a cache. Use `style.setProperty` for validated custom properties; do not inject an arbitrary stored stylesheet or HTML. If the app adds a Content Security Policy, give this script a nonce or hash. Resolve `system` with the current `matchMedia('(prefers-color-scheme: dark)')` result on every page load, then apply the mode-independent values and that mode's map. Do not reuse the mode that was active at Apply time.

Listen for OS appearance changes while `system` is selected, including between bootstrap and client hydration. The client store and `ThemeScope` adopt the same settings and selected mode without rewriting them to defaults. If the cache is absent, incompatible, malformed, or stale, discard it and render bundled defaults until the client validates and resolves the saved settings. Corrupt settings still fall back to defaults with a notice.

The no-flash acceptance check covers valid compatible settings/cache, including appearance changes and an OS mode change between visits. Safe fallback, rather than a no-flash guarantee, applies to invalid or stale caches.

### Theme scopes

A `ThemeScope` component wraps each themed area: the workspace, the Theme preview, the Playground, and each layout preview. It provides component defaults and the portal container through React context, because CSS variables cannot carry a variant or size. Overlays rendered inside a scope portal into that scope's container.

Where variables live depends on the scope:

- **Defaults** come from global CSS on `:root`, generated by the same resolver from the default preset.
- **The workspace scope** uses `<html>` as its root. It renders no CSS variables or appearance attribute in server markup, so it cannot hide what the early-initialization script set. After hydration it writes applied values and appearance to `<html>` with `style.setProperty`, the same way the script does. Inline values on `<html>` override the `:root` defaults.
- **Nested scopes** (Theme preview, Playground, layout previews) set their variables and appearance on their own root element. They render only on the client or after settings are known, so they never show stale defaults.

The early-initialization script changes `<html>` before React hydrates. Add `suppressHydrationWarning` to the `<html>` element only, with a comment explaining why. Do not use it anywhere else.

## Theme rules

- Appearance is light, dark, or system. System follows operating-system changes during the session.
- Store separate light and dark semantic color maps. Editing one leaves the other intact.
- Theme and Playground have their own preview appearance toggle, separate from the workspace preference.
- OKLCH editor ranges: lightness 0–1, chroma 0–0.4, hue 0–360, alpha 0–1. Convert or clamp into the supported display gamut before reporting rendered contrast.
- Palette suggestions require an explicit action. They copy palette values into roles for the mode being edited. Do not silently change the other mode or claim every generated pair is accessible.
- Radius, density, typography, shadows, effects, and motion resolve into shared scales and semantic variables.
- `shadows` sets the elevation scale used by overlays and raised elements. `effects.surface` sets how surfaces separate from the background: `clean` uses flat fills and borders; `subtle-depth` adds slight tonal layering and uses the shadow scale. With `shadows: "none"`, subtle depth uses tonal layering only.
- Component defaults are limited to each contract's `themeDefaults` values. They must not alter semantic behavior, accessible names, form submission, or disabled state. Precedence is: explicit prop, then theme default, then contract default.
- OS reduced-motion preference overrides any enabled motion setting.
- Playground settings are session-only, initialized from applied settings. They affect only Playground and never overwrite the workspace. Provide Reset to applied theme.

### Contrast pairs

Calculate contrast for these pairs in both modes. A failing draft remains inspectable and may be applied, with a visible warning. It must not earn a verified accessibility status.

| Foreground | Background | Minimum |
| --- | --- | --- |
| `foreground` | `background`, `surface` | 4.5:1 |
| `mutedForeground` | `background`, `surface`, `muted` | 4.5:1 |
| `onPrimary`, `onSecondary`, `onAccent`, `onDestructive`, `onSuccess`, `onWarning`, `onInfo` | Matching role | 4.5:1 |
| `focus` | `background`, `surface` | 3:1 |
| `border` | `background`, `surface` | 3:1 where the border is the only visible boundary of a control, such as an input or checkbox |

Decorative borders are exempt under WCAG 1.4.11. Record that exemption rather than reporting it as a failure.

## Suggested structure

```text
src/
  app/                 # Routes and read-only mock handlers
  components/
    ui/                # Reusable primitives
    navigation/
    documentation/
    system/
    playground/
  data/mock/           # Registry and scenario fixtures
  lib/
    api/               # Typed adapters
    contract/          # Schemas, validation, and context serialization
    theme/             # Configuration, token resolution, ThemeScope
    accessibility/     # Local contrast calculations
  types/
  hooks/
  stores/
  styles/
```

Keep schema version, product version, and stored-settings version separate. Use stable IDs. Never export React nodes or functions as contract data.
