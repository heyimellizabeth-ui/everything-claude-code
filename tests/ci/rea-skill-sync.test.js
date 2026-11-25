/**
 * Coverage for scripts/ci/check-rea-skill-sync.js.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { checkReaSkillSync, parseReaRoot, readSkillVersion } = require('../../scripts/ci/check-rea-skill-sync');

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS ${name}`);
    return true;
  } catch (error) {
    console.log(`  FAIL ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function writeSkill(root, relDir, version) {
  const dir = path.join(root, relDir, 'reverse-engineer-anything');
  fs.mkdirSync(dir, { recursive: true });
  const meta = version === null ? '' : `metadata:\n  version: "${version}"\n`;
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: reverse-engineer-anything\n${meta}---\n\n# REA\n`);
}

function withRoots(eccVersion, reaVersion, fn) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-rea-sync-'));
  const eccRoot = path.join(base, 'ecc');
  const reaRoot = path.join(base, 'rea');
  try {
    writeSkill(eccRoot, 'skills', eccVersion);
    writeSkill(reaRoot, path.join('.agents', 'skills'), reaVersion);
    fn({ eccRoot, reaRoot });
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
}

function runTests() {
  console.log('\n=== Testing check-rea-skill-sync.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('reports a copy that is behind rea', () => {
    withRoots(42, 44, roots => {
      assert.deepStrictEqual(checkReaSkillSync(roots), { ecc: 42, rea: 44, isBehind: true });
    });
  })) passed++; else failed++;

  if (test('passes when the versions match', () => {
    withRoots(44, 44, roots => {
      assert.strictEqual(checkReaSkillSync(roots).isBehind, false);
    });
  })) passed++; else failed++;

  if (test('throws when a skill has no metadata.version', () => {
    withRoots(42, null, ({ reaRoot }) => {
      assert.throws(
        () => readSkillVersion(path.join(reaRoot, '.agents', 'skills', 'reverse-engineer-anything', 'SKILL.md')),
        /no metadata\.version/
      );
    });
  })) passed++; else failed++;

  if (test('reads the rea path from --rea before REA_REPO', () => {
    assert.strictEqual(parseReaRoot(['--rea', '/a'], { REA_REPO: '/b' }), '/a');
    assert.strictEqual(parseReaRoot([], { REA_REPO: '/b' }), '/b');
    assert.strictEqual(parseReaRoot([], {}), null);
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
