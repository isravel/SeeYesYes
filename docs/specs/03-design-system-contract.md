# Design-system contract

## Boundary

The contract explains the system. React components implement it. Component pages and AI exports read the same contract rather than maintain separate descriptions.

Validate references at build time. Every token ID, component ID, rule ID, example ID, layout ID, and font ID must resolve. Every catalog component needs an implementation and a working example.

## Minimum typed model

Define these as runtime schemas and derive the TypeScript types from them, so types and validation cannot drift.

```ts
type Severity = "info" | "warning" | "error";
type Appearance = "light" | "dark" | "system";
type Mode = "light" | "dark";
type Oklch = { l: number; c: number; h: number; alpha: number };
type ColorRole =
  | "primary" | "onPrimary" | "secondary" | "onSecondary"
  | "accent" | "onAccent" | "background" | "foreground"
  | "surface" | "muted" | "mutedForeground" | "border" | "focus"
  | "destructive" | "onDestructive" | "success" | "onSuccess"
  | "warning" | "onWarning" | "info" | "onInfo";

interface FontOption {
  id: string;
  family: string;
  kind: "sans" | "mono";
  source: "self-hosted" | "system";
}

interface Theme {
  // Preset ID, or "custom" for an applied theme that differs from its preset.
  id: string;
  // Set only when id is "custom": the preset this theme started from.
  basedOn?: string;
  // Primitive palette, mode-independent, keyed by ID such as "brand-500" or "neutral-100".
  palette: Record<string, Oklch>;
  // Semantic roles store literal values. Palette suggestions copy palette values into roles
  // through an explicit action; roles do not alias palette entries in Phase 1.
  colors: Record<Mode, Record<ColorRole, Oklch>>;
  typography: { sansFontId: string; monoFontId: string; scale: "small" | "default" | "large" };
  radius: "sharp" | "soft" | "curvy";
  density: "compact" | "comfortable" | "spacious";
  shadows: "none" | "soft" | "defined";
  effects: { surface: "clean" | "subtle-depth" };
  motion: "none" | "subtle";
  componentDefaults: Record<string, { variant?: string; size?: string }>;
}

// Appearance is a workspace preference, not part of a theme draft.
interface WorkspaceSettings {
  settingsVersion: number;
  theme: Theme;
  appearance: Appearance;
}

// What localStorage holds. The downloadable settings file is plain WorkspaceSettings.
interface PersistenceEnvelope {
  envelopeVersion: number;
  // Incremented by the settings writer whenever the applied theme changes.
  themeRevision: number;
  settings: WorkspaceSettings;
  // Derived and disposable. Valid only when its themeRevision matches the envelope's.
  bootstrap?: {
    cacheVersion: number;
    resolverVersion: string;
    themeRevision: number;
    modeIndependent: Record<string, string>;
    modes: Record<Mode, Record<string, string>>;
  };
}

type TokenValue = string | number;
type DimensionValue = { value: number; unit: "px" | "rem" };
type ShadowValue = {
  color: Oklch;
  offsetX: DimensionValue;
  offsetY: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
  inset?: boolean;
};

// Canonical interchange values accompany CSS-facing values. Never infer a type from CSS text.
type InterchangeValue =
  | { type: "color"; value: Oklch }
  | { type: "dimension"; value: DimensionValue }
  | { type: "duration"; value: { value: number; unit: "ms" | "s" } }
  | { type: "cubicBezier"; value: [number, number, number, number] }
  | { type: "shadow"; value: ShadowValue | ShadowValue[] }
  | { type: "fontFamily"; value: string | string[] }
  | { type: "fontWeight"; value: number }
  | { type: "number"; value: number }
  | { type: "unsupported"; reason: string };

// Literal sources keep their authored canonical value; theme sources keep a path.
// Both become CSS-facing values and interchange values through the same resolver.
type LiteralTokenValue =
  | Exclude<InterchangeValue, { type: "unsupported" }>
  | { type: "unsupported"; reason: string; cssValue: TokenValue };

// The registry stores definitions, never a theme-resolved ResolvedToken snapshot.
interface TokenDefinition {
  id: string;
  cssVariable: `--sys-${string}`;
  category: "color" | "typography" | "spacing" | "radius" | "shadow" | "effect" | "motion";
  kind: "primitive" | "semantic";
  purpose: string;
  source:
    | { kind: "theme"; path: string }
    | { kind: "literal"; constant: LiteralTokenValue | Record<Mode, LiteralTokenValue> };
  exampleIds: string[];
}

// Produced only by resolveTokens(theme). Never stored in the registry.
interface ResolvedToken extends TokenDefinition {
  // Mode-dependent tokens carry both modes. Mode-independent tokens carry one value.
  value: TokenValue | Record<Mode, TokenValue>;
  interchange: InterchangeValue | Record<Mode, InterchangeValue>;
}

interface PropContract {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string | number | boolean;
  allowedValues?: (string | number | boolean)[];
  description: string;
}

interface ComponentContract {
  id: string;
  name: string;
  publicImport: { module: string; exportName: string };
  purpose: string;
  // One-line summary, at most 60 characters, for compact catalogs and the AGENTS.md snippet.
  shortPurpose: string;
  category: "action" | "form" | "feedback" | "layout" | "navigation" | "data";
  maturity: "experimental" | "stable";
  // True when users can focus or operate the component. Drives keyboard and focus requirements.
  interactive: boolean;
  semantics: { element: string; meaning: string };
  anatomy: { part: string; description: string }[];
  props: PropContract[];
  variants: Record<string, string[]>;
  // Variant combinations with their own styling or meaning, and combinations that are not allowed.
  // Any combination not listed here is allowed and uses the base variant styles.
  compoundVariants: {
    when: Record<string, string>;
    effect: "styled" | "disallowed";
    description: string;
  }[];
  // Values a theme may set as defaults. Must be a subset of the matching prop's allowedValues.
  themeDefaults: { variant?: string[]; size?: string[] };
  states: string[];
  tokenIds: string[];
  accessibility: {
    status: "not-reviewed" | "reviewed";
    // Required when status is "reviewed". Points to the evidence folder entry.
    evidence?: { reviewedOn: string; path: string };
    requirements: string[];
    keyboard: { key: string; behavior: string }[];
    ruleIds: string[];
  };
  composition: { allowedComponentIds: string[]; constraints: string[] };
  prohibitedUsage: string[];
  exampleIds: string[];
  ruleIds: string[];
  aiGuidance: { prefer: string[]; avoid: string[] };
}

interface ExampleBase { id: string; title: string; componentIds: string[]; code: string }
type Example =
  | (ExampleBase & { intent: "recommended"; previewKey: string })
  // Violations are explanatory code only. They have no live preview.
  | (ExampleBase & { intent: "violation"; explanation: string });

interface Rule {
  id: string;
  description: string;
  category: "component" | "token" | "accessibility" | "composition" | "styling" | "performance";
  severity: Severity;
  appliesTo: string[] | "system";
  violationExampleId: string;
  correctExampleId: string;
  suggestedFix: string;
  autoFix: { available: false; reason: string };
}

interface LayoutExample {
  id: string;
  title: string;
  purpose: string;
  componentIds: string[];
  previewKey: string;
}

// Demo fixtures live outside DesignSystem and are never exported as contract data.
interface ValidationResult {
  id: string;
  source: "demo-fixture";
  scenarioId: "clean" | "mixed" | "failing";
  items: {
    id: string;
    ruleId: string;
    // A failing finding takes its rule's severity. Category comes from the rule.
    status: "passed" | Severity;
    componentId?: string;
    message: string;
    exampleId: string;
  }[];
}

interface DesignSystem {
  schemaVersion: "1.0";
  id: string;
  name: string;
  productVersion: string;
  principles: string[];
  fonts: FontOption[];
  defaultThemeId: string;
  themePresets: Theme[];
  tokens: TokenDefinition[];
  components: ComponentContract[];
  rules: Rule[];
  examples: Example[];
  layouts: LayoutExample[];
  project: { framework: "react"; styling: "css-variables"; guidance: string[] };
}

interface ContextBase {
  schemaVersion: "1.0";
  // "default-theme" for build-time files, the mock endpoint, and the MCP server without a settings file.
  scope: "applied-theme" | "default-theme";
  identity: { id: string; name: string; productVersion: string };
  principles: string[];
  project: DesignSystem["project"];
  themeId: string;
  basedOnThemeId?: string;
  appearance: Appearance;
}

type CatalogEntry = Pick<ComponentContract, "id" | "name" | "shortPurpose" | "category" | "publicImport">;

// A task includes only referenced color roles and included component defaults.
type ContextTheme = Omit<Theme, "palette" | "colors" | "componentDefaults"> & {
  colors: Record<Mode, Partial<Record<ColorRole, Oklch>>>;
  componentDefaults: Theme["componentDefaults"];
};

// Contract defaults merged with applied theme defaults. Explicit props still win.
type ContextComponent = ComponentContract & {
  effectiveDefaults: Record<string, string | number | boolean>;
};

type AIContext =
  | (ContextBase & { mode: "overview"; catalog: CatalogEntry[] })
  | (ContextBase & {
      mode: "task";
      selection: { requestedComponentIds: string[]; includedComponentIds: string[] };
      theme: ContextTheme;
      tokens: ResolvedToken[];
      components: ContextComponent[];
      // Components named by included examples or rules but not included in full.
      referencedComponents: CatalogEntry[];
      rules: Rule[];
      examples: Example[];
    })
  | (ContextBase & {
      mode: "full";
      // The theme named by scope: applied settings, or the default preset.
      theme: Theme;
      tokens: ResolvedToken[];
      components: ContextComponent[];
      system: Omit<DesignSystem, "components" | "tokens">;
    });
```

