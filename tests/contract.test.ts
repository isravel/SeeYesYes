import { describe, it, expect } from 'vitest';
import { registry, defaultTheme } from '@/lib/data/registry';
import { validateRegistry, validateTheme, effectiveDefaults } from '@/lib/contract/validate';
import { ThemeSchema, LiteralTokenValueSchema, PersistenceEnvelopeSchema, type DesignSystem, type TokenDefinition } from '@/lib/contract/schema';
import { resolveTokens, formatConstant } from '@/lib/theme/resolve';
import { assignThemeIdentity, themeValues } from '@/lib/theme/identity';
import { createContext } from '@/lib/contract/context';
import { stableJson, contextMarkdown } from '@/lib/contract/serialize';
const clone = () => structuredClone(registry);
const theme = () => structuredClone(defaultTheme);
const settings = () => ({ settingsVersion: 1, theme: theme(), appearance: 'system' as const });
const mutate = (fn: (s: DesignSystem) => void) => { const s = clone(); fn(s); return s; };

describe('registry integrity', () => {
  it('validates the current component inventory and eight rules without React or a DOM', () => {
    expect(validateRegistry(registry).components.map(c => c.id)).toEqual(['button', 'spinner', 'link', 'card', 'badge', 'separator', 'avatar', 'alert', 'progress', 'skeleton', 'input', 'textarea', 'select', 'checkbox', 'radio-group', 'switch', 'label', 'form-field', 'dialog', 'dropdown-menu', 'tabs', 'tooltip']);
    expect(registry.rules).toHaveLength(8);
    expect(typeof globalThis.document).toBe('undefined');
  });
  it.each([
    ['duplicate IDs', (s: DesignSystem): void => { s.tokens.push(s.tokens[0]); }, /Duplicate tokens/],
    ['missing tokens', (s: DesignSystem): void => { s.components[0].tokenIds.push('missing.token'); }, /missing tokens reference/],
    ['missing components', (s: DesignSystem): void => { s.examples[0].componentIds.push('unknown'); }, /missing components reference/],
    ['missing rules', (s: DesignSystem): void => { s.components[0].ruleIds.push('unknown'); }, /missing rules reference/],
    ['missing examples', (s: DesignSystem): void => { s.tokens[0].exampleIds.push('unknown'); }, /missing examples reference/],
    ['invalid paths', (s: DesignSystem): void => { s.tokens[0].source = {kind: 'theme', path: 'colors.*.unknown'}; }, /Unknown theme token path/],
    ['single-mode color paths', (s: DesignSystem): void => { s.tokens[0].source = {kind: 'theme', path: 'colors.light.primary'}; }, /both modes/],
    ['missing palette paths', (s: DesignSystem): void => { s.tokens[0].source = {kind: 'theme', path: 'palette.missing'}; }, /Unknown theme token path/],
    ['bad variables', (s: DesignSystem): void => { s.tokens[0].cssVariable = '--sys-wrong'; }, /CSS variable must be/],
    ['missing review evidence', (s: DesignSystem): void => { s.components[0].accessibility.status = 'reviewed'; }, /requires evidence/],
    ['focus applicability', (s: DesignSystem): void => { s.rules.find(r => r.id === 'wcag-focus-visible')!.appliesTo = ['button']; }, /exactly to interactive/],
    ['missing keyboard guidance', (s: DesignSystem): void => { s.components[0].accessibility.keyboard = []; }, /keyboard guidance/],
    ['rule agreement', (s: DesignSystem): void => { s.components[0].ruleIds = []; }, /must list this rule/],
    ['listing system rules', (s: DesignSystem): void => { s.components[0].ruleIds.push('wcag-contrast'); }, /does not apply/],
    ['incorrect example intent', (s: DesignSystem): void => { s.rules[0].violationExampleId = 'button-save'; }, /wrong intent/],
    ['unverified example imports', (s: DesignSystem): void => { s.examples[0].code = 'import { Button } from "not-a-package";\n<Button>Save</Button>'; }, /unverified public import/],
    ['missing example imports', (s: DesignSystem): void => { s.examples[0].code = '<Button>Save</Button>'; }, /missing public import/],
    ['default allowlist', (s: DesignSystem): void => { s.components[0].themeDefaults.variant!.push('invented'); }, /must be allowed/],
    ['invalid compound values', (s: DesignSystem): void => { s.components[0].compoundVariants[0].when.size = 'huge'; }, /invalid compound/],
    ['duplicate compounds', (s: DesignSystem): void => { s.components[0].compoundVariants.push(s.components[0].compoundVariants[0]); }, /duplicate compound/],
  ] as const)('rejects %s', (_, change, error) => expect(() => validateRegistry(mutate(change))).toThrow(error));
  it('requires a short, single-line purpose', () => {
    for (const shortPurpose of ['', 'a'.repeat(61), 'first\nsecond']) {
      expect(() => validateRegistry(mutate(s => s.components[0].shortPurpose = shortPurpose))).toThrow();
    }
  });
  it('rejects resolved token snapshots in the registry', () => {
    const s = clone();
    Object.assign(s.tokens[0], { value: '#ffffff' });
    expect(() => validateRegistry(s)).toThrow();
  });
});

