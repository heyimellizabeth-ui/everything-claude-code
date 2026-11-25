/**
 * Tests for plugins/studio-kit/skills/static-site-release/scripts/release-check.js
 * (structure and diff modes; the live mode needs the network and is checked by hand).
 *
 * Run with: node tests/skills/static-site-release.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.resolve(__dirname, '../../plugins/studio-kit/skills/static-site-release/scripts/release-check.js');

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

/** Write a small site into a fresh temp folder: { 'index.html': '...', 'css/style-v1.css': '...' } */
function makeSite(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ssr-test-'));
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.join(dir, path.dirname(rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), body);
  }
  return dir;
}

function run(args) {
  const r = spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

const page = '<link rel="stylesheet" href="css/style-v1.css"><script src="js/main.js"></script>';
const baseSite = {
  'index.html': page,
  'about.html': page,
  'css/style-v1.css': 'body{color:red}',
  'js/main.js': 'console.info(1)'
};

console.log('\n=== Testing static-site-release/release-check.js ===\n');

test('structure passes a site with index.html at the top and working references', () => {
  const r = run(['structure', makeSite(baseSite)]);
  assert.strictEqual(r.status, 0, r.out);
  assert.ok(/OK\s+index\.html is at the top/.test(r.out), r.out);
});

test('structure flags a zip that wraps the site in a folder', () => {
  const site = makeSite(Object.fromEntries(Object.entries(baseSite).map(([k, v]) => [`site/${k}`, v])));
  const zip = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ssr-zip-')), 'release.zip');
  const z = spawnSync('zip', ['-qr', zip, 'site'], { cwd: site });
  if (z.error) {
    console.log('    (zip not installed, checking the folder form instead)');
    const r = run(['structure', site]);
    assert.strictEqual(r.status, 1, r.out);
    assert.ok(/wraps the site in a "site\/" folder/.test(r.out), r.out);
    return;
  }
  const r = run(['structure', zip]);
  assert.strictEqual(r.status, 1, r.out);
  assert.ok(/wraps the site in a "site\/" folder/.test(r.out), r.out);
});

test('structure reports a reference to a file that is not in the release', () => {
  const r = run(['structure', makeSite({ ...baseSite, 'contact.html': '<img src="img/missing.jpg">' })]);
  assert.strictEqual(r.status, 1, r.out);
  assert.ok(/broken local reference: contact\.html -> img\/missing\.jpg/.test(r.out), r.out);
});

test('diff fails when a cached asset changed but kept its name', () => {
  const r = run(['diff', makeSite(baseSite), makeSite({ ...baseSite, 'js/main.js': 'console.info(2)' })]);
  assert.strictEqual(r.status, 1, r.out);
  assert.ok(/ERROR\s+js\/main\.js changed but kept its name/.test(r.out), r.out);
});

test('diff accepts a renamed asset and lists the old file for deletion', () => {
  const next = { ...baseSite, 'css/style-v2.css': 'body{color:blue}' };
  delete next['css/style-v1.css'];
  next['index.html'] = page.replace('style-v1', 'style-v2');
  next['about.html'] = next['index.html'];
  const r = run(['diff', makeSite(baseSite), makeSite(next)]);
  assert.strictEqual(r.status, 0, r.out);
  assert.ok(/Delete from the server after uploading \(1\):\n\s+- css\/style-v1\.css/.test(r.out), r.out);
  assert.ok(/Added \(1\): css\/style-v2\.css/.test(r.out), r.out);
});

test('diff allows HTML edits in place (pages are not cached)', () => {
  const r = run(['diff', makeSite(baseSite), makeSite({ ...baseSite, 'about.html': `${page}<p>new</p>` })]);
  assert.strictEqual(r.status, 0, r.out);
  assert.ok(/Changed \(1\): about\.html/.test(r.out), r.out);
});

test('bad usage exits 2 with a usage line', () => {
  const r = run(['nonsense']);
  assert.strictEqual(r.status, 2, r.out);
  assert.ok(/usage:/.test(r.out), r.out);
});

console.log('\n=== Test Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);
process.exit(failed > 0 ? 1 : 0);