Extend these types when actual components need more detail.

### Validation rules

- Every component has `publicImport.module` and `publicImport.exportName`. Phase 1 modules are real repository aliases, such as `@/components/ui/button`; export names identify the shipped public symbol. Verify them during the build by generating a file with one `import { ExportName } from "module"` per contract and type-checking it, so registry validation itself stays free of React. Generated CSS classes and private file paths never serve as imports.
- Imports in example `code` use only contract `publicImport` modules and export names.
- `shortPurpose` is non-empty, at most 60 characters, and a single line.
- A working preview means the example's `previewKey` exists in the preview map. Verify keys in the same generated type-checked file used for public imports, so registry validation stays free of React. The same applies to layout `previewKey` values.
- Every literal source includes `constant`: a typed canonical value, or a complete light/dark pair of typed values. The resolver formats its CSS value and interchange value from that constant without a second lookup or CSS parser. An unsupported literal must include `cssValue` and a reason; it renders locally but is excluded from interoperable token downloads. The resolver removes the CSS-only field from the interchange exclusion record. Missing constants, incomplete mode pairs, invalid types/units, and missing exclusion reasons fail registry validation.
- The registry stores `TokenDefinition` records only. `resolveTokens(theme)` produces `ResolvedToken` values and interchange values in one pass from the same theme. Validate the declared interchange type and both modes, reject invalid shapes or units, and require a reason for explicitly unsupported values. Every export, screen, and file that shows token values uses tokens resolved from the theme named by its scope.
- `wcag-focus-visible.appliesTo` equals exactly the IDs of components with `interactive: true`. Interactive components have a non-empty `accessibility.keyboard`.
- Presets have no `basedOn`. A theme with `id: "custom"` has a `basedOn` that names a preset; any other ID names a preset.
- Phase 1 ships exactly one preset, and `defaultThemeId` names it. `themePresets` stays a list so more presets and a preset picker can follow without a schema change.
- Component defaults name a known component, and each value appears in that contract's `themeDefaults`. `themeDefaults` values must be a subset of the matching prop's `allowedValues`.
- Each `compoundVariants` entry names at least two variant keys from `variants`, uses only listed values, and does not repeat another entry's `when`.
- Effective defaults never form a `disallowed` combination, whether alone or with theme defaults. Reject the theme if they do.
- Token theme paths resolve against `Theme`. Use `*` for the mode segment of color paths, for example `colors.*.primary`. Palette paths use the palette key, for example `palette.brand-500`. Reject unknown paths.
- Each theme's font IDs resolve to a `FontOption` of the right kind.
- `accessibility.status: "reviewed"` requires `evidence`.
- Rules and components agree. If a rule's `appliesTo` lists a component, that component lists the rule in `ruleIds` or `accessibility.ruleIds`, and the reverse. Components do not list `"system"` rules.
- Example `componentIds`, layout `componentIds`, and `composition.allowedComponentIds` resolve.
- Each rule's violation example has `intent: "violation"`. Each correct example has `intent: "recommended"`.