describe('theme validation and identity', () => {
  it.each(['radius', 'density', 'motion'] as const)('rejects invalid %s', key => expect(ThemeSchema.safeParse({ ...theme(), [key]: 'unknown' }).success).toBe(false));
  it('validates both modes and all color roles', () => {
    const t = theme();
    t.colors.dark.primary.c = 0.6;
    expect(() => validateTheme(t, registry)).toThrow();
    const incomplete = theme();
    Reflect.deleteProperty(incomplete.colors.light, 'primary');
    expect(() => validateTheme(incomplete, registry)).toThrow();
  });
  it('rejects wrong font kinds, identities, and destructive defaults', () => {
    const wrongFont = theme(); wrongFont.typography.sansFontId = 'jetbrains-mono';
    expect(() => validateTheme(wrongFont, registry)).toThrow(/Unknown sans/);
    expect(() => validateTheme({ ...theme(), id: 'unknown' }, registry)).toThrow(/identity/);
    expect(() => validateTheme({ ...theme(), id: 'custom' }, registry)).toThrow(/basedOn/);
    expect(() => validateTheme({ ...theme(), componentDefaults: { button: { variant: 'destructive' } } }, registry)).toThrow(/default/);
  });
  it('merges explicit values over allowed theme and contract defaults', () => {
    const t = theme(); t.componentDefaults.button = { variant: 'secondary', size: 'small' };
    validateTheme(t, registry);
    expect(effectiveDefaults(registry.components[0], t, { size: 'large', loading: true, variant: undefined })).toMatchObject({ variant: 'secondary', size: 'large', type: 'button', loading: true });
  });
  it('rejects disallowed combinations from contract and theme defaults', () => {
    const s = clone(); s.components[0].compoundVariants.push({ when: { variant: 'primary', size: 'medium' }, effect: 'disallowed', description: 'Test disallowed defaults.' });
    expect(() => validateRegistry(s)).toThrow(/Disallowed default combination/);
    s.components[0].compoundVariants[1].when = { variant: 'secondary', size: 'small' };
    expect(() => validateTheme({ ...theme(), componentDefaults: { button: { variant: 'secondary', size: 'small' } } }, s)).toThrow(/Disallowed/);
  });
  it('assigns custom identity and restores the preset identity when values match', () => {
    const draft = theme(); draft.density = 'compact';
    expect(assignThemeIdentity(draft, registry.themePresets)).toMatchObject({ id: 'custom', basedOn: 'default' });
    expect(assignThemeIdentity({ ...theme(), id: 'custom', basedOn: 'default' }, registry.themePresets)).toEqual(defaultTheme);
    expect(themeValues({ ...theme(), id: 'custom', basedOn: 'default' })).toEqual(themeValues(defaultTheme));
  });
  it('requires compatible persistence versions', () => {
    expect(PersistenceEnvelopeSchema.safeParse({ envelopeVersion: 2, themeRevision: 0, settings: settings() }).success).toBe(false);
    expect(PersistenceEnvelopeSchema.safeParse({ envelopeVersion: 1, themeRevision: -1, settings: settings() }).success).toBe(false);
  });
});

