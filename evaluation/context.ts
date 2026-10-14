// Prepare a run's context for a condition and task, from the shipped exports.
//   node --import tsx evaluation/context.ts <C0|C1|C2|C3> <T1..T8> [--out <fixture dir>]
// Writes AGENTS.md into the fixture copy for C1 to C3 and prints the prompt to give the agent, with any pasted context first.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { registry } from '../lib/data/registry';
import { buildCondition, conditions, readTask, type Condition } from './lib/condition';

const [condition, taskId, ...rest] = process.argv.slice(2);
if (!conditions.includes(condition as Condition) || !/^T[1-8]$/.test(taskId ?? '')) { console.error('Usage: context.ts <C0|C1|C2|C3> <T1..T8> [--out <fixture dir>]'); process.exit(1); }
const out = resolve(rest.includes('--out') ? rest[rest.indexOf('--out') + 1] : join('evaluation', 'work', 'fixture-app'));
const result = buildCondition(condition as Condition, readTask(taskId), registry);
if (result.agentsMd !== null) { mkdirSync(out, { recursive: true }); writeFileSync(join(out, 'AGENTS.md'), result.agentsMd); }
const text = `${result.preamble ? `${result.preamble}\n\n---\n\n` : ''}${result.prompt}\n`;
process.stderr.write(`${condition} ${taskId}: ${result.contextBytes.toLocaleString('en-US')} bytes of context added${result.agentsMd !== null ? ` (AGENTS.md written to ${out})` : ''}\n`);
process.stdout.write(text);
