import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { registry } from '@/lib/data/registry';

/** Compile every recommended example against the real components, so documented code cannot drift from the prototype. */
function diagnose(code: string): string[] {
  const lines = code.split('\n');
  const imports = lines.filter(line => line.startsWith('import ')).join('\n');
  const body = lines.filter(line => !line.startsWith('import ')).join('\n');
  const source = `${imports}\nexport const Example = () => (<>\n${body}\n</>);\n`;
  const file = `${process.cwd()}/__example__.tsx`;
  const config = ts.getParsedCommandLineOfConfigFile('tsconfig.json', {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined })!;
  const options: ts.CompilerOptions = { ...config.options, noEmit: true, incremental: false, tsBuildInfoFile: undefined };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (name, languageVersion, ...rest) => name === file ? ts.createSourceFile(name, source, languageVersion) : original(name, languageVersion, ...rest);
  const readFile = host.readFile.bind(host); host.readFile = name => name === file ? source : readFile(name);
  const fileExists = host.fileExists.bind(host); host.fileExists = name => name === file || fileExists(name);
  const program = ts.createProgram([file], options, host);
  return ts.getPreEmitDiagnostics(program, program.getSourceFile(file)).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
}

describe('registry example code', () => {
  const recommended = registry.examples.filter(example => example.intent === 'recommended');

  it('has recommended examples to check', () => { expect(recommended.length).toBeGreaterThanOrEqual(registry.components.length); });

  for (const example of recommended) {
    it(`${example.id} type-checks against the shipped components`, () => {
      expect(diagnose(example.code)).toEqual([]);
    }, 30_000);
  }

  it('catches a deliberately wrong example, so the check is not vacuous', () => {
    expect(diagnose('import { Button } from "@/components/ui/button";\n<Button variant="nonexistent">Save</Button>').length).toBeGreaterThan(0);
    expect(diagnose('import { Nope } from "@/components/ui/button";\n<Nope />').length).toBeGreaterThan(0);
  });

  it('imports only from contract public import modules', () => {
    const modules = new Set(registry.components.map(c => c.publicImport.module));
    for (const example of recommended) for (const [, module] of example.code.matchAll(/from "([^"]+)"/g)) expect(modules.has(module), `${example.id}: ${module}`).toBe(true);
  });
});
