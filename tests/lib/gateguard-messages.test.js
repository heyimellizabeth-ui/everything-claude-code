/**
 * Tests for scripts/lib/gateguard/messages.js
 *
 * Run with: node tests/lib/gateguard-messages.test.js
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
  EDIT_WRITE_HOOK_ID,
  BASH_HOOK_ID,
  sanitizePath,
  editGateMsg,
  writeGateMsg,
  destructiveBashMsg,
  routineBashMsg,
  withRecoveryHint,
  denyResult,
  allowWithStateWarning
} = require('../../scripts/lib/gateguard/messages');

console.log('\n=== Testing gateguard/messages ===\n');

test('sanitizePath removes control and bidi characters and caps length', () => {
  assert.strictEqual(sanitizePath('a\nb\u202Ec'), 'a b c');
  assert.strictEqual(sanitizePath('x'.repeat(600)).length, 500);
  assert.strictEqual(sanitizePath(null), '');
});

test('gate messages name the file and the gate', () => {
  assert.ok(editGateMsg('src/a.js').includes('Before editing src/a.js'));
  assert.ok(writeGateMsg('src/b.js').includes('Before creating src/b.js'));
  assert.ok(destructiveBashMsg().includes('Destructive command detected'));
  assert.ok(routineBashMsg().includes('first Bash command'));
});

test('withRecoveryHint lists the hook ids to disable', () => {
  const hint = withRecoveryHint('msg', [EDIT_WRITE_HOOK_ID, BASH_HOOK_ID]);
  assert.ok(hint.startsWith('msg\n'));
  assert.ok(hint.includes(`\`${EDIT_WRITE_HOOK_ID}\` or \`${BASH_HOOK_ID}\``));
});

test('denyResult builds a PreToolUse deny with optional hint', () => {
  const withHint = JSON.parse(denyResult('reason').stdout);
  assert.strictEqual(withHint.hookSpecificOutput.permissionDecision, 'deny');
  assert.ok(withHint.hookSpecificOutput.permissionDecisionReason.includes(EDIT_WRITE_HOOK_ID));
  const noHint = JSON.parse(denyResult('reason', { includeRecoveryHint: false }).stdout);
  assert.strictEqual(noHint.hookSpecificOutput.permissionDecisionReason, 'reason');
  assert.strictEqual(denyResult('r').exitCode, 0);
});

test('allowWithStateWarning allows with a stderr warning', () => {
  const result = allowWithStateWarning();
  assert.strictEqual(result.exitCode, 0);
  assert.ok(result.stderr.includes('could not be persisted'));
  assert.strictEqual(result.stdout, undefined);
});

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