### Literal token example

```ts
const inlineSpacing = {
  id: "spacing.inline",
  cssVariable: "--sys-spacing-inline",
  category: "spacing",
  kind: "primitive",
  purpose: "Space between adjacent inline items.",
  source: {
    kind: "literal",
    constant: { type: "dimension", value: { value: 0.5, unit: "rem" } },
  },
  exampleIds: ["button-save"],
} satisfies TokenDefinition;
```

Resolution produces CSS `0.5rem` and interchange type `dimension` with value `{ value: 0.5, unit: "rem" }` from that single authored constant. Theme-derived definitions still resolve from their declared theme paths.

### Naming rules

A token's CSS variable is derived from its ID: prefix `--sys-`, replace dots with hyphens, and convert camelCase to kebab-case. Color role `onPrimary` has token ID `color.on-primary` and variable `--sys-color-on-primary`. Generate the mapping in one function; do not hand-write it per token.

### Theme identity

Apply compares the draft with the preset it came from. If they differ, the applied theme gets `id: "custom"` and `basedOn` set to that preset's ID. If they match, it keeps the preset ID with no `basedOn`. Reset draft loads the preset as-is. The unsaved indicator ignores `id` and `basedOn` and compares settings only. Exports copy `basedOn` into `basedOnThemeId` so readers can tell an edited theme from a stock preset.

