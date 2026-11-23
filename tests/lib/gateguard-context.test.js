/**
 * Tests for scripts/lib/gateguard/context.js
 *
 * Run with: node tests/lib/gateguard-context.test.js
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
  normalizeEnvValue,
  isGateGuardDisabled,
  normalizeForMatch,
  isClaudeSettingsPath,
  isSubagentInvocation
} = require('../../scripts/lib/gateguard/context');

function withEnv(env, fn) {
  const saved = {};
  for (const key of Object.keys(env)) {
    saved[key] = process.env[key];
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(saved)) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}

console.log('\n=== Testing gateguard/context ===\n');

test('normalizeEnvValue trims and lowercases', () => {
  assert.strictEqual(normalizeEnvValue('  OFF '), 'off');
  assert.strictEqual(normalizeEnvValue(undefined), '');
});

test('isGateGuardDisabled honours GATEGUARD_DISABLED and ECC_GATEGUARD', () => {
  assert.strictEqual(withEnv({ GATEGUARD_DISABLED: '1', ECC_GATEGUARD: undefined }, isGateGuardDisabled), true);
  for (const value of ['0', 'false', 'off', 'Disabled', 'disable']) {
    assert.strictEqual(withEnv({ GATEGUARD_DISABLED: undefined, ECC_GATEGUARD: value }, isGateGuardDisabled), true, value);
  }
  assert.strictEqual(withEnv({ GATEGUARD_DISABLED: undefined, ECC_GATEGUARD: 'on' }, isGateGuardDisabled), false);
  assert.strictEqual(withEnv({ GATEGUARD_DISABLED: undefined, ECC_GATEGUARD: undefined }, isGateGuardDisabled), false);
});

test('normalizeForMatch uses forward slashes and lower case', () => {
  assert.strictEqual(normalizeForMatch('C:\\Repo\\.Claude\\X'), 'c:/repo/.claude/x');
});

test('isClaudeSettingsPath matches settings files only', () => {
  assert.strictEqual(isClaudeSettingsPath('/repo/.claude/settings.json'), true);
  assert.strictEqual(isClaudeSettingsPath('.claude/settings.local.json'), true);
  assert.strictEqual(isClaudeSettingsPath('C:\\repo\\.claude\\settings.json'), true);
  assert.strictEqual(isClaudeSettingsPath('/repo/.claude/hooks.json'), false);
  assert.strictEqual(isClaudeSettingsPath('/repo/settings.json'), false);
});

test('isSubagentInvocation detects agent and parent tool ids', () => {
  assert.strictEqual(isSubagentInvocation({ agent_id: 'a1' }), true);
  assert.strictEqual(isSubagentInvocation({ parentToolUseId: 'p1' }), true);
  assert.strictEqual(isSubagentInvocation({ agent_id: '   ' }), false);
  assert.strictEqual(isSubagentInvocation(null), false);
  assert.strictEqual(isSubagentInvocation({ tool_name: 'Edit' }), false);
});

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
