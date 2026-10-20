/**
 * Tests for recc-evidence.js hook
 *
 * Run with: node tests/hooks/recc-evidence.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', '..', 'scripts', 'hooks', 'recc-evidence.js');
const runner = path.join(__dirname, '..', '..', 'scripts', 'hooks', 'run-with-flags.js');
const { extractEvidenceIds, extractTarget } = require(script);

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function makeProject({ recc = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recc-evidence-test-'));
  if (recc) fs.mkdirSync(path.join(dir, '.recc'));
  return dir;
}

function runScript(input, args = [script]) {
  const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
  return spawnSync('node', args, {
    encoding: 'utf8',
    input: inputStr,
    timeout: 10000,
    env: { ...process.env, ECC_HOOK_PROFILE: 'standard', ECC_DISABLED_HOOKS: '' }
  });
}

function readLog(dir) {
  const logPath = path.join(dir, '.recc', 'evidence-log.jsonl');
  if (!fs.existsSync(logPath)) return [];
  return fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
}

function reaPostToolUse(cwd, overrides = {}) {
  return {
    hook_event_name: 'PostToolUse',
    session_id: 'sess-1',
    cwd,
    tool_name: 'mcp__rea__inspect_artifact',
    tool_input: { input_path: '/abs/App.app' },
    tool_response: {
      content: [{ type: 'text', text: JSON.stringify({ evidence: { evidence_id: 'ev_1' }, parent_evidence_id: 'ev_0', evidenceId: 'ev_2' }) }]
    },
    ...overrides
  };
}

function runTests() {
  console.log('\n=== Testing recc-evidence.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('extractEvidenceIds finds ids in nested and escaped JSON', () => {
    const ids = extractEvidenceIds(reaPostToolUse('/x').tool_response);
    assert.deepStrictEqual(ids.sort(), ['ev_1', 'ev_2']);
    assert.deepStrictEqual(extractEvidenceIds(null), []);
  })) passed++; else failed++;

  if (test('extractTarget prefers known path keys', () => {
    assert.strictEqual(extractTarget({ input_path: '/a', path: '/b' }), '/a');
    assert.strictEqual(extractTarget({ url: 'https://example.test' }), 'https://example.test');
    assert.strictEqual(extractTarget({}), null);
    assert.strictEqual(extractTarget(null), null);
  })) passed++; else failed++;

  if (test('PostToolUse logs a row for REA calls when .recc/ exists', () => {
    const dir = makeProject();
    try {
      const input = reaPostToolUse(dir);
      const result = runScript(input);
      assert.strictEqual(result.status, 0);
      assert.strictEqual(result.stdout, JSON.stringify(input), 'stdin should pass through');
      const rows = readLog(dir);
      assert.strictEqual(rows.length, 1);
      assert.strictEqual(rows[0].tool, 'inspect_artifact');
      assert.strictEqual(rows[0].target, '/abs/App.app');
      assert.strictEqual(rows[0].session_id, 'sess-1');
      assert.strictEqual(rows[0].error, false);
      assert.deepStrictEqual(rows[0].evidence_ids.sort(), ['ev_1', 'ev_2']);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('PostToolUse records tool errors', () => {
    const dir = makeProject();
    try {
      runScript(reaPostToolUse(dir, { tool_response: { isError: true, content: [] } }));
      assert.strictEqual(readLog(dir)[0].error, true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('does nothing without a .recc/ directory (opt-in)', () => {
    const dir = makeProject({ recc: false });
    try {
      const result = runScript(reaPostToolUse(dir));
      assert.strictEqual(result.status, 0);
      assert.ok(!fs.existsSync(path.join(dir, '.recc')), 'must not create .recc/');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('ignores non-REA tools', () => {
    const dir = makeProject();
    try {
      runScript(reaPostToolUse(dir, { tool_name: 'mcp__github__get_me' }));
      assert.strictEqual(readLog(dir).length, 0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('malformed input exits 0 and passes stdin through', () => {
    const result = runScript('{not json');
    assert.strictEqual(result.status, 0);
    assert.strictEqual(result.stdout, '{not json');
  })) passed++; else failed++;

  if (test('Stop reminds once per batch of new REA calls in the session', () => {
    const dir = makeProject();
    try {
      runScript(reaPostToolUse(dir));
      const stop = { hook_event_name: 'Stop', session_id: 'sess-1', cwd: dir };
      const first = runScript(stop);
      assert.strictEqual(first.status, 0);
      assert.ok(first.stderr.includes('[RECC] 1 REA call(s)'), first.stderr);
      const second = runScript(stop);
      assert.strictEqual(second.stderr, '', 'no repeat reminder without new calls');
      runScript(reaPostToolUse(dir));
      const third = runScript(stop);
      assert.ok(third.stderr.includes('[RECC] 2 REA call(s)'), third.stderr);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('Stop is silent for sessions without REA calls', () => {
    const dir = makeProject();
    try {
      runScript(reaPostToolUse(dir));
      const result = runScript({ hook_event_name: 'Stop', session_id: 'other', cwd: dir });
      assert.strictEqual(result.stderr, '');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('works through run-with-flags.js and honors ECC_DISABLED_HOOKS', () => {
    const dir = makeProject();
    try {
      const args = [runner, 'post:recc-evidence-log', 'scripts/hooks/recc-evidence.js', 'standard,strict'];
      const result = runScript(reaPostToolUse(dir), args);
      assert.strictEqual(result.status, 0, result.stderr);
      assert.strictEqual(readLog(dir).length, 1);

      const disabled = spawnSync('node', args, {
        encoding: 'utf8',
        input: JSON.stringify(reaPostToolUse(dir)),
        env: { ...process.env, ECC_HOOK_PROFILE: 'standard', ECC_DISABLED_HOOKS: 'post:recc-evidence-log' }
      });
      assert.strictEqual(disabled.status, 0);
      assert.strictEqual(readLog(dir).length, 1, 'disabled hook must not log');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
