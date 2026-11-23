/**
 * Tests for scripts/lib/gateguard/state.js
 *
 * Run with: node tests/lib/gateguard-state.test.js
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
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  SESSION_TIMEOUT_MS,
  MAX_CHECKED_ENTRIES,
  ROUTINE_BASH_SESSION_KEY,
  sanitizeSessionKey,
  resolveSessionKey,
  pruneCheckedEntries,
  createStateStore
} = require('../../scripts/lib/gateguard/state');

const tmpDirs = [];
function tmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gateguard-state-'));
  tmpDirs.push(dir);
  return dir;
}

console.log('\n=== Testing gateguard/state ===\n');

test('sanitizeSessionKey keeps safe ids and hashes long ones', () => {
  assert.strictEqual(sanitizeSessionKey('abc-123'), 'abc-123');
  assert.strictEqual(sanitizeSessionKey('a b/c'), 'a_b_c');
  assert.strictEqual(sanitizeSessionKey(''), '');
  assert.ok(/^sid-[0-9a-f]{24}$/.test(sanitizeSessionKey('x'.repeat(80))));
});

test('resolveSessionKey prefers the session id from input', () => {
  assert.strictEqual(resolveSessionKey({ session_id: 'sess-1' }), 'sess-1');
});

test('resolveSessionKey falls back to a transcript hash', () => {
  const saved = { CLAUDE_SESSION_ID: process.env.CLAUDE_SESSION_ID, ECC_SESSION_ID: process.env.ECC_SESSION_ID };
  delete process.env.CLAUDE_SESSION_ID;
  delete process.env.ECC_SESSION_ID;
  try {
    assert.ok(/^tx-[0-9a-f]{24}$/.test(resolveSessionKey({ transcript_path: '/tmp/t.jsonl' })));
    assert.ok(/^proj-[0-9a-f]{24}$/.test(resolveSessionKey({})) || Boolean(process.env.CLAUDE_TRANSCRIPT_PATH));
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value !== undefined) process.env[key] = value;
    }
  }
});

test('pruneCheckedEntries keeps the routine bash key and caps size', () => {
  const entries = [ROUTINE_BASH_SESSION_KEY];
  for (let i = 0; i < MAX_CHECKED_ENTRIES + 20; i++) entries.push(`file-${i}.js`);
  const pruned = pruneCheckedEntries(entries);
  assert.strictEqual(pruned.length, MAX_CHECKED_ENTRIES);
  assert.strictEqual(pruned[0], ROUTINE_BASH_SESSION_KEY);
  assert.strictEqual(pruned[pruned.length - 1], `file-${MAX_CHECKED_ENTRIES + 19}.js`);
  assert.deepStrictEqual(pruneCheckedEntries(['a']), ['a']);
});

test('store marks and remembers keys per session file', () => {
  const dir = tmpDir();
  const store = createStateStore(dir);
  store.getStateFile({ session_id: 'store-test' });
  assert.strictEqual(store.isChecked('a.js'), false);
  assert.strictEqual(store.markChecked('a.js'), true);
  assert.strictEqual(store.isChecked('a.js'), true);
  assert.ok(fs.existsSync(path.join(dir, 'state-store-test.json')));

  store.resetStateFile();
  store.getStateFile({ session_id: 'other-session' });
  assert.strictEqual(store.isChecked('a.js'), false);
});

test('store drops expired state', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'state-old.json'), JSON.stringify({ checked: ['a.js'], last_active: Date.now() - SESSION_TIMEOUT_MS - 1000 }));
  const store = createStateStore(dir);
  store.getStateFile({ session_id: 'old' });
  assert.strictEqual(store.isChecked('a.js'), false);
});

test('pruneStaleFiles removes only old state files', () => {
  const dir = tmpDir();
  const stale = path.join(dir, 'state-stale.json');
  const fresh = path.join(dir, 'state-fresh.json');
  const other = path.join(dir, 'notes.txt');
  for (const f of [stale, fresh, other]) fs.writeFileSync(f, '{}');
  const old = (Date.now() - SESSION_TIMEOUT_MS * 3) / 1000;
  fs.utimesSync(stale, old, old);
  fs.utimesSync(other, old, old);
  createStateStore(dir).pruneStaleFiles();
  assert.strictEqual(fs.existsSync(stale), false);
  assert.strictEqual(fs.existsSync(fresh), true);
  assert.strictEqual(fs.existsSync(other), true);
});

test('saveState returns false when the state dir cannot be created', () => {
  const dir = tmpDir();
  const blocker = path.join(dir, 'file');
  fs.writeFileSync(blocker, 'x');
  const store = createStateStore(path.join(blocker, 'sub'));
  store.getStateFile({ session_id: 's' });
  assert.strictEqual(store.markChecked('a.js'), false);
});

for (const dir of tmpDirs) fs.rmSync(dir, { recursive: true, force: true });

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
