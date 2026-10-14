import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DesignSystem } from '../../lib/contract/schema';
import { buildAgentsSnippet } from '../../lib/contract/agent-files';
import { createContext } from '../../lib/contract/context';
import { byteLength } from '../../lib/contract/export-files';
import { contextMarkdown } from '../../lib/contract/serialize';

export type Condition = 'C0' | 'C1' | 'C2' | 'C3';
export const conditions: Condition[] = ['C0', 'C1', 'C2', 'C3'];
export type TaskFile = { id: string; title: string; expectedComponentIds: string[]; probedRuleIds: string[]; prompt: string };

const tasksDir = join(process.cwd(), 'evaluation', 'tasks');

export function readTask(id: string, dir = tasksDir): TaskFile {
  const source = readFileSync(join(dir, `${id}.md`), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Task ${id} has no front matter.`);
  const meta = Object.fromEntries(match[1].split('\n').map(line => { const i = line.indexOf(':'); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; }));
  const prompt = match[2].split(/^## Prompt\n/m)[1]?.split(/^## /m)[0].trim();
  if (!prompt) throw new Error(`Task ${id} has no prompt.`);
  return { id: meta.id, title: meta.title, expectedComponentIds: meta.expectedComponentIds.split(',').map(s => s.trim()), probedRuleIds: meta.probedRuleIds.split(',').map(s => s.trim()), prompt };
}

export type ConditionOutput = { condition: Condition; taskId: string; agentsMd: string | null; preamble: string; prompt: string; contextBytes: number };

/**
 * What a run receives under a condition, from the shipped exports under the default preset. Never hand-edited.
 * C0 nothing; C1 the AGENTS.md snippet; C2 C1 plus the task export for the task's components; C3 C1 plus the full export.
 */
export function buildCondition(condition: Condition, task: TaskFile, system: DesignSystem): ConditionOutput {
  const defaultSettings = { settingsVersion: 1 as const, theme: system.themePresets.find(theme => theme.id === system.defaultThemeId)!, appearance: 'system' as const };
  const agentsMd = condition === 'C0' ? null : buildAgentsSnippet(system, defaultSettings);
  const preamble = condition === 'C2' ? contextMarkdown(createContext(system, { mode: 'task', componentIds: task.expectedComponentIds }))
    : condition === 'C3' ? contextMarkdown(createContext(system, { mode: 'full' })) : '';
  return { condition, taskId: task.id, agentsMd, preamble, prompt: task.prompt, contextBytes: byteLength(agentsMd ?? '') + byteLength(preamble) };
}
