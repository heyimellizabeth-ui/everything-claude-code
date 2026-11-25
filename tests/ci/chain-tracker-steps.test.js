/**
 * The chain-tracker mod lists each chain's steps; they must match the chain skills.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const mod = fs.readFileSync(path.join(ROOT, 'plugins', 'chain-tracker', 'hooks', 'register.tsx'), 'utf8');

let failed = 0;
for (const chain of ['c1', 'c2', 'c3', 'c4', 'c5']) {
  const skill = fs.readFileSync(path.join(ROOT, 'plugins', 'studio-kit', 'skills', chain, 'SKILL.md'), 'utf8');
  const blocks = (skill.match(/```[\s\S]*?```/g) || []).join('\n');
  const expected = [...new Set([...blocks.matchAll(/^\/([a-z][\w-]*)/gm)].map(m => m[1]))].filter(s => s !== chain);
  const line = mod.match(new RegExp(`^\\s+${chain}: \\{[^\\n]*steps: \\[([^\\]]*)\\]`, 'm'));
  const actual = line ? [...line[1].matchAll(/'([^']+)'/g)].map(m => m[1]) : [];
  try {
    assert.deepStrictEqual(actual, expected);
    console.log(`  PASS ${chain} steps match plugins/studio-kit/skills/${chain}/SKILL.md`);
  } catch {
    failed += 1;
    console.log(`  FAIL ${chain}: mod has [${actual.join(', ')}], skill has [${expected.join(', ')}]`);
  }
}
console.log(`\nResults: Passed: ${5 - failed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
