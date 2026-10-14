import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
// @ts-expect-error The reset script is plain ESM without type declarations.
import { resetFixture } from '../evaluation/reset.mjs';
import { checkSource, snippetAsFile, summarize, summarizeAxe } from '../evaluation/score/checks';
import { changedFiles, scoreDirectory } from '../evaluation/score/index';

const check = (code: string, file = 'app/t1/page.tsx') => checkSource(file, snippetAsFile(code), registry);
const ids = (code: string) => [...new Set(check(code).map(v => v.ruleId))].sort();
const example = (id: string) => registry.examples.find(e => e.id === id)!;

describe('scoring checks against the registry examples (E3)', () => {
  const automatable = ['component-prefer-existing', 'token-no-raw-color', 'wcag-focus-visible', 'avoid-unnecessary-wrapper', 'avoid-custom-button', 'prefer-semantic-link', 'minimize-custom-css'];

  for (const rule of registry.rules.filter(r => automatable.includes(r.id))) {
    it(`${rule.id}: flags its violation example under that rule`, () => {
      const found = check(example(rule.violationExampleId).code);
      expect(found.some(v => v.ruleId === rule.id), `${rule.id} not flagged in: ${example(rule.violationExampleId).code}`).toBe(true);
      for (const v of found.filter(item => item.ruleId === rule.id)) expect(v.severity).toBe(rule.severity);
    });
    it(`${rule.id}: reports nothing for its corrected example`, () => {
      expect(check(example(rule.correctExampleId).code)).toEqual([]);
    });
  }

  it('wcag-contrast is measured by axe, and its violation example is caught as a raw color here', () => {
    expect(ids(example('wcag-contrast-violation').code)).toContain('token-no-raw-color');
    expect(summarizeAxe([{ id: 'color-contrast', impact: 'serious', nodes: [] }, { id: 'region', impact: 'moderate', nodes: [] }])).toEqual({ serious: 1, critical: 0, ruleIds: ['wcag-contrast'], minor: 1 });
  });

  it('reports nothing for any recommended registry example, so the scorer has no false positives on correct code', () => {
    for (const e of registry.examples.filter(item => item.intent === 'recommended')) expect(check(e.code), e.id).toEqual([]);
  });

  it('flags every registry violation example for at least one rule', () => {
    for (const e of registry.examples.filter(item => item.intent === 'violation')) {
      const rule = registry.rules.find(r => r.violationExampleId === e.id)!;
      expect(check(e.code).length > 0 || ['wcag-contrast'].includes(rule.id), e.id).toBe(true);
    }
  });
});

