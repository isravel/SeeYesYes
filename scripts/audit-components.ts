import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import { registry } from '../lib/data/registry';
import { validateRegistry } from '../lib/contract/validate';
import { auditComponentStyles } from './lib/component-audit';
const system = validateRegistry(registry);
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const options = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd()).options;
const paths = system.components.map(component => resolve(component.publicImport.module.replace('@/', '') + '.tsx'));
const program = ts.createProgram(paths, options);
const checker = program.getTypeChecker();
const issues: string[] = [];
for (const [index, component] of system.components.entries()) {
  const source = program.getSourceFile(paths[index])!;
  const symbol = checker.getSymbolAtLocation(source)!;
  const exported = checker.getExportsOfModule(symbol).find(item => item.name === component.publicImport.exportName)!;
  const signature = checker.getTypeOfSymbolAtLocation(exported, source).getCallSignatures()[0];
  const props = checker.getTypeOfSymbolAtLocation(signature.parameters[0], source);
  const declaration = source.statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === component.publicImport.exportName) as ts.FunctionDeclaration;
  const bindings = declaration.parameters[0].name;
  const initializers = ts.isObjectBindingPattern(bindings) ? new Map(bindings.elements.map(binding => [binding.name.getText(source), binding.initializer])) : new Map<string, ts.Expression | undefined>();
  for (const required of props.getProperties().filter(property => !(property.flags & ts.SymbolFlags.Optional))) {
    if (!component.props.some(prop => prop.name === required.name && prop.required)) issues.push(`${component.id}: Missing required public prop ${required.name}`);
  }
  for (const prop of component.props) {
    const declared = props.getProperty(prop.name);
    if (!declared) issues.push(`${component.id}: Unknown public prop ${prop.name}`);
    else if (prop.required && declared.flags & ts.SymbolFlags.Optional) issues.push(`${component.id}: Required prop ${prop.name} is optional in the public API`);
    if (declared) for (const value of prop.allowedValues ?? []) {
      const literal = typeof value === 'string' ? checker.getStringLiteralType(value) : typeof value === 'number' ? checker.getNumberLiteralType(value) : checker.getBooleanType();
      if (!checker.isTypeAssignableTo(literal, checker.getTypeOfSymbolAtLocation(declared, source))) issues.push(`${component.id}: Unsupported public prop value ${prop.name}=${value}`);
    }
    const initializer = initializers.get(prop.name);
    if (initializer && prop.defaultValue !== undefined) {
      const literal = ts.isStringLiteral(initializer) ? initializer.text : ts.isNumericLiteral(initializer) ? Number(initializer.text) : initializer.kind === ts.SyntaxKind.TrueKeyword ? true : initializer.kind === ts.SyntaxKind.FalseKeyword ? false : undefined;
      if (literal !== undefined && literal !== prop.defaultValue) issues.push(`${component.id}: Default mismatch for ${prop.name}`);
    }
    if (prop.defaultValue !== undefined && !initializer && prop.defaultValue !== false && !source.text.includes(`defaults.${prop.name}`)) issues.push(`${component.id}: Default ${prop.name} is not applied by the implementation`);
  }
  const cssFiles = [...source.text.matchAll(/from ['"](.+\.module\.css)['"]/g)].map(([, file]) => resolve(dirname(paths[index]), file));
  const css = cssFiles.map(file => readFileSync(file, 'utf8')).join('\n');
  issues.push(...auditComponentStyles(component, css, system.tokens).map(issue => `${component.id}: ${issue}`));
  console.log(`${component.id}: ${component.props.length} documented props, ${component.tokenIds.length} CSS tokens, ${component.compoundVariants.length} compounds; ${component.maturity}, ${component.accessibility.status}`);
}
if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
else console.log(`All ${system.components.length} component implementations match their documented props, literal defaults, direct CSS tokens, and styled compounds.`);
