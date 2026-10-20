/**
 * Tests for scripts/lib/rea-sync.js
 *
 * Run with: node tests/lib/rea-sync.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  annotateSkillOrigin,
  buildCatalogSnapshot,
  copySkillDir,
  extractReaToolRefs,
  findReaSkillDir,
  findUnknownReaRefs,
  getReaPin,
  isValidVersion,
  parseArgs,
  setReaPinInText
} = require('../../scripts/lib/rea-sync');

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

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rea-sync-test-'));
}

const SKILL_MD = '---\nname: reverse-engineer-anything\ndescription: Reverse engineer things.\nmetadata:\n  version: "42"\n---\n\n# REA\n\nBody.\n';

function runTests() {
  console.log('\n=== Testing rea-sync.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('isValidVersion accepts semver and rejects ranges or tags', () => {
    assert.strictEqual(isValidVersion('6.7.0'), true);
    assert.strictEqual(isValidVersion('6.8.0-rc.1'), true);
    assert.strictEqual(isValidVersion('latest'), false);
    assert.strictEqual(isValidVersion('^6.7.0'), false);
    assert.strictEqual(isValidVersion(undefined), false);
  })) passed++; else failed++;

  if (test('parseArgs reads flags and rejects unknown or invalid input', () => {
    assert.deepStrictEqual(parseArgs(['--version', '6.7.0', '--from', '../rea', '--no-catalog', '--dry-run']), {
      version: '6.7.0', from: '../rea', catalog: false, dryRun: true
    });
    assert.deepStrictEqual(parseArgs([]), { version: null, from: null, catalog: true, dryRun: false });
    assert.throws(() => parseArgs(['--bogus']), /Unknown argument/);
    assert.throws(() => parseArgs(['--version', 'latest']), /Invalid rea-agents version/);
  })) passed++; else failed++;

  if (test('getReaPin reads the pinned version from the rea server entry', () => {
    const config = { mcpServers: { rea: { command: 'npx', args: ['-y', 'rea-agents@6.7.0', 'mcp'] } } };
    assert.strictEqual(getReaPin(config), '6.7.0');
    assert.strictEqual(getReaPin({ mcpServers: {} }), null);
    assert.strictEqual(getReaPin({}), null);
  })) passed++; else failed++;

  if (test('setReaPinInText rewrites only the pin and preserves layout', () => {
    const text = '{\n  "mcpServers": {\n    "rea": {\n      "args": ["-y", "rea-agents@6.7.0", "mcp"]\n    }\n  }\n}\n';
    const next = setReaPinInText(text, '6.8.1');
    assert.strictEqual(next, text.replace('6.7.0', '6.8.1'));
    assert.strictEqual(getReaPin(JSON.parse(next)), '6.8.1');
  })) passed++; else failed++;

  if (test('setReaPinInText refuses missing, duplicate, or invalid pins', () => {
    assert.throws(() => setReaPinInText('{}', '6.7.0'), /found 0/);
    assert.throws(() => setReaPinInText('"rea-agents@1.0.0" "rea-agents@2.0.0"', '6.7.0'), /found 2/);
    assert.throws(() => setReaPinInText('"rea-agents@1.0.0"', 'latest'), /Invalid/);
  })) passed++; else failed++;

  if (test('annotateSkillOrigin adds origin after description and replaces an old one', () => {
    const once = annotateSkillOrigin(SKILL_MD, '6.7.0');
    assert.ok(once.includes('description: Reverse engineer things.\norigin: rea@6.7.0\nmetadata:'));
    const twice = annotateSkillOrigin(once, '6.8.0');
    assert.strictEqual((twice.match(/^origin:/gm) || []).length, 1);
    assert.ok(twice.includes('origin: rea@6.8.0'));
    assert.ok(twice.endsWith('# REA\n\nBody.\n'));
    assert.throws(() => annotateSkillOrigin('# no frontmatter', '6.7.0'), /frontmatter/);
  })) passed++; else failed++;

  if (test('findReaSkillDir supports npm package and source checkout layouts', () => {
    const pkgRoot = createTempDir();
    const srcRoot = createTempDir();
    try {
      fs.mkdirSync(path.join(pkgRoot, 'skills', 'reverse-engineer-anything'), { recursive: true });
      fs.writeFileSync(path.join(pkgRoot, 'skills', 'reverse-engineer-anything', 'SKILL.md'), SKILL_MD);
      fs.mkdirSync(path.join(srcRoot, '.agents', 'skills', 'reverse-engineer-anything'), { recursive: true });
      fs.writeFileSync(path.join(srcRoot, '.agents', 'skills', 'reverse-engineer-anything', 'SKILL.md'), SKILL_MD);
      assert.strictEqual(findReaSkillDir(pkgRoot), path.join(pkgRoot, 'skills', 'reverse-engineer-anything'));
      assert.strictEqual(findReaSkillDir(srcRoot), path.join(srcRoot, '.agents', 'skills', 'reverse-engineer-anything'));
      assert.strictEqual(findReaSkillDir(createTempDir()), null);
    } finally {
      fs.rmSync(pkgRoot, { recursive: true, force: true });
      fs.rmSync(srcRoot, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('copySkillDir replaces the destination and annotates origin', () => {
    const root = createTempDir();
    try {
      const src = path.join(root, 'src');
      const dest = path.join(root, 'dest');
      fs.mkdirSync(path.join(src, 'references'), { recursive: true });
      fs.writeFileSync(path.join(src, 'SKILL.md'), SKILL_MD);
      fs.writeFileSync(path.join(src, 'references', 'a.md'), 'A');
      fs.mkdirSync(dest, { recursive: true });
      fs.writeFileSync(path.join(dest, 'stale.md'), 'old');
      copySkillDir(src, dest, '6.7.0');
      assert.ok(!fs.existsSync(path.join(dest, 'stale.md')), 'stale files should be removed');
      assert.strictEqual(fs.readFileSync(path.join(dest, 'references', 'a.md'), 'utf8'), 'A');
      assert.ok(fs.readFileSync(path.join(dest, 'SKILL.md'), 'utf8').includes('origin: rea@6.7.0'));
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('buildCatalogSnapshot sorts and de-duplicates names', () => {
    const snapshot = buildCatalogSnapshot({ version: '6.7.0', tools: ['b', 'a', 'b', 42], prompts: ['z', 'y'] });
    assert.deepStrictEqual(snapshot, { package: 'rea-agents', version: '6.7.0', tools: ['a', 'b'], prompts: ['y', 'z'] });
    assert.throws(() => buildCatalogSnapshot({ version: 'latest', tools: [], prompts: [] }), /Invalid/);
  })) passed++; else failed++;

  if (test('extractReaToolRefs and findUnknownReaRefs detect catalog drift', () => {
    const refs = extractReaToolRefs('use `mcp__rea__open_binary` then mcp__rea__gone_tool and mcp__rea__open_binary');
    assert.deepStrictEqual([...refs].sort(), ['gone_tool', 'open_binary']);
    const catalog = { tools: ['open_binary'], prompts: ['investigate_feature'] };
    assert.deepStrictEqual(findUnknownReaRefs(refs, catalog), ['gone_tool']);
    assert.deepStrictEqual(findUnknownReaRefs(new Set(['investigate_feature']), catalog), []);
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