### Theme semantics

- `scope` says which theme an export uses. Browser exports use `"applied-theme"`. `/llms.txt`, `/llms-full.txt`, `/api/ai-context`, and the Phase 2 MCP server without a settings file use `"default-theme"`.
- Full context keeps the complete theme for its scope, including both light/dark maps and the palette, plus tokens resolved from that theme.
- Task context keeps both modes for referenced color roles only. It never includes the palette; referenced palette tokens carry their own values.
- Overview includes theme ID and appearance preference without token values.
- Exports never resolve `system` appearance into one mode. Mode-dependent values always carry both modes, so the same settings produce the same export on any machine.

## Worked Button contract

```ts
const buttonContract = {
  id: "button",
  name: "Button",
  publicImport: { module: "@/components/ui/button", exportName: "Button" },
  purpose: "Run an action, such as saving settings or opening a dialog.",
  shortPurpose: "Run an action on the current page.",
  category: "action",
  maturity: "stable",
  interactive: true,
  semantics: { element: "button", meaning: "An explicit user action." },
  anatomy: [
    { part: "root", description: "Native button with focus and disabled behavior." },
    { part: "label", description: "Visible action text or an accessible icon label." },
    { part: "indicator", description: "Optional loading indicator." },
  ],
  props: [
    { name: "variant", type: "ButtonVariant", required: false, defaultValue: "primary", allowedValues: ["primary", "secondary", "ghost", "destructive"], description: "Action emphasis." },
    { name: "size", type: "ButtonSize", required: false, defaultValue: "medium", allowedValues: ["small", "medium", "large"], description: "Size within the density scale." },
    { name: "type", type: "button | submit | reset", required: false, defaultValue: "button", allowedValues: ["button", "submit", "reset"], description: "Native form behavior." },
    { name: "disabled", type: "boolean", required: false, defaultValue: false, description: "Prevent activation." },
    { name: "loading", type: "boolean", required: false, defaultValue: false, description: "Show progress and prevent repeat activation." },
    { name: "children", type: "ReactNode", required: true, description: "Action text or a labeled icon." },
    { name: "aria-label", type: "string", required: false, description: "Required when visible content has no action text." },
    { name: "onClick", type: "MouseEventHandler<HTMLButtonElement>", required: false, description: "Run the action on native activation." },
  ],
  variants: { variant: ["primary", "secondary", "ghost", "destructive"], size: ["small", "medium", "large"] },
  compoundVariants: [
    {
      when: { variant: "ghost", size: "small" },
      effect: "styled",
      description: "Uses tighter inline padding so compact toolbar actions align with adjacent controls.",
    },
  ],
  // Destructive is never a theme default: it changes the meaning of every unmarked action.
  themeDefaults: { variant: ["primary", "secondary", "ghost"], size: ["small", "medium", "large"] },
  states: ["default", "hover", "focus-visible", "pressed", "disabled", "loading"],
  tokenIds: [
    "color.primary", "color.on-primary",
    "color.secondary", "color.on-secondary",
    "color.destructive", "color.on-destructive",
    "color.foreground", "color.muted", "color.focus",
    "radius.control",
    "spacing.inline", "spacing.control-block", "spacing.control-inline",
  ],
  accessibility: {
    status: "not-reviewed",
    requirements: ["Use a native button.", "Provide an accessible action name.", "Expose loading with aria-busy and preserve the label."],
    keyboard: [
      { key: "Enter", behavior: "Activate when focused and enabled." },
      { key: "Space", behavior: "Activate using native behavior." },
    ],
    ruleIds: ["wcag-focus-visible"],
  },
  composition: {
    allowedComponentIds: ["spinner"],
    constraints: ["Icons are decorative when text supplies the name.", "Do not nest interactive elements."],
  },
  prohibitedUsage: ["Navigation to another URL; use Link.", "Clickable divs styled as buttons."],
  exampleIds: ["button-save"],
  ruleIds: ["avoid-custom-button", "prefer-semantic-link"],
  aiGuidance: {
    prefer: ["Import Button for actions.", "Use existing variants and semantic tokens."],
    avoid: ["Recreating Button with a div.", "Adding raw colors for an existing variant."],
  },
} satisfies ComponentContract;
```

