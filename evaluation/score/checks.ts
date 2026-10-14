import ts from 'typescript';
import type { DesignSystem } from '../../lib/contract/schema';

export type Violation = { ruleId: string; severity: 'error' | 'warning' | 'info'; file: string; line: number; message: string; needsReview?: boolean };

const rawColor = /(?<![\w&/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(/;
const namedColors = '(?:red|blue|green|yellow|orange|purple|pink|brown|gray|grey|black|white|silver|gold|navy|teal|maroon|olive|lime|aqua|fuchsia|cyan|magenta|crimson|coral|salmon|tomato|violet|indigo|beige|tan)';
const namedColorUse = new RegExp(`\\b(?:color|background(?:-?[cC]olor)?|border(?:-?[cC]olor)?|fill|stroke|outline(?:-?[cC]olor)?)["']?\\s*[:=]\\s*\\{?\\s*["']?\\s*${namedColors}\\b`, 'i');
const nativeInteractive = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary', 'details', 'label', 'option', 'form', 'audio', 'video']);
const clickProps = new Set(['onClick', 'onMouseDown', 'onMouseUp', 'onPointerDown', 'onDoubleClick', 'onKeyDown', 'onKeyUp', 'onKeyPress']);
const navigating = /\b(?:location\.(?:href|assign|replace)|window\.(?:open|location)|router\.(?:push|replace)|navigate\s*\(|history\.(?:push|replace)State)\b/;
const nativeToComponent: Record<string, string> = { button: 'Button', a: 'Link', input: 'Input, Checkbox, Switch, or Radio Group', select: 'Select', textarea: 'Textarea', table: 'Table', dialog: 'Dialog', label: 'Label' };
const nonLibraries = /^(?:react-aria-components|@react-aria\/|@react-stately\/|@radix-ui\/|@mui\/|@chakra-ui\/|@headlessui\/|antd|@ant-design\/|react-bootstrap|@mantine\/|@nextui-org\/|styled-components|@emotion\/|tailwindcss|clsx)/;
const customCssProps = /^(?:padding|margin|gap|borderRadius|fontSize|lineHeight|letterSpacing|boxShadow|width|height|minWidth|minHeight|maxWidth|top|left|right|bottom|rowGap|columnGap|paddingInline|paddingBlock|marginInline|marginBlock)(?:Top|Right|Bottom|Left|Inline|Block)?$/;

/** Each check keys its findings to a contract rule ID, so results link back to the Rules screen. */
export function checkSource(file: string, text: string, system: Pick<DesignSystem, 'rules' | 'components'>): Violation[] {
  const severity = (ruleId: string) => system.rules.find(rule => rule.id === ruleId)?.severity ?? 'warning';
  const modules = new Map(system.components.map(component => [component.publicImport.module, component.publicImport.exportName]));
  const violations: Violation[] = [];
  const add = (ruleId: string, line: number, message: string, needsReview = false) => violations.push({ ruleId, severity: severity(ruleId) as Violation['severity'], file, line, message, ...(needsReview ? { needsReview } : {}) });
  const lineOf = (index: number) => text.slice(0, index).split('\n').length;

  if (file.endsWith('.css')) {
    for (const declaration of text.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/gi)) {
      const [, property, value] = declaration;
      const line = lineOf(declaration.index);
      if (/^(?:color|background|background-color|border|border-color|fill|stroke|outline|outline-color|box-shadow)$/.test(property) && (rawColor.test(value) || new RegExp(`^\\s*${namedColors}\\b`, 'i').test(value))) add('token-no-raw-color', line, `Raw color in ${property}: ${value.trim()}`);
      if (property === 'outline' && /^\s*(?:none|0)\b/.test(value)) add('wcag-focus-visible', line, 'Focus outline removed');
      if (customCssProps.test(property.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())) && /\d+(?:px|rem|em)\b/.test(value) && !/var\(/.test(value)) add('minimize-custom-css', line, `Custom ${property}: ${value.trim()}`, true);
    }
    return violations;
  }

  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, file.endsWith('.tsx') || file.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const lineAt = (node: ts.Node) => source.getLineAndCharacterOfPosition(node.getStart()).line + 1;

  // Raw colors anywhere in strings and templates, and named colors used as style values.
  const scan = (node: ts.Node) => {
    if (ts.isStringLiteralLike(node) || ts.isJsxText(node)) {
      const parent = node.parent;
      const isHref = ts.isJsxAttribute(parent) && /^(?:href|id|htmlFor|name|aria-.*|data-.*)$/.test(parent.name.getText());
      if (!isHref && rawColor.test(node.text) && !ts.isImportDeclaration(parent)) add('token-no-raw-color', lineAt(node), `Raw color value: ${node.text.trim().slice(0, 40)}`);
    }
    ts.forEachChild(node, scan);
  };
  scan(source);
  const styleText = [...text.matchAll(/style=\{\{[\s\S]*?\}\}/g)];
  for (const match of styleText) if (namedColorUse.test(match[0])) add('token-no-raw-color', lineOf(match.index), `Named color in style: ${match[0].slice(0, 50)}`);

  const importedComponentModules = new Map<string, string>();
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      if (spec.startsWith('@/components/ui/')) {
        if (!modules.has(spec)) add('component-prefer-existing', lineAt(node), `Import outside a contract public module: ${spec}`);
        else for (const element of node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) ? node.importClause.namedBindings.elements : []) {
          importedComponentModules.set(element.name.text, spec);
          if ((element.propertyName ?? element.name).text !== modules.get(spec)) add('component-prefer-existing', lineAt(node), `${spec} exports ${modules.get(spec)}, not ${(element.propertyName ?? element.name).text}`);
        }
      } else if (/^\.\.?\/.*(?:components\/ui|\.module\.css)/.test(spec) || nonLibraries.test(spec)) add('component-prefer-existing', lineAt(node), `Import outside the contract public modules: ${spec}`);
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText();
      const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
      const attr = (name: string) => attributes.find(a => a.name.getText() === name);
      const line = lineAt(node);
      const lower = /^[a-z]/.test(tag);
      const clicks = attributes.filter(a => clickProps.has(a.name.getText()));
      const role = attr('role')?.initializer?.getText().replace(/["'{}]/g, '');
      if (lower && !nativeInteractive.has(tag) && clicks.length > 0) add('avoid-custom-button', line, `Clickable <${tag}>${role ? ` with role ${role}` : ''}: use a Button (or a Link for navigation)`);
      if ((tag === 'Button' || tag === 'button') && (attr('href') || clicks.some(a => navigating.test(a.getText())))) add('prefer-semantic-link', line, `<${tag}> used for navigation: use a Link`);
      if (tag === 'a') {
        const href = attr('href')?.initializer?.getText().replace(/["'{}]/g, '');
        if (!href || href === '#' || /^javascript:/i.test(href)) add('prefer-semantic-link', line, 'Anchor without a real destination acting as an action: use a Button');
        else add('component-prefer-existing', line, 'Native <a>: use the Link component');
      } else if (lower && nativeToComponent[tag] && tag !== 'label') add('component-prefer-existing', line, `Native <${tag}>: use ${nativeToComponent[tag]}`);
      const style = attr('style')?.initializer;
      if (style && ts.isJsxExpression(style) && style.expression && ts.isObjectLiteralExpression(style.expression)) {
        for (const property of style.expression.properties.filter(ts.isPropertyAssignment)) {
          const name = property.name.getText();
          const value = property.initializer;
          if (customCssProps.test(name) && (ts.isNumericLiteral(value) || (ts.isStringLiteralLike(value) && /\d+(?:px|rem|em)\b/.test(value.text)))) add('minimize-custom-css', lineAt(property), `Inline ${name}: ${value.getText()}`, true);
          if (name === 'outline' && ts.isStringLiteralLike(value) && /^\s*(?:none|0)\b/.test(value.text)) add('wcag-focus-visible', lineAt(property), 'Focus outline removed');
        }
      }
    }
    // Attribute-less wrappers that each hold exactly one element child.
    if (ts.isJsxElement(node) && !node.openingElement.attributes.properties.length && /^(?:div|span|section)$/.test(node.openingElement.tagName.getText())) {
      let depth = 0;
      let current: ts.JsxElement | undefined = node;
      while (current && !current.openingElement.attributes.properties.length && /^(?:div|span|section)$/.test(current.openingElement.tagName.getText())) {
        depth += 1;
        const children: ts.JsxChild[] = current.children.filter(child => !(ts.isJsxText(child) && child.text.trim() === ''));
        const only: ts.JsxChild | undefined = children.length === 1 ? children[0] : undefined;
        current = only && ts.isJsxElement(only) ? only : undefined;
      }
      if (depth >= 3 && !(node.parent && ts.isJsxElement(node.parent) && !node.parent.openingElement.attributes.properties.length && /^(?:div|span|section)$/.test(node.parent.openingElement.tagName.getText()))) add('avoid-unnecessary-wrapper', lineAt(node), `${depth} nested wrappers with no attributes`, true);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return dedupe(violations);
}

function dedupe(violations: Violation[]): Violation[] {
  const seen = new Set<string>();
  return violations.filter(v => { const key = `${v.ruleId}:${v.file}:${v.line}:${v.message}`; if (seen.has(key)) return false; seen.add(key); return true; });
}

/** Wrap a snippet the way registry examples are written (imports, then JSX) so it can be checked as a file. */
export function snippetAsFile(code: string): string {
  const lines = code.split('\n');
  return `${lines.filter(line => line.startsWith('import ')).join('\n')}\nexport const Example = () => (<>\n${lines.filter(line => !line.startsWith('import ')).join('\n')}\n</>);\n`;
}

/** axe-core results by impact, mapped to the contract rule that owns them. Only serious and critical findings count against a run. */
export function summarizeAxe(violations: { id: string; impact?: string | null; nodes: unknown[] }[]) {
  const counted = violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  return {
    serious: counted.filter(v => v.impact === 'serious').length, critical: counted.filter(v => v.impact === 'critical').length,
    ruleIds: [...new Set(counted.map(v => v.id === 'color-contrast' ? 'wcag-contrast' : v.id))].sort(), minor: violations.length - counted.length,
  };
}

export function summarize(violations: Violation[]) {
  const byRule: Record<string, number> = {};
  for (const v of violations) byRule[v.ruleId] = (byRule[v.ruleId] ?? 0) + 1;
  return { total: violations.length, errors: violations.filter(v => v.severity === 'error').length, warnings: violations.filter(v => v.severity === 'warning').length, infos: violations.filter(v => v.severity === 'info').length, byRule, needsReview: violations.filter(v => v.needsReview).length };
}
