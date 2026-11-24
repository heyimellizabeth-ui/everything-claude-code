/**
 * Tests for scripts/lib/gateguard/git-commands.js
 *
 * Run with: node tests/lib/gateguard-git-commands.test.js
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
  commandBasename,
  findGitSubcommand,
  isDestructiveGit,
  isReadOnlyGitIntrospection
} = require('../../scripts/lib/gateguard/git-commands');

const tok = s => s.split(/\s+/).filter(Boolean);

console.log('\n=== Testing gateguard/git-commands ===\n');

test('commandBasename strips paths, .exe and case', () => {
  assert.strictEqual(commandBasename('/usr/bin/git'), 'git');
  assert.strictEqual(commandBasename('C:\\Tools\\GIT.EXE'), 'git');
  assert.strictEqual(commandBasename(''), '');
});

test('findGitSubcommand skips global options', () => {
  assert.deepStrictEqual(findGitSubcommand(tok('git -C repo -c a=b status --short')), { command: 'status', rest: ['--short'] });
  assert.deepStrictEqual(findGitSubcommand(tok('git --git-dir=.git log')), { command: 'log', rest: [] });
  assert.strictEqual(findGitSubcommand(tok('npm test')), null);
});

test('isDestructiveGit flags hard resets, force pushes and amends', () => {
  for (const cmd of ['git reset --hard', 'git push --force', 'git push -f origin main', 'git push origin +main', 'git commit --amend', 'git clean -fd', 'git rm -r src', 'git switch -C topic', 'git checkout -- file.js']) {
    assert.strictEqual(isDestructiveGit(tok(cmd)), true, cmd);
  }
});

test('isDestructiveGit allows safe forms', () => {
  for (const cmd of ['git push --force-with-lease', 'git push --force-with-lease origin +main', 'git status', 'git commit -m msg', 'git switch main', 'git rm file.js']) {
    assert.strictEqual(isDestructiveGit(tok(cmd)), false, cmd);
  }
  assert.strictEqual(isDestructiveGit(tok('git push --force --force-if-includes')), true);
});

test('isReadOnlyGitIntrospection accepts only plain read-only forms', () => {
  for (const cmd of ['git status --short', 'git diff --name-only', 'git log --oneline --max-count=5', 'git show HEAD', 'git branch --show-current', 'git rev-parse --abbrev-ref HEAD']) {
    assert.strictEqual(isReadOnlyGitIntrospection(cmd), true, cmd);
  }
  for (const cmd of ['git status; rm -rf x', 'git push', 'git diff a b', 'git log -p', '', 'ls']) {
    assert.strictEqual(isReadOnlyGitIntrospection(cmd), false, cmd);
  }
});

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