describe('canonical token resolution', () => {
  it('resolves theme values, palette keys, and both modes from the named theme', () => {
    const t = theme(); t.colors.light.primary = { l: 0.3, c: 0.12, h: 45, alpha: 1 };
    const resolved = resolveTokens(registry.tokens, t, registry.fonts);
    expect(resolved.find(t => t.id === 'color.primary')?.value).toEqual({ light: 'oklch(0.3 0.12 45 / 1)', dark: 'oklch(0.8 0.1 264 / 1)' });
    expect(resolved.find(t => t.id === 'palette.brand-500')?.value).toBe('oklch(0.44 0.16 264 / 1)');
  });
  it('resolves self-hosted fonts through the framework variables with canonical family names', () => {
    const token = resolveTokens(registry.tokens, theme(), registry.fonts).find(t => t.id === 'typography.sans')!;
    expect(token.value).toBe('var(--font-inter)');
    expect(token.interchange).toEqual({type: 'fontFamily', value: ['Inter', 'sans-serif']});
  });
  it('uses one constant for CSS and interchange values, including a complete mode pair', () => {
    const token: TokenDefinition = { id: 'spacing.test', cssVariable: '--sys-spacing-test', category: 'spacing', kind: 'primitive', purpose: 'Test spacing.', exampleIds: [], source: { kind: 'literal', constant: { light: { type: 'dimension', value: { value: 0.5, unit: 'rem' } }, dark: { type: 'dimension', value: { value: 8, unit: 'px' } } } } };
    const [resolved] = resolveTokens([token], theme(), registry.fonts);
    expect(resolved.value).toEqual({ light: '0.5rem', dark: '8px' });
    expect(resolved.interchange).toEqual({ light: { type: 'dimension', value: { value: 0.5, unit: 'rem' } }, dark: { type: 'dimension', value: { value: 8, unit: 'px' } } });
  });
  it.each([
    {type: 'dimension', value: {value: 2, unit: 'em'}}, {type: 'unsupported', cssValue: 'none'},
    {type: 'color', value: {l: 2, c: 0, h: 0, alpha: 1}}, {type: 'fontWeight', value: 1001},
    {type: 'duration', value: {value: -1, unit: 'ms'}}, {type: 'cubicBezier', value: [2, 0, 0, 1]},
  ])('rejects invalid constants %j', constant => expect(LiteralTokenValueSchema.safeParse(constant).success).toBe(false));
  it('rejects missing constants and incomplete pairs', () => {
    for (const source of [{kind: 'literal'}, {kind: 'literal', constant: {light: {type: 'number', value: 1}}}]) {
      const s = clone(); Object.assign(s.tokens[0], { source }); expect(() => validateRegistry(s)).toThrow();
    }
  });
  it('preserves explicit unsupported exclusions without the CSS-only field', () => expect(formatConstant({ type: 'unsupported', reason: 'CSS alias has no canonical value.', cssValue: 'var(--sys-color-primary)' })).toEqual({ value: 'var(--sys-color-primary)', interchange: { type: 'unsupported', reason: 'CSS alias has no canonical value.' } }));
  it('uses transparent zero geometry for no shadow, not the string none', () => {
    const resolved = resolveTokens(registry.tokens, {...theme(), shadows: 'none'}, registry.fonts).find(t => t.id === 'shadow.raised')!;
    expect(resolved.value).toEqual({light: '0px 0px 0px 0px oklch(0 0 0 / 0)', dark: '0px 0px 0px 0px oklch(0 0 0 / 0)'});
  });
});

