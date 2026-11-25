/**
 * Coverage for scripts/ci/build-capabilities.js.
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { buildCapabilities, parseArgs, parseFrontmatter } = require('../../scripts/ci/build-capabilities');

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

function write(root, rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function withFixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-capabilities-'));
  try {
    write(root, 'skills/c1/SKILL.md', '---\nname: c1\ndescription: Web chain 1\n---\n\n```\n/prp-prd   spec\n/design-gate   gate\n```\n');
    write(root, 'skills/design-gate/SKILL.md', '---\nname: design-gate\ndescription: >\n  Lint a page\n  and block\n---\n');
    write(root, '.kiro/skills/design-gate/SKILL.md', '---\nname: design-gate\ndescription: mirror\n---\n');
    write(root, 'docs/zh-CN/skills/design-gate/SKILL.md', '---\nname: design-gate\ndescription: translation\n---\n');
    write(root, 'agents/planner.md', '---\nname: planner\ndescription: Plans work\n---\n');
    write(root, 'commands/plan.md', '---\ndescription: Plan first\n---\n');
    write(root, 'hooks/hooks.json', JSON.stringify({ hooks: { Stop: [{ id: 'stop:notify', description: 'Notify', hooks: [] }] } }));
    write(root, 'mcp-configs/mcp-servers.json', JSON.stringify({ mcpServers: { github: { description: 'GitHub' }, exa: { description: 'Search' } } }));
    write(root, '.mcp.json', JSON.stringify({ mcpServers: { github: {}, exa: {} } }));
    write(root, '.claude/settings.json', JSON.stringify({ disabledMcpjsonServers: ['exa'] }));
    write(root, 'plugins/tracker/.claude-plugin/plugin.json', JSON.stringify({ name: 'tracker', description: 'A mod' }));
    write(root, 'plugins/tracker/hooks/hooks.json', '{}');
    fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const byName = (result, kind, name) => result.capabilities.find(e => e.kind === kind && e.name === name);

function runTests() {
  console.log('\n=== Testing build-capabilities.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('lists each kind once, skipping translations and harness mirrors', () => {
    withFixture(root => {
      const result = buildCapabilities({ root });
      const kinds = result.capabilities.map(e => `${e.kind}:${e.name}`).sort();
      assert.deepStrictEqual(kinds, [
        'agent:planner', 'command:plan', 'hook:stop:notify', 'mcp:exa', 'mcp:github', 'mod:tracker', 'skill:c1', 'skill:design-gate',
      ]);
      assert.strictEqual(byName(result, 'skill', 'design-gate').path, 'skills/design-gate/SKILL.md');
      assert.strictEqual(byName(result, 'skill', 'design-gate').description, 'Lint a page and block');
      assert.strictEqual(byName(result, 'agent', 'planner').invoke, '@planner');
    });
  })) passed++; else failed++;

  if (test('marks chain steps with their chains and MCP servers by whether they are on', () => {
    withFixture(root => {
      const result = buildCapabilities({ root });
      assert.deepStrictEqual(byName(result, 'skill', 'design-gate').chains, ['c1']);
      assert.deepStrictEqual(byName(result, 'skill', 'c1').chains, ['c1']);
      assert.strictEqual(byName(result, 'mcp', 'github').status, 'active');
      assert.strictEqual(byName(result, 'mcp', 'exa').status, 'available');
    });
  })) passed++; else failed++;

  if (test('keeps design fields and entries of repositories not scanned', () => {
    withFixture(root => {
      const first = buildCapabilities({ root });
      const gate = byName(first, 'skill', 'design-gate');
      gate.stage = 'review';
      gate.scores = { use: 5, uniq: 4, qual: 4, ease: 3, fit: 5 };
      first.capabilities.push({ id: 'taste-skill:skills/x/SKILL.md', kind: 'skill', name: 'x', repo: 'taste-skill', useWhen: 'kept' });
      const second = buildCapabilities({ root, previous: first });
      assert.strictEqual(byName(second, 'skill', 'design-gate').stage, 'review');
      assert.strictEqual(byName(second, 'skill', 'design-gate').scores.use, 5);
      assert.strictEqual(byName(second, 'skill', 'x').useWhen, 'kept');
      const planner = byName(first, 'agent', 'planner');
      planner.chains = ['c2'];
      byName(first, 'skill', 'design-gate').chains = ['c9'];
      const third = buildCapabilities({ root, previous: first });
      assert.deepStrictEqual(byName(third, 'agent', 'planner').chains, ['c2']);
      assert.deepStrictEqual(byName(third, 'skill', 'design-gate').chains, ['c1']);
    });
  })) passed++; else failed++;

  if (test('parses --repo name=path pairs and flags', () => {
    const args = parseArgs(['--write', '--repo', 'rea=/tmp/rea']);
    assert.strictEqual(args.write, true);
    assert.strictEqual(args.repos.rea, path.resolve('/tmp/rea'));
    assert.deepStrictEqual(parseFrontmatter('no frontmatter'), {});
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
