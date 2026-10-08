import { z } from 'zod';

const text = z.string().min(1);
const id = text.regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/);
const scalar = z.union([z.string(), z.number().finite(), z.boolean()]);
const strings = z.array(text);
export const AppearanceSchema = z.enum(['light', 'dark', 'system']);
export const ModeSchema = z.enum(['light', 'dark']);
export const OklchSchema = z.strictObject({
  l: z.number().min(0).max(1), c: z.number().min(0).max(0.4),
  h: z.number().min(0).max(360), alpha: z.number().min(0).max(1),
});
export const ColorRoleSchema = z.enum([
  'primary', 'onPrimary', 'secondary', 'onSecondary', 'accent', 'onAccent',
  'background', 'foreground', 'surface', 'muted', 'mutedForeground', 'border', 'focus',
  'destructive', 'onDestructive', 'success', 'onSuccess', 'warning', 'onWarning', 'info', 'onInfo',
]);
export const FontOptionSchema = z.strictObject({
  id, family: text, kind: z.enum(['sans', 'mono']), source: z.enum(['self-hosted', 'system']),
});
export const ComponentDefaultsSchema = z.record(id, z.strictObject({ variant: text.optional(), size: text.optional() }));
export const ThemeSchema = z.strictObject({
  id, basedOn: id.optional(), palette: z.record(id, OklchSchema),
  colors: z.record(ModeSchema, z.record(ColorRoleSchema, OklchSchema)),
  typography: z.strictObject({ sansFontId: id, monoFontId: id, scale: z.enum(['small', 'default', 'large']) }),
  radius: z.enum(['sharp', 'soft', 'curvy']), density: z.enum(['compact', 'comfortable', 'spacious']),
  shadows: z.enum(['none', 'soft', 'defined']), effects: z.strictObject({ surface: z.enum(['clean', 'subtle-depth']) }),
  motion: z.enum(['none', 'subtle']), componentDefaults: ComponentDefaultsSchema,
}).superRefine((theme, ctx) => {
  if ((theme.id === 'custom') !== Boolean(theme.basedOn))
    ctx.addIssue({ code: 'custom', message: 'Only a custom theme has a basedOn preset.', path: ['basedOn'] });
});
export const WorkspaceSettingsSchema = z.strictObject({ settingsVersion: z.literal(1), theme: ThemeSchema, appearance: AppearanceSchema });
export const PersistenceEnvelopeSchema = z.strictObject({
  envelopeVersion: z.literal(1), themeRevision: z.number().int().nonnegative(), settings: WorkspaceSettingsSchema,
  bootstrap: z.strictObject({
    cacheVersion: z.literal(1), resolverVersion: text, themeRevision: z.number().int().nonnegative(),
    modeIndependent: z.record(text, text), modes: z.record(ModeSchema, z.record(text, text)),
  }).optional(),
});
export const DimensionValueSchema = z.strictObject({ value: z.number().finite(), unit: z.enum(['px', 'rem']) });
export const ShadowValueSchema = z.strictObject({
  color: OklchSchema, offsetX: DimensionValueSchema, offsetY: DimensionValueSchema,
  blur: DimensionValueSchema.extend({ value: z.number().nonnegative() }), spread: DimensionValueSchema, inset: z.boolean().optional(),
});
const SupportedInterchangeSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('color'), value: OklchSchema }),
  z.strictObject({ type: z.literal('dimension'), value: DimensionValueSchema }),
  z.strictObject({ type: z.literal('duration'), value: z.strictObject({ value: z.number().nonnegative(), unit: z.enum(['ms', 's']) }) }),
  z.strictObject({ type: z.literal('cubicBezier'), value: z.tuple([z.number().min(0).max(1), z.number().finite(), z.number().min(0).max(1), z.number().finite()]) }),
  z.strictObject({ type: z.literal('shadow'), value: z.union([ShadowValueSchema, z.array(ShadowValueSchema).min(1)]) }),
  z.strictObject({ type: z.literal('fontFamily'), value: z.union([text, strings.min(1)]) }),
  z.strictObject({ type: z.literal('fontWeight'), value: z.number().min(1).max(1000) }),
  z.strictObject({ type: z.literal('number'), value: z.number().finite() }),
]);
export const InterchangeValueSchema = z.union([SupportedInterchangeSchema, z.strictObject({ type: z.literal('unsupported'), reason: text })]);
export const LiteralTokenValueSchema = z.union([SupportedInterchangeSchema, z.strictObject({ type: z.literal('unsupported'), reason: text, cssValue: z.union([text, z.number().finite()]) })]);
const literalPair = z.record(ModeSchema, LiteralTokenValueSchema);
export const TokenDefinitionSchema = z.strictObject({
  id, cssVariable: text.regex(/^--sys-[a-z0-9-]+$/),
  category: z.enum(['color', 'typography', 'spacing', 'radius', 'shadow', 'effect', 'motion']),
  kind: z.enum(['primitive', 'semantic']), purpose: text,
  source: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('theme'), path: text }),
    z.strictObject({ kind: z.literal('literal'), constant: z.union([LiteralTokenValueSchema, literalPair]) }),
  ]), exampleIds: strings,
});
export const ResolvedTokenSchema = TokenDefinitionSchema.extend({
  value: z.union([text, z.number().finite(), z.record(ModeSchema, z.union([text, z.number().finite()]))]),
  interchange: z.union([InterchangeValueSchema, z.record(ModeSchema, InterchangeValueSchema)]),
});
export const PropContractSchema = z.strictObject({
  name: text, type: text, required: z.boolean(), defaultValue: scalar.optional(), allowedValues: z.array(scalar).optional(), description: text,
});
export const ComponentContractSchema = z.strictObject({
  id, name: text, publicImport: z.strictObject({ module: text, exportName: text.regex(/^[A-Z][A-Za-z0-9]*$/) }),
  purpose: text, shortPurpose: text.max(60).regex(/^[^\r\n]+$/),
  category: z.enum(['action', 'form', 'feedback', 'layout', 'navigation', 'data']), maturity: z.enum(['experimental', 'stable']),
  interactive: z.boolean(), semantics: z.strictObject({ element: text, meaning: text }),
  anatomy: z.array(z.strictObject({ part: text, description: text })).min(1), props: z.array(PropContractSchema).min(1),
  variants: z.record(text, strings), compoundVariants: z.array(z.strictObject({ when: z.record(text, text), effect: z.enum(['styled', 'disallowed']), description: text })),
  themeDefaults: z.strictObject({ variant: strings.optional(), size: strings.optional() }), states: strings.min(1), tokenIds: strings.min(1),
  accessibility: z.strictObject({
    status: z.enum(['not-reviewed', 'reviewed']), evidence: z.strictObject({ reviewedOn: text, path: text }).optional(),
    requirements: strings.min(1), keyboard: z.array(z.strictObject({ key: text, behavior: text })), ruleIds: strings,
  }), composition: z.strictObject({ allowedComponentIds: strings, constraints: strings }),
  prohibitedUsage: strings.min(1), exampleIds: strings.min(1), ruleIds: strings,
  aiGuidance: z.strictObject({ prefer: strings.min(1), avoid: strings.min(1) }),
});
const ExampleBaseSchema = z.strictObject({ id, title: text, componentIds: strings, code: text });
export const ExampleSchema = z.discriminatedUnion('intent', [
  ExampleBaseSchema.extend({ intent: z.literal('recommended'), previewKey: text }),
  ExampleBaseSchema.extend({ intent: z.literal('violation'), explanation: text }),
]);
export const SeveritySchema = z.enum(['info', 'warning', 'error']);
export const RuleSchema = z.strictObject({
  id, description: text, category: z.enum(['component', 'token', 'accessibility', 'composition', 'styling', 'performance']),
  severity: SeveritySchema, appliesTo: z.union([z.literal('system'), strings.min(1)]),
  violationExampleId: id, correctExampleId: id, suggestedFix: text,
  autoFix: z.strictObject({ available: z.literal(false), reason: text }),
});
export const LayoutExampleSchema = z.strictObject({ id, title: text, purpose: text, componentIds: strings.min(1), previewKey: text });
export const ValidationResultSchema = z.strictObject({
  id, source: z.literal('demo-fixture'), scenarioId: z.enum(['clean', 'mixed', 'failing']),
  items: z.array(z.strictObject({ id, ruleId: id, status: z.union([z.literal('passed'), SeveritySchema]), componentId: id.optional(), message: text, exampleId: id })),
});
export const ProjectSchema = z.strictObject({ framework: z.literal('react'), styling: z.literal('css-variables'), guidance: strings.min(1) });
export const DesignSystemSchema = z.strictObject({
  schemaVersion: z.literal('1.0'), id, name: text, productVersion: text, principles: strings.min(1),
  fonts: z.array(FontOptionSchema).min(1), defaultThemeId: id, themePresets: z.array(ThemeSchema).length(1),
  tokens: z.array(TokenDefinitionSchema), components: z.array(ComponentContractSchema), rules: z.array(RuleSchema),
  examples: z.array(ExampleSchema), layouts: z.array(LayoutExampleSchema), project: ProjectSchema,
});
export const CatalogEntrySchema = ComponentContractSchema.pick({ id: true, name: true, shortPurpose: true, category: true, publicImport: true });
export const ContextComponentSchema = ComponentContractSchema.extend({ effectiveDefaults: z.record(text, scalar) });
const ContextBaseSchema = z.strictObject({
  schemaVersion: z.literal('1.0'), scope: z.enum(['applied-theme', 'default-theme']),
  identity: z.strictObject({ id, name: text, productVersion: text }), principles: strings, project: ProjectSchema,
  themeId: id, basedOnThemeId: id.optional(), appearance: AppearanceSchema,
});
const ContextThemeSchema = z.strictObject({
  id, basedOn: id.optional(), typography: ThemeSchema.shape.typography,
  radius: ThemeSchema.shape.radius, density: ThemeSchema.shape.density, shadows: ThemeSchema.shape.shadows,
  effects: ThemeSchema.shape.effects, motion: ThemeSchema.shape.motion,
  colors: z.record(ModeSchema, z.partialRecord(ColorRoleSchema, OklchSchema)), componentDefaults: ComponentDefaultsSchema,
});
export const AIContextSchema = z.discriminatedUnion('mode', [
  ContextBaseSchema.extend({ mode: z.literal('overview'), catalog: z.array(CatalogEntrySchema) }),
  ContextBaseSchema.extend({ mode: z.literal('task'),
    selection: z.strictObject({ requestedComponentIds: strings, includedComponentIds: strings }),
    theme: ContextThemeSchema, tokens: z.array(ResolvedTokenSchema), components: z.array(ContextComponentSchema),
    referencedComponents: z.array(CatalogEntrySchema), rules: z.array(RuleSchema), examples: z.array(ExampleSchema),
  }),
  ContextBaseSchema.extend({ mode: z.literal('full'), theme: ThemeSchema, tokens: z.array(ResolvedTokenSchema), components: z.array(ContextComponentSchema),
    system: DesignSystemSchema.omit({ components: true, tokens: true }),
  }),
]);
export type Theme = z.infer<typeof ThemeSchema>;
export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;
export type PersistenceEnvelope = z.infer<typeof PersistenceEnvelopeSchema>;
export type Oklch = z.infer<typeof OklchSchema>;
export type ColorRole = z.infer<typeof ColorRoleSchema>;
export type Appearance = z.infer<typeof AppearanceSchema>;
export type Mode = z.infer<typeof ModeSchema>;
export type FontOption = z.infer<typeof FontOptionSchema>;
export type TokenDefinition = z.infer<typeof TokenDefinitionSchema>;
export type ResolvedToken = z.infer<typeof ResolvedTokenSchema>;
export type InterchangeValue = z.infer<typeof InterchangeValueSchema>;
export type LiteralTokenValue = z.infer<typeof LiteralTokenValueSchema>;
export type ComponentContract = z.infer<typeof ComponentContractSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type Example = z.infer<typeof ExampleSchema>;
export type LayoutExample = z.infer<typeof LayoutExampleSchema>;
export type DesignSystem = z.infer<typeof DesignSystemSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type AIContext = z.infer<typeof AIContextSchema>;
export type CatalogEntry = z.infer<typeof CatalogEntrySchema>;