describe('individual checks', () => {
  it('finds raw colors in strings, styles, and CSS, but not tokens, anchors, or ids', () => {
    expect(ids('<p style={{ color: "#fff" }}>x</p>')).toContain('token-no-raw-color');
    expect(ids('<p style={{ background: "rgb(1,2,3)" }}>x</p>')).toContain('token-no-raw-color');
    expect(ids('<p style={{ color: "red" }}>x</p>')).toContain('token-no-raw-color');
    expect(ids('<p style={{ color: "var(--sys-color-primary)" }}>x</p>')).not.toContain('token-no-raw-color');
    expect(ids('<a href="#main" id="#top-1">x</a>')).not.toContain('token-no-raw-color');
    expect(checkSource('app/x.module.css', '.a { color: #123456; border: 1px solid oklch(0.5 0.1 200); }', registry).filter(v => v.ruleId === 'token-no-raw-color')).toHaveLength(2);
    expect(checkSource('app/x.module.css', '.a { color: var(--sys-color-primary); background: transparent; }', registry)).toEqual([]);
  });

  it('flags clickable non-interactive elements, including ones dressed up with a role', () => {
    expect(ids('<span onClick={() => {}}>x</span>')).toContain('avoid-custom-button');
    expect(ids('<div role="button" tabIndex={0} onKeyDown={() => {}}>x</div>')).toContain('avoid-custom-button');
    expect(ids('<li onClick={go}>x</li>')).toContain('avoid-custom-button');
    expect(ids('<form onSubmit={go}><label>x</label></form>')).not.toContain('avoid-custom-button');
  });

  it('flags buttons used for navigation, but not for actions', () => {
    expect(ids('<Button onClick={() => router.push("/a")}>Go</Button>')).toContain('prefer-semantic-link');
    expect(ids('<Button onClick={() => window.open("/a")}>Go</Button>')).toContain('prefer-semantic-link');
    expect(ids('<Button href="/a">Go</Button>')).toContain('prefer-semantic-link');
    expect(ids('<a href="#" onClick={save}>Save</a>')).toContain('prefer-semantic-link');
    expect(ids('<Button onClick={() => save()}>Save</Button>')).not.toContain('prefer-semantic-link');
  });

  it('flags imports outside the contract public modules and UI libraries used directly', () => {
    const imports = (code: string) => checkSource('app/t1/page.tsx', `${code}\nexport default function P() { return null; }`, registry).map(v => v.message);
    expect(imports('import { Button } from "@/components/ui/button";')).toEqual([]);
    expect(imports('import { Button } from "@/components/ui/Button.module.css";').join()).toMatch(/outside/);
    expect(imports('import { Foo } from "@/components/ui/button";').join()).toMatch(/exports Button, not Foo/);
    expect(imports('import { Dialog } from "react-aria-components";').join()).toMatch(/react-aria-components/);
    expect(imports('import { Button } from "@mui/material";').join()).toMatch(/@mui\/material/);
    expect(imports('import { useState } from "react";')).toEqual([]);
  });

  it('flags custom inline sizing for review, and removed focus outlines', () => {
    const custom = check('<Button style={{ padding: 27, borderRadius: "17px" }}>x</Button>').filter(v => v.ruleId === 'minimize-custom-css');
    expect(custom).toHaveLength(2);
    expect(custom.every(v => v.needsReview)).toBe(true);
    expect(ids('<Button style={{ padding: "var(--sys-spacing-stack)" }}>x</Button>')).not.toContain('minimize-custom-css');
    expect(ids('<Button style={{ outline: "none" }}>x</Button>')).toContain('wcag-focus-visible');
  });

  it('flags stacked attribute-less wrappers for review, but not meaningful ones', () => {
    const found = check('<div><div><div><Button>x</Button></div></div></div>').filter(v => v.ruleId === 'avoid-unnecessary-wrapper');
    expect(found).toHaveLength(1);
    expect(found[0].needsReview).toBe(true);
    expect(ids('<div className="x"><div className="y"><div className="z"><Button>x</Button></div></div></div>')).not.toContain('avoid-unnecessary-wrapper');
    expect(ids('<div><div><Button>x</Button></div></div>')).not.toContain('avoid-unnecessary-wrapper');
  });

  it('takes severity from the matching rule and summarizes by rule', () => {
    const found = check('<div onClick={go} style={{ color: "#fff" }}>x</div>');
    expect(found.find(v => v.ruleId === 'avoid-custom-button')!.severity).toBe('error');
    expect(found.find(v => v.ruleId === 'token-no-raw-color')!.severity).toBe('warning');
    const summary = summarize(found);
    expect(summary).toMatchObject({ errors: 1, byRule: { 'avoid-custom-button': 1, 'token-no-raw-color': 1 } });
  });
});

describe('scoring a run', () => {
  const temp = mkdtempSync(join(tmpdir(), 'seeyesyes-fixture-score-'));
  afterAll(() => rmSync(temp, { recursive: true, force: true }));
  const baseline = join(temp, 'baseline-fixture');
  const run = join(temp, 'run-fixture');
  resetFixture({ outDir: baseline });
  resetFixture({ outDir: run });

  it('scores nothing for an untouched copy', () => {
    expect(scoreDirectory(run, baseline)).toEqual({ files: [], violations: [] });
  });

  it('scores only the files a run changed or added', () => {
    writeFileSync(join(run, 'app', 't3', 'page.tsx'), 'export default function T3() { return <main><div onClick={() => {}}>View profile</div></main>; }');
    mkdirSync(join(run, 'app', 't3', 'parts'), { recursive: true });
    writeFileSync(join(run, 'app', 't3', 'parts', 'extra.module.css'), '.x { color: #ff0000; }');
    expect(changedFiles(run, baseline)).toEqual(['app/t3/page.tsx', 'app/t3/parts/extra.module.css']);
    const { violations } = scoreDirectory(run, baseline);
    expect(violations.map(v => `${v.file}:${v.ruleId}`).sort()).toEqual(['app/t3/page.tsx:avoid-custom-button', 'app/t3/parts/extra.module.css:token-no-raw-color']);
  });
});
