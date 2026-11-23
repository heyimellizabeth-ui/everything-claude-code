/**
 * Tests for scripts/lib/gateguard/bash-analysis.js
 *
 * Run with: node tests/lib/gateguard-bash-analysis.test.js
 */

const assert = require('assert');

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

const {
  stripQuotedStrings,
  explodeSubshells,
  splitCommandSegments,
  tokenize,
  isDestructiveRm,
  collectExecutableBodies,
  isDestructiveBash
} = require('../../scripts/lib/gateguard/bash-analysis');

console.log('\n=== Testing gateguard/bash-analysis ===\n');

test('stripQuotedStrings empties quoted content', () => {
  assert.strictEqual(stripQuotedStrings('git commit -m "drop table" && echo \'x\''), 'git commit -m "" && echo \'\'');
});

test('explodeSubshells turns $(...) and backticks into segments', () => {
  assert.strictEqual(explodeSubshells('echo $(rm -rf /tmp)'), 'echo ;rm -rf /tmp;');
  assert.strictEqual(explodeSubshells('echo `ls`'), 'echo ;ls;');
});

test('splitCommandSegments splits on separators and drops comments', () => {
  assert.deepStrictEqual(splitCommandSegments('a && b | c; d # note'), ['a', 'b', 'c', 'd']);
});

test('tokenize splits on whitespace', () => {
  assert.deepStrictEqual(tokenize('  rm   -rf  x '), ['rm', '-rf', 'x']);
});

test('isDestructiveRm needs both recursive and force', () => {
  assert.strictEqual(isDestructiveRm(['rm', '-rf', 'x']), true);
  assert.strictEqual(isDestructiveRm(['rm', '-r', '-f', 'x']), true);
  assert.strictEqual(isDestructiveRm(['rm', '--recursive', '--force', 'x']), true);
  assert.strictEqual(isDestructiveRm(['rm', '-r', 'x']), false);
  assert.strictEqual(isDestructiveRm(['ls', '-rf']), false);
});

test('collectExecutableBodies finds nested bodies', () => {
  const bodies = collectExecutableBodies('echo $(cat a) && (cd b && ls)');
  assert.ok(bodies.includes('cat a'), JSON.stringify(bodies));
  assert.ok(bodies.some(b => b.includes('cd b')), JSON.stringify(bodies));
});

test('isDestructiveBash flags destructive commands', () => {
  for (const cmd of ['rm -rf build', 'echo y | $(rm -rf /tmp/x)', 'psql -c "x"; truncate logs', 'git reset --hard', 'dd if=image.iso of=/dev/sdb', '{ rm -rf out; }']) {
    assert.strictEqual(isDestructiveBash(cmd), true, cmd);
  }
});

test('isDestructiveBash ignores quoted mentions and routine commands', () => {
  for (const cmd of ['git commit -m "drop table users"', 'npm test', 'ls -la', 'echo "rm -rf /"', '']) {
    assert.strictEqual(isDestructiveBash(cmd), false, cmd);
  }
});

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
