/**
 * RECC contract tests: keep ECC's reverse-engineering layer aligned with the
 * pinned REA (rea-agents) release.
 *
 * Fails when an RE agent/skill/command names a REA tool or prompt that the
 * pinned catalog snapshot does not contain, or when the pin, the catalog
 * snapshot, and the vendored REA skill disagree on the version.
 *
 * To bump REA: node scripts/sync-rea.js --version <x.y.z> --from <rea-package-or-checkout>
 *
 * Run with: node tests/ci/recc-contract.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { extractReaToolRefs, findUnknownReaRefs, getReaPin } = require('../../scripts/lib/rea-sync');
const { resolveInstallPlan } = require('../../scripts/lib/install-manifests');

const ROOT = path.join(__dirname, '..', '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const catalog = readJson('mcp-configs/rea-tool-catalog.json');
const mcpConfig = readJson('mcp-configs/mcp-servers.json');

// Backticked snake_case names in RECC docs that are not REA tools or prompts.
const NON_TOOL_IDENTIFIERS = new Set(['session_id', 'evidence_ids', 'claude_code']);
const SNAKE_CASE_IN_BACKTICKS = /`([a-z][a-z0-9]*(?:_[a-z0-9]+)+)`/g;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function reccFiles() {
  const files = [];
  for (const dir of ['agents', 'commands']) {
    for (const name of fs.readdirSync(path.join(ROOT, dir))) {
      if (name.startsWith('re-') && name.endsWith('.md')) files.push(path.join(dir, name));
    }
  }
  for (const name of fs.readdirSync(path.join(ROOT, 'skills'))) {
    if (name.startsWith('re-')) files.push(path.join('skills', name, 'SKILL.md'));
  }
  return files;
}

function runTests() {
  console.log('\n=== Testing RECC contract with REA ===\n');

  let passed = 0;
  let failed = 0;
  const pin = getReaPin(mcpConfig);

  if (test('mcp-servers.json pins rea-agents to an exact version', () => {
    assert.ok(pin, 'rea server entry with rea-agents@<version> is required');
    assert.match(pin, /^\d+\.\d+\.\d+/);
    assert.deepStrictEqual(mcpConfig.mcpServers.rea.args, ['-y', `rea-agents@${pin}`, 'mcp']);
  })) passed++; else failed++;

  if (test('catalog snapshot matches the pinned version', () => {
    assert.strictEqual(catalog.package, 'rea-agents');
    assert.strictEqual(catalog.version, pin);
    assert.ok(catalog.tools.length > 0 && catalog.prompts.length > 0);
  })) passed++; else failed++;

  if (test('vendored reverse-engineer-anything skill matches the pinned version', () => {
    const skill = fs.readFileSync(path.join(ROOT, 'skills', 'reverse-engineer-anything', 'SKILL.md'), 'utf8');
    // Windows checkouts may use CRLF line endings.
    const origins = skill.split(/\r?\n/).filter(line => line.startsWith('origin:'));
    assert.deepStrictEqual(origins, [`origin: rea@${pin}`]);
  })) passed++; else failed++;

  if (test('RECC agents, skills, and commands exist', () => {
    const files = reccFiles();
    assert.ok(files.length >= 13, `expected at least 13 RECC files, found ${files.length}`);
  })) passed++; else failed++;

  if (test('every mcp__rea__ reference exists in the pinned REA catalog', () => {
    const problems = [];
    for (const file of reccFiles()) {
      const unknown = findUnknownReaRefs(extractReaToolRefs(fs.readFileSync(path.join(ROOT, file), 'utf8')), catalog);
      if (unknown.length) problems.push(`${file}: ${unknown.join(', ')}`);
    }
    assert.deepStrictEqual(problems, []);
  })) passed++; else failed++;

  if (test('backticked REA tool and prompt names exist in the pinned catalog', () => {
    const known = new Set([...catalog.tools, ...catalog.prompts]);
    const problems = [];
    for (const file of reccFiles()) {
      const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
      for (const match of text.matchAll(SNAKE_CASE_IN_BACKTICKS)) {
        if (!known.has(match[1]) && !NON_TOOL_IDENTIFIERS.has(match[1])) problems.push(`${file}: ${match[1]}`);
      }
    }
    assert.deepStrictEqual([...new Set(problems)], []);
  })) passed++; else failed++;

  if (test('recc profile resolves and includes the reverse-engineering module', () => {
    const plan = resolveInstallPlan({ profileId: 'recc', target: 'claude', projectRoot: ROOT });
    assert.ok(plan.selectedModuleIds.includes('reverse-engineering'));
    assert.ok(plan.selectedModuleIds.includes('security'));
    assert.ok(plan.selectedModuleIds.includes('hooks-runtime'), 'evidence-log hooks need the hook runtime');
  })) passed++; else failed++;

  if (test('reverse-engineering module paths exist', () => {
    const modules = readJson('manifests/install-modules.json').modules;
    const mod = modules.find(entry => entry.id === 'reverse-engineering');
    assert.ok(mod, 'reverse-engineering module is missing');
    for (const rel of mod.paths) {
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `missing path: ${rel}`);
    }
  })) passed++; else failed++;

  if (test('RECC hooks are registered and opt-in scoped', () => {
    const hooks = readJson('hooks/hooks.json').hooks;
    const post = hooks.PostToolUse.find(entry => entry.id === 'post:recc-evidence-log');
    const stop = hooks.Stop.find(entry => entry.id === 'stop:recc-unknowns-reminder');
    assert.ok(post && stop, 'both RECC hooks must be registered');
    assert.strictEqual(post.matcher, 'mcp__rea__.*');
    assert.ok(post.hooks[0].command.includes('scripts/hooks/recc-evidence.js'));
    assert.ok(stop.hooks[0].command.includes('scripts/hooks/recc-evidence.js'));
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
