import { z } from 'zod';
import { registry } from './registry';
import { validateRegistry } from '@/lib/contract/validate';
import { createContext } from '@/lib/contract/context';
import { demoReports } from './fixtures';
import { DesignSystemSchema, ThemeSchema, TokenDefinitionSchema, ComponentContractSchema, RuleSchema, AIContextSchema, ValidationResultSchema, LayoutExampleSchema, FontOptionSchema } from '@/lib/contract/schema';

export const ScenarioSchema = z.enum(['normal', 'empty', 'error']);
export type Scenario = z.infer<typeof ScenarioSchema>;
export const ErrorEnvelopeSchema = z.strictObject({ error: z.strictObject({ code: z.string(), message: z.string() }) });
export const responseSchemas = {
  registry: DesignSystemSchema,
  system: DesignSystemSchema.pick({ id: true, name: true, productVersion: true, principles: true }).extend({ fonts: z.array(FontOptionSchema) }),
  theme: ThemeSchema, tokens: z.array(TokenDefinitionSchema), components: z.array(ComponentContractSchema),
  component: ComponentContractSchema, rules: z.array(RuleSchema), 'ai-context': AIContextSchema,
  validation: z.array(ValidationResultSchema), layouts: z.array(LayoutExampleSchema),
};
export type Endpoint = keyof typeof responseSchemas;
export type EndpointData<K extends Endpoint> = z.infer<(typeof responseSchemas)[K]>;
export type ApiResult<T> = { status: number; body: { data: T } | z.infer<typeof ErrorEnvelopeSchema> };
export function mockResponse<K extends Endpoint>(endpoint: K, scenario: Scenario = 'normal', componentId?: string): ApiResult<EndpointData<K>> {
  const system = validateRegistry(registry);
  const fail = (status: number, code: string, message: string) => ({ status, body: { error: { code, message } } });
  if (endpoint === 'component' && !system.components.some(c => c.id === componentId)) return fail(404, 'NOT_FOUND', `No component named ${componentId}.`);
  if (scenario === 'error') return fail(503, 'DEMO_ERROR', 'This is the deterministic error scenario. Switch to normal and retry.');
  if (scenario === 'empty') {
    if (['tokens', 'components', 'rules', 'validation', 'layouts'].includes(endpoint)) return { status: 200, body: { data: [] as EndpointData<K> } };
    return fail(404, 'MISSING_DATA', 'This demo scenario has no data for this resource.');
  }
  const data = {
    registry: system, system: { id: system.id, name: system.name, productVersion: system.productVersion, principles: system.principles, fonts: system.fonts },
    theme: system.themePresets.find(t => t.id === system.defaultThemeId), tokens: system.tokens, components: system.components,
    component: system.components.find(c => c.id === componentId), rules: system.rules,
    'ai-context': createContext(system, { mode: 'overview' }), validation: demoReports(system), layouts: system.layouts,
  }[endpoint];
  return { status: 200, body: { data: responseSchemas[endpoint].parse(data) as EndpointData<K> } };
}
