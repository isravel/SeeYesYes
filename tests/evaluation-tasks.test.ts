import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';

const dir = 'evaluation/tasks';
const parse = (file: string) => {
  const source = readFileSync(`${dir}/${file}`, 'utf8');
  const [, front, body] = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
  const meta = Object.fromEntries(front.split('\n').map(line => { const i = line.indexOf(':'); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; }));
  const section = (name: string) => body.split(new RegExp(`^## ${name}\\n`, 'm'))[1]?.split(/^## /m)[0].trim() ?? '';
  return { id: meta.id, title: meta.title, components: meta.expectedComponentIds.split(',').map(s => s.trim()), rules: meta.probedRuleIds.split(',').map(s => s.trim()), prompt: section('Prompt'), checklist: section('Requirements checklist').split('\n').filter(line => line.startsWith('- [ ] ')), expected: section('Expected components'), probed: section('Rules and behavior probed') };
};
const tasks = readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(parse);
const words = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
const shingles = (text: string, n: number) => { const w = words(text); return new Set(Array.from({ length: Math.max(0, w.length - n + 1) }, (_, i) => w.slice(i, i + n).join(' '))); };

describe('evaluation task set (E1)', () => {
  it('has the eight fixed tasks, each with every required part', () => {
    expect(tasks.map(t => t.id)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']);
    for (const task of tasks) {
      expect(task.prompt.length, task.id).toBeGreaterThan(80);
      expect(task.expected, task.id).not.toBe('');
      expect(task.probed, task.id).not.toBe('');
      expect(task.checklist.length, task.id).toBeGreaterThanOrEqual(5);
    }
  });

  it('names real components and real rule IDs, matching the specified expectations', () => {
    const components = new Set(registry.components.map(c => c.id));
    const rules = new Set(registry.rules.map(r => r.id));
    for (const task of tasks) {
      for (const id of task.components) expect(components.has(id), `${task.id} ${id}`).toBe(true);
      for (const id of task.rules) expect(rules.has(id), `${task.id} ${id}`).toBe(true);
    }
    expect(Object.fromEntries(tasks.map(t => [t.id, t.components]))).toEqual({
      T1: ['form-field', 'label', 'input', 'select', 'switch', 'button'], T2: ['dialog', 'button'], T3: ['link'], T4: ['table', 'badge'],
      T5: ['button', 'spinner'], T6: ['tabs'], T7: ['card', 'button'], T8: ['button', 'tooltip'],
    });
    expect(tasks.find(t => t.id === 'T3')!.rules).toEqual(['prefer-semantic-link', 'avoid-custom-button']);
    expect(tasks.find(t => t.id === 'T7')!.rules).toEqual(['avoid-unnecessary-wrapper', 'minimize-custom-css']);
  });

  it('writes prompts the way a developer would, without naming SeeYesYes components, rules, or variants', () => {
    const names = [...registry.components.flatMap(c => [c.name, c.id, c.publicImport.exportName]), ...registry.rules.map(r => r.id), 'seeyesyes', 'design system', 'token'];
    for (const task of tasks) {
      const prompt = task.prompt.toLowerCase();
      for (const name of names) {
        const needle = name.toLowerCase();
        // Plain words such as "link" or "table" can appear naturally; component names are only a leak when they are the exported identifier.
        if (needle.includes('-') || needle.length > 7 || ['seeyesyes', 'token'].includes(needle)) expect(prompt, `${task.id} names "${name}"`).not.toContain(needle);
      }
      expect(prompt, task.id).not.toMatch(/variant|variant=|destructive|aria-busy|publicimport/);
    }
  });

  it('cannot be copied verbatim from a registry example', () => {
    const examples = registry.examples.flatMap(e => [e.title, e.code, e.intent === 'violation' ? e.explanation : '']);
    for (const task of tasks) {
      const promptShingles = shingles(task.prompt, 5);
      for (const text of examples) {
        const shared = [...shingles(text, 5)].filter(s => promptShingles.has(s));
        expect(shared, `${task.id} shares text with an example`).toEqual([]);
      }
      for (const example of registry.examples) expect(task.prompt.toLowerCase(), `${task.id} repeats example title "${example.title}"`).not.toContain(example.title.toLowerCase());
    }
  });

  it('has distinct prompts and checklists', () => {
    expect(new Set(tasks.map(t => t.prompt)).size).toBe(8);
    for (const task of tasks) expect(new Set(task.checklist).size).toBe(task.checklist.length);
  });
});
