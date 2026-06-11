/**
 * Tests for scripts/hooks/claude-mem.js
 *
 * Verifies the claude-mem bridge resolves the plugin root, forwards hook
 * payloads to the worker, and no-ops gracefully when claude-mem is absent.
 *
 * Run with: node tests/hooks/claude-mem.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { run, resolveClaudeMemRoot, ACTIONS } = require('../../scripts/hooks/claude-mem.js');

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

function makeTempConfigDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-claude-mem-'));
}

function installFakePlugin(configDir) {
  const pluginScripts = path.join(
    configDir, 'plugins', 'marketplaces', 'thedotmack', 'plugin', 'scripts'
  );
  fs.mkdirSync(pluginScripts, { recursive: true });
  // Fake bun-runner echoes its CLI args as JSON so tests can assert routing.
  fs.writeFileSync(
    path.join(pluginScripts, 'bun-runner.js'),
    'console.log(JSON.stringify(process.argv.slice(2)));\n'
  );
  fs.writeFileSync(path.join(pluginScripts, 'worker-service.cjs'), '// stub\n');
  return path.join(configDir, 'plugins', 'marketplaces', 'thedotmack', 'plugin');
}

function withConfigDir(configDir, fn) {
  const previous = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = configDir;
  try {
    return fn();
  } finally {
    if (previous === undefined) delete process.env.CLAUDE_CONFIG_DIR;
    else process.env.CLAUDE_CONFIG_DIR = previous;
  }
}

function runTests() {
  console.log('\n=== Testing claude-mem.js ===\n');

  let passed = 0;
  let failed = 0;

  console.log('Plugin resolution:');

  if (test('returns null when claude-mem is not installed', () => {
    const dir = makeTempConfigDir();
    withConfigDir(dir, () => {
      assert.strictEqual(resolveClaudeMemRoot(), null);
    });
  })) passed++; else failed++;

  if (test('finds the marketplace plugin root when scripts exist', () => {
    const dir = makeTempConfigDir();
    const expected = installFakePlugin(dir);
    withConfigDir(dir, () => {
      assert.strictEqual(resolveClaudeMemRoot(), expected);
    });
  })) passed++; else failed++;

  console.log('\nrun() behavior:');

  if (test('exits 0 silently when claude-mem is not installed', () => {
    const dir = makeTempConfigDir();
    withConfigDir(dir, () => {
      const result = run('{}', { hookId: 'post:claude-mem-observation' });
      assert.strictEqual(result.exitCode, 0);
      assert.ok(!result.stdout, 'should not emit stdout');
      assert.ok(!result.stderr, 'should not emit stderr');
    });
  })) passed++; else failed++;

  if (test('exits 0 with stderr note on unknown hook id', () => {
    const result = run('{}', { hookId: 'not:a-real-hook' });
    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.stderr.includes('[ClaudeMem]'));
  })) passed++; else failed++;

  if (test('forwards observation hook to the worker and captures stdout', () => {
    const dir = makeTempConfigDir();
    installFakePlugin(dir);
    withConfigDir(dir, () => {
      const result = run('{"tool_name":"Read"}', { hookId: 'post:claude-mem-observation' });
      assert.strictEqual(result.exitCode, 0);
      const argv = JSON.parse(result.stdout);
      assert.ok(argv[0].endsWith('worker-service.cjs'));
      assert.deepStrictEqual(argv.slice(1), ['hook', 'claude-code', 'observation']);
    });
  })) passed++; else failed++;

  if (test('session start runs worker start then captures context output only', () => {
    const dir = makeTempConfigDir();
    installFakePlugin(dir);
    withConfigDir(dir, () => {
      const result = run('{}', { hookId: 'session:claude-mem' });
      assert.strictEqual(result.exitCode, 0);
      const argv = JSON.parse(result.stdout);
      assert.deepStrictEqual(argv.slice(1), ['hook', 'claude-code', 'context']);
    });
  })) passed++; else failed++;

  console.log('\nhooks.json wiring:');

  if (test('all claude-mem hook ids in hooks.json have an action mapping', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
    const wired = [];
    for (const hookArray of Object.values(hooks.hooks)) {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.command && hook.command.includes('scripts/hooks/claude-mem.js')) {
            const match = hook.command.match(/run-with-flags\.js (\S+) scripts\/hooks\/claude-mem\.js/);
            assert.ok(match, 'claude-mem hook should be routed through run-with-flags.js');
            wired.push(match[1]);
          }
        }
      }
    }
    assert.deepStrictEqual(wired.sort(), Object.keys(ACTIONS).sort());
  })) passed++; else failed++;

  console.log(`\n=== Test Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