Ship all referenced tokens, rules, components, and examples alongside this contract. The example alone is not a complete registry. Review status remains `not-reviewed` until implementation checks pass and evidence is recorded. Shared native props may be documented by reference, but component-specific props must be explicit.

## Consumers

| Consumer | Shared input | Output |
| --- | --- | --- |
| Theme preview | Draft theme and token resolver | Preview-scoped CSS variables and defaults |
| Workspace | Applied settings and resolver | Workspace CSS variables and defaults |
| Tokens | Token definitions resolved against the applied theme | Values, purposes, examples |
| Component detail | Contract, examples, component map | Docs and live previews |
| Documentation | Principles, contracts, rules, examples | Articles and search index |
| AI Context | Registry plus applied settings | Human view, JSON, Markdown |
| Validation | Rules and fixture references | Findings and suggested fixes |
| Accessibility | Requirements, review evidence, demo checks, local contrast | Clearly labeled reports |

## Context loading and export modes

- **Overview:** small shared baseline with identity, principles, project guidance, appearance, and a compact catalog for discovery. It is an index, not enough guidance to implement a component alone.
- **Task:** selected component contracts with effective defaults, relevant theme settings, referenced tokens, applicable rules, and linked examples. Include full accessibility and prohibited-use guidance for those components.
- **Full:** the complete system for audits and integrations. Keep it available as an explicit export.

