import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dir = 'components/ui';
const files = readdirSync(dir).filter(file => file.endsWith('.module.css'));
const css = (file: string) => readFileSync(`${dir}/${file}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const selectors = (file: string) => [...css(file).matchAll(/([^{}@]+)\{/g)].flatMap(m => m[1].split(',').map(s => s.trim())).filter(s => s && !/^(from|to|\d+%)/.test(s) && !/^(media|keyframes)\b/.test(s));
// Documented geometry exceptions: a pill-shaped switch track is a shape, not a scale step.
const geometryExceptions = new Set(['Switch.module.css']);

describe('component style ownership (OOCSS review)', () => {
  it('audits every component style module', () => { expect(files.length).toBeGreaterThanOrEqual(29); });

  it('uses semantic tokens for appearance: no raw color literals', () => {
    for (const file of files) expect(css(file), file).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(|oklab\(/);
  });

  it('keeps component rules private: no :global, no !important, no selector that reaches outside its own classes', () => {
    for (const file of files) {
      expect(css(file), file).not.toMatch(/:global|!important/);
      for (const selector of selectors(file)) {
        // Every compound in a selector starts from one of this module's own classes, or a native element beneath one.
        const compounds = selector.split(/\s*[>+~]\s*|\s+/).filter(Boolean);
        expect(compounds[0], `${file}: ${selector}`).toMatch(/^\.[\w-]+/);
        expect(selector, `${file}: ${selector}`).not.toMatch(/(?:^|\s)(?:body|html|main|header|footer|aside|section|article)\b/);
      }
    }
  });

  it('expresses variants as data attributes on the base structure, not as parallel classes', () => {
    for (const file of files) {
      const classes = new Set(selectors(file).flatMap(selector => [...selector.matchAll(/\.([\w-]+)/g)].map(m => m[1])));
      for (const name of classes) expect(name, `${file}: .${name}`).not.toMatch(/^(?:primary|secondary|ghost|destructive|small|medium|large|outlined|subtle|success|warning|info|danger)$/);
    }
  });

  it('takes geometry from shared scales rather than hard-coded lengths', () => {
    for (const file of files.filter(f => !geometryExceptions.has(f))) {
      for (const [, property, value] of css(file).matchAll(/(padding|margin|gap|border-radius|row-gap|column-gap)[a-z-]*\s*:\s*([^;]+);/g)) {
        const raw = value.replace(/var\([^)]*\)/g, '').match(/-?\d+(?:\.\d+)?px/g) ?? [];
        // Hairline offsets such as a 1px border adjustment are allowed; anything larger belongs on a scale.
        expect(raw.filter(length => Math.abs(parseFloat(length)) > 1), `${file}: ${property}: ${value}`).toEqual([]);
      }
    }
  });

  it('does not duplicate a variant base: each variant selector adds to one shared base rule', () => {
    for (const file of files) {
      const variantRules = selectors(file).filter(selector => /\[data-(?:variant|tone|size|shape)="/.test(selector));
      for (const selector of variantRules) {
        const base = selector.match(/^\.([\w-]+)/)![1];
        expect(selectors(file), `${file}: ${selector} has no base .${base} rule`).toContain(`.${base}`);
      }
    }
  });
});