describe('pure context and one-way closure', () => {
  it('is deterministic for system appearance and sorted selection', () => {
    const options = { mode: 'task' as const, settings: settings(), componentIds: ['link', 'button', 'link'] };
    const first = createContext(registry, options);
    expect(stableJson(first)).toBe(stableJson(createContext(registry, { ...options, componentIds: ['button', 'link'] })));
    expect(first.appearance).toBe('system');
    expect(JSON.parse(contextMarkdown(first).split('```json\n')[1].split('\n```')[0])).toEqual(first);
  });
  it('overview is an index; full resolves from applied settings and reports custom identity', () => {
    const s = settings(); s.theme.density = 'spacious'; s.theme = assignThemeIdentity(s.theme, registry.themePresets);
    const overview = createContext(registry, {mode: 'overview', settings: s});
    expect(overview).not.toHaveProperty('tokens');
    const full = createContext(registry, {mode: 'full', settings: s});
    expect(full).toMatchObject({ scope: 'applied-theme', themeId: 'custom', basedOnThemeId: 'default' });
    if (full.mode === 'full') expect(full.tokens.find(t => t.id === 'spacing.control-inline')?.value).toBe('1.25rem');
    expect(createContext(registry, {mode: 'full'})).toMatchObject({scope: 'default-theme', themeId: 'default'});
  });
  it('never expands a rule or example back into full component contracts', () => {
    const task = createContext(registry, {mode: 'task', componentIds: ['link']});
    if (task.mode !== 'task') throw new Error('Wrong mode');
    expect(task.selection.includedComponentIds).toEqual(['link']);
    expect(task.referencedComponents.map(c => c.id)).toContain('button');
    expect(task.components.map(c => c.id)).not.toContain('button');
    expect(task.theme).not.toHaveProperty('palette');
    expect(task.theme.colors.light).not.toHaveProperty('onPrimary');
    expect(task.rules.filter(r => r.appliesTo === 'system')).toHaveLength(5);
  });
  it('follows token-linked examples without expanding their components', () => {
    const s = clone(); s.tokens.find(t => t.id === 'color.primary')!.exampleIds.push('spinner-progress');
    const task = createContext(s, {mode: 'task', componentIds: ['link']});
    if (task.mode !== 'task') throw new Error('Wrong mode');
    expect(task.examples.map(e => e.id)).toContain('spinner-progress');
    expect(task.referencedComponents.map(c => c.id)).toContain('spinner');
    expect(task.selection.includedComponentIds).toEqual(['link']);
  });
  it('handles composition cycles and omits unrelated defaults', () => {
    const s = clone(); s.components[1].composition.allowedComponentIds.push('button');
    const applied = settings(); applied.theme.componentDefaults.link = {variant: 'subtle'};
    const task = createContext(s, {mode: 'task', componentIds: ['button'], settings: applied});
    if (task.mode !== 'task') throw new Error('Wrong mode');
    expect(task.selection.includedComponentIds).toEqual(['button', 'spinner']);
    expect(task.theme.componentDefaults).not.toHaveProperty('link');
    expect(task.components[0].effectiveDefaults).toMatchObject({variant: 'primary', size: 'medium'});
  });
  it('rejects empty selection, unknown selection, and missing references', () => {
    expect(() => createContext(registry, {mode: 'task'})).toThrow(/Select at least/);
    expect(() => createContext(registry, {mode: 'task', componentIds: ['unknown']})).toThrow(/Unknown selected/);
    expect(() => createContext(mutate(s => s.examples = s.examples.filter(e => e.id !== 'button-save')), {mode: 'task', componentIds: ['button']})).toThrow(/missing examples/);
  });
  it('keeps task context smaller than full without dropping guidance', () => {
    const task = createContext(registry, {mode: 'task', componentIds: ['link']});
    expect(Buffer.byteLength(stableJson(task))).toBeLessThan(Buffer.byteLength(stableJson(createContext(registry, {mode: 'full'}))));
    if (task.mode === 'task') expect(task.components[0].accessibility.requirements.length).toBeGreaterThan(0);
  });
});
