// Runs the ORIGINAL chai_scaling_calculator.html script against the ported src/lib/chai.ts
// over a grid of inputs and compares every rendered output (tags stripped).
// Usage: node --experimental-strip-types scripts/verify-calculator.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { compute, render } from '../src/lib/chai.ts';

const html = readFileSync(new URL('../chai_scaling_calculator.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

const strip = (s) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const ids = ['time-bar', 'recipe-grid', 'instructions', 'loss-breakdown', 'concentrations', 'sanity'];
const map = { 'time-bar': 'timeBar', 'recipe-grid': 'recipeGrid', instructions: 'instructions', 'loss-breakdown': 'losses', concentrations: 'concentrations', sanity: 'sanity' };

function runOriginal(d, h, s) {
  const els = {};
  const el = (id) => (els[id] ??= { innerHTML: '', value: '', classList: { add() {} } });
  el('diameter').value = String(d); el('height').value = String(h); el('servings').value = String(s);
  const ctx = { document: { getElementById: el }, Math, parseFloat };
  vm.createContext(ctx);
  // The original ends with a bare calculate() call on load, so inputs are read at that point.
  vm.runInContext(script, ctx);
  return Object.fromEntries(ids.map((i) => [i, strip(els[i].innerHTML)]));
}

const diameters = [5, 8, 10, 12, 14.75, 16.5, 20, 25, 30, 40, 60];
const heights = [5, 8, 12, 20, 50];
const servings = [0.5, 1, 1.62, 2, 4, 8, 12, 20];
let n = 0, bad = 0;
for (const d of diameters) for (const h of heights) for (const s of servings) {
  const orig = runOriginal(d, h, s);
  const r = compute(d, h, s);
  const out = render(r);
  for (const id of ids) {
    n++;
    const a = orig[id], b = strip(out[map[id]]);
    if (a !== b) { bad++; if (bad < 6) console.error(`MISMATCH d=${d} h=${h} s=${s} [${id}]\n  orig: ${a}\n  port: ${b}`); }
  }
}
// invalid inputs are rejected identically (original returns without rendering)
if (compute(0, 12, 1) !== null || compute(14, 0, 1) !== null || compute(14, 12, NaN) !== null) { bad++; console.error('invalid-input handling differs'); }
console.log(`${n} section comparisons, ${bad} mismatches`);
process.exit(bad ? 1 : 0);