Default to Overview. Task export requires at least one selected component; reject unknown IDs. Component selection is explicit in Phase 1, with local catalog search. Do not add semantic search, embeddings, an MCP server, or AI-driven selection. The MCP server is planned for Phase 2; see [Planned for Phase 2](01-product-and-scope.md#planned-for-phase-2-mcp-server).

### Agent-readable files and Copy for LLM

These reuse the context functions and Markdown serializer. They add no separate content source.

- **`/llms.txt`** follows the [llms.txt format](https://llmstxt.org/): the system name as a heading, a one-line summary, the principles, then link sections for Getting Started, each Documentation article, each Component Detail page, and AI Context.
- **`/llms-full.txt`** contains the full-mode Markdown export followed by the hand-written Documentation articles.
- Both files are generated at build time from the registry and the **default preset**, because the server cannot see a browser's applied settings. Their context uses `scope: "default-theme"`. Each starts with a note saying so and pointing to AI Context for applied-theme exports. Output is deterministic and sorted by ID.
- **`AGENTS.md` snippet** is a short Markdown block a developer pastes into their project's `AGENTS.md`, `CLAUDE.md`, or similar agent instructions file. It is generated from the registry and applied settings and contains: system name and one-line purpose, principles, project guidance, the theme ID (and `basedOn` preset when custom), the component catalog as one line per component (name, public import module and export name, `shortPurpose`, and any effective default that differs from the contract default), every `"system"` rule as one line (ID, severity, description), and where to get more: the AI Context task export for detailed work and `/llms.txt`. It is an index like Overview mode, not implementation guidance. Target about 4 KB and show its size in bytes. Every line comes from contract fields; never hand-edit the output or drop a system rule or a component to meet the target. If it runs over, tighten `shortPurpose` or rule descriptions in the registry.
- **Copy for LLM** on Component Detail copies the task-mode Markdown export for that component under the applied theme. On a Documentation article, it copies the article's Markdown with links rewritten as site-root paths. It reports success or failure like other copy actions.

### Task dependency closure

References are followed in one direction only, from components outward. Compute the closure to a fixed point:

1. Start with the requested component IDs.
2. For each included component, add its `tokenIds`, `ruleIds`, `accessibility.ruleIds`, and `exampleIds`. Add its `composition.allowedComponentIds` as included components and repeat.
3. For each included token, add all its `exampleIds`.
4. Add every rule whose `appliesTo` is `"system"`. For every included rule, add its violation and correct example IDs.
5. Follow token aliases if the schema adds them later, including those tokens' example references.

Do not follow a rule's `appliesTo` list back to components, and do not treat example `componentIds` as new roots. Following those would pull most of the catalog into every task. Components named by included examples or rules, but not included, go into `referencedComponents` as catalog entries so nothing dangles.

Track visited IDs to handle cycles. Deduplicate and sort every list by ID. After collecting component, token, and rule examples, add catalog entries for any example component not already included in full. These referenced-only entries do not pull in their tokens, rules, composition, or other examples.

Before serializing, assert that every included component/token `exampleIds` entry and rule violation/correct example ID exists in the exported `examples`, and that example component IDs resolve in `components` or `referencedComponents`. Report missing references as an export error rather than silently dropping them. Test a shared token whose example uses a component outside the requested component closure; include that example and its catalog reference without exporting the unrelated full contract.

Keep only included component defaults and referenced color roles in task themes. Include both color modes for those roles. If the closure still needs most of the registry, show the counts honestly; do not truncate required rules or accessibility guidance to meet a size target. Full exports retain all registry records.

### Token export (Design Tokens format)

Export resolved tokens for the applied theme in the [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/). Confirm the current stable version at M1.1 and record it.

- Produce one file per mode: `seeyesyes.light.tokens.json` and `seeyesyes.dark.tokens.json`. Each file contains all supported tokens for that mode; mode-independent tokens appear in both. Show any unsupported-token exclusions in the UI and offer matching export-notes JSON alongside the files. Never describe the files as containing every registry token when exclusions exist. A single file using the specification's resolver module for modes can replace this later if target tools support it.
- Nest groups from the token ID: `color.on-primary` becomes `{ "color": { "on-primary": { … } } }`.
- Each exported token has a valid `$type`, `$value`, and `$description` (its purpose). Read the explicit `interchange` type and value of the token resolved from the applied theme; a category such as typography or motion is not enough to determine the type. Resolve the selected mode before serialization.
- Color becomes `{ "colorSpace": "oklch", "components": [l, c, h], "alpha": alpha }`. Dimensions use `{ "value": number, "unit": "px" | "rem" }`. Durations use `{ "value": number, "unit": "ms" | "s" }`. Cubic Bézier easing uses four numbers with the first and third in 0–1.
- Shadows use structured color, offset, blur, and spread values (and inset when applicable), serialized to the format's shadow object or array. A no-shadow scale resolves to a transparent zero-offset/zero-blur shadow; do not export the CSS string `none` as a shadow value.
- Font families use a family name or ordered array of family names. Font weights use validated numbers from 1–1000. Unitless line height, opacity, and similar scalar tokens use `number`. Typography size uses `dimension`; a full typography shorthand is not exported as a string.
- Theme resolution supplies canonical interchange values from named scales and color maps. Do not parse arbitrary CSS expressions, shorthand, `var()` references, or raw effect labels into guessed types. A value explicitly marked `unsupported` stays out of the token file and appears in export notes with its ID and reason. Invalid values for a supported type fail the entire export with a useful error; they are never silently omitted or downgraded to strings.
- Put SeeYesYes-only data under `$extensions["com.seeyesyes"]`: token `id`, `cssVariable`, `kind`, and `exampleIds`. Change the vendor key if the project adopts a different domain.
- Output is deterministic and sorted by ID. It is generated by a pure function in `lib/contract` so the Phase 2 MCP server can reuse it.
- Validate each file's token types and value shapes against the pinned format version, then parse both with a pinned compatible Style Dictionary version as a development-only dependency. Both checks are required. Include representative color, dimension, duration, easing, shadow, font-family, font-weight, and number fixtures, plus tests for unsupported exclusions and invalid supported values. A blocked or skipped check leaves M4.8 and A09 open; recording the reason is not a pass.

Human, JSON, and Markdown views must represent the same selected mode and data. Treat Markdown as the readable default; keep JSON for structured consumers. Do not abbreviate keys into opaque codes or remove meaning just to shorten the payload.

Optimize total tokens per successful task. A smaller export that increases failures is not an improvement. The product does not run agents or call a tokenizer API; inside Phase 1, record a local byte/character comparison and dependency tests. Do not label character counts as exact token counts. Measured comparisons of no context, the `AGENTS.md` snippet, task context, and full context follow the [agent evaluation plan](07-agent-evaluation.md).

## Context and rules

Compose context with a pure function. Sort records by stable ID. Exclude volatile timestamps from the payload. JSON and Markdown serialize the same data; the human view reads it too. Applied settings changes must reach exports without editing another fixture.

### Metadata readiness

AI readiness means metadata and references are complete. It does not mean an agent has been tested or certified.

A component is metadata-complete when all of these hold:

- `purpose`, `shortPurpose`, `semantics`, `anatomy`, `props`, `states`, `tokenIds`, `exampleIds`, `prohibitedUsage`, `aiGuidance.prefer`, and `aiGuidance.avoid` are non-empty. `compoundVariants` may be empty.
- `accessibility.requirements` is non-empty. `accessibility.keyboard` is non-empty when `interactive` is true.
- At least one example has `intent: "recommended"` and a working preview.
- Every reference resolves.

Show the checklist per component rather than a single opaque percentage. The Overview may summarize "N of M components metadata-complete".

### Required rules

| ID | Category | Severity | Applies to |
| --- | --- | --- | --- |
| `component-prefer-existing` | component | warning | system |
| `token-no-raw-color` | token | warning | system |
| `wcag-focus-visible` | accessibility | error | Every component with `interactive: true` |
| `wcag-contrast` | accessibility | error | system |
| `avoid-unnecessary-wrapper` | performance | info | system |
| `avoid-custom-button` | component | error | `button` |
| `prefer-semantic-link` | composition | warning | `button`, `link` |
| `minimize-custom-css` | styling | warning | system |

Each rule needs one violation example, one corrected example, and a useful fix. Auto-fix is unavailable in Phase 1. Suggested code is copyable and never edits a project.
