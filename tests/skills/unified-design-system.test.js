/**
 * Link check for skills/unified-design-system: every reference file and every
 * ECC skill the router names must exist, so the front door never points at
 * something missing.
 *
 * Run with: node tests/skills/unified-design-system.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SKILL_DIR = path.join(ROOT, 'skills', 'unified-design-system');

// Skills that live in other repos (installed separately), so they are not
// expected under this repo's skills/ folder.
const EXTERNAL_SKILLS = new Set([
  'ui-ux-pro-max',
  'redesign-skill',
  'modern-web-guidance',
  'brand',
  'banner-design'
]);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    failed++;
  }
}

const skillText = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf8');
const referenceDir = path.join(SKILL_DIR, 'references');
const referenceFiles = fs.readdirSync(referenceDir).filter(f => f.endsWith('.md'));

function referencesIn(text) {
  return [...new Set([...text.matchAll(/references\/([a-z0-9-]+\.md)/g)].map(m => m[1]))];
}

console.log('\nunified-design-system links:');

test('every references/ file named in SKILL.md exists', () => {
  const missing = referencesIn(skillText).filter(f => !fs.existsSync(path.join(referenceDir, f)));
  assert.deepStrictEqual(missing, []);
});

test('every references/ file named inside a reference file exists', () => {
  const missing = [];
  for (const file of referenceFiles) {
    const text = fs.readFileSync(path.join(referenceDir, file), 'utf8');
    for (const ref of referencesIn(text)) {
      if (!fs.existsSync(path.join(referenceDir, ref))) missing.push(`${file} -> ${ref}`);
    }
  }
  assert.deepStrictEqual(missing, []);
});

test('every reference file is reachable from SKILL.md', () => {
  const named = new Set(referencesIn(skillText));
  const orphans = referenceFiles.filter(f => !named.has(f));
  assert.deepStrictEqual(orphans, []);
});

test('every module skill in the build table exists here or is a known external skill', () => {
  const section = skillText.split('### 5.')[1].split('### 6.')[0];
  const names = [...section.matchAll(/`([a-z0-9-]+)`/g)].map(m => m[1]);
  assert.ok(names.length > 0, 'no module names found in step 5');
  const missing = names.filter(n => !EXTERNAL_SKILLS.has(n) && !fs.existsSync(path.join(ROOT, 'skills', n, 'SKILL.md')));
  assert.deepStrictEqual(missing, []);
});

test('no root DESIGN.md fallback (Hallmark uses that file as its project marker)', () => {
  assert.ok(!/`DESIGN\.md` at the project root/.test(skillText));
});

console.log('\n=== Test Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);
process.exit(failed > 0 ? 1 : 0);
