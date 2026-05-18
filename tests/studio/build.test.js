/**
 * Tests for scripts/studio/build.js
 *
 * Run with: node tests/studio/build.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

const { build, classifySnippet } = require('../../scripts/studio/build');

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

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
    const full = path.join(p, entry.name);
    if (entry.isDirectory()) rmrf(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(p);
}

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// ── classifySnippet ──────────────────────────────────────────────────────────

console.log('=== classifySnippet ===\n');

test('splits CSS marker out of mixed snippet', () => {
  const { css, js, html } = classifySnippet('<div></div>\n/* CSS */\n.foo{color:red}');
  assert.strictEqual(html.length, 1);
  assert.ok(html[0].includes('<div>'));
  assert.strictEqual(css.length, 1);
  assert.ok(css[0].includes('.foo'));
});

test('splits JS marker out', () => {
  const { js } = classifySnippet('// JS\nconst x = 1;');
  assert.strictEqual(js.length, 1);
  assert.ok(js[0].includes('const x'));
});

test('detects CSS-only snippet by shape', () => {
  const { css, js, html } = classifySnippet(':root{--accent:#E8415A;}');
  assert.strictEqual(css.length, 1);
  assert.strictEqual(js.length, 0);
  assert.strictEqual(html.length, 0);
});

test('detects JS-only snippet by shape', () => {
  const { js, html } = classifySnippet('const cursor = document.getElementById("c");');
  assert.strictEqual(js.length, 1);
  assert.strictEqual(html.length, 0);
});

// ── build end-to-end ─────────────────────────────────────────────────────────

console.log('\n=== build (end-to-end) ===\n');

const tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-build-'));
const tmpSel = path.join(os.tmpdir(), `studio-sel-${Date.now()}.json`);

const fixtureSelection = {
  generated: new Date().toISOString(),
  brand: {
    site: {
      name: 'Test Site', short: 'TEST', domain: 'test.com',
      tagline: 'Just a test', description: 'Smoke test site',
      lang: 'en', locale: 'en_US', estYear: '2026', bpm: '120 BPM'
    },
    colors: { void: '#0D0D0D', cream: '#F5F0E8', accent: '#FF00AA', surface: '#1A1A1A', muted: '#888888' },
    venue: { name: 'Test Venue', city: 'Test City', region: 'Test Region', country: 'NL' },
    social: { instagram: 'https://instagram.com/test', ra: 'https://ra.co/test' },
    forms: { backend: 'formspree', newsletterKey: 'k1', contactKey: 'k2', recipientEmail: 'hi@test.com' },
    ticketUrl: 'https://tickets.test.com'
  },
  baseTemplate: 'queer-nightclub',
  frameworks: ['mil'],
  components: [
    { id: 'fake-css', name: 'Fake CSS Block', category: 'colors', source: 'club-kudt', framework: 'mil',
      snippet: ':root { --my-test-var: hotpink; }', previewHtml: '' },
    { id: 'fake-js', name: 'Fake JS', category: 'interactive', source: 'club-kudt', framework: 'mil',
      snippet: '// JS\nwindow.__studioBuildTest = true;', previewHtml: '' }
  ]
};
fs.writeFileSync(tmpSel, JSON.stringify(fixtureSelection));

test('build runs and writes index.html', () => {
  build(tmpSel, tmpOut);
  assert.ok(fs.existsSync(path.join(tmpOut, 'index.html')), 'index.html should exist');
});

test('build writes studio-additions.css with selected snippet content', () => {
  const css = fs.readFileSync(path.join(tmpOut, 'studio-additions.css'), 'utf8');
  assert.ok(css.includes('--my-test-var: hotpink'), 'CSS additions should include selected snippet content');
  assert.ok(css.includes('Fake CSS Block'), 'CSS additions should include component header');
});

test('build writes studio-additions.js with selected snippet content', () => {
  const js = fs.readFileSync(path.join(tmpOut, 'studio-additions.js'), 'utf8');
  assert.ok(js.includes('__studioBuildTest'), 'JS additions should include selected snippet content');
});

test('index.html has link tag for additions CSS', () => {
  const html = fs.readFileSync(path.join(tmpOut, 'index.html'), 'utf8');
  assert.ok(html.includes('studio-additions.css'), 'index.html should link studio-additions.css');
  assert.ok(html.includes('studio-additions.js'), 'index.html should link studio-additions.js');
});

test('brand tokens substituted (accent color reaches the output)', () => {
  const html = fs.readFileSync(path.join(tmpOut, 'index.html'), 'utf8');
  assert.ok(html.includes('#FF00AA') || html.includes('FF00AA'), 'accent token should reach the scaffolded HTML');
});

test('studio-selection.json copied into output', () => {
  assert.ok(fs.existsSync(path.join(tmpOut, 'studio-selection.json')), 'selection.json should be copied as studio-selection.json');
});

test('re-running build is idempotent (no duplicate link tags)', () => {
  build(tmpSel, tmpOut);
  const html = fs.readFileSync(path.join(tmpOut, 'index.html'), 'utf8');
  const cssLinkCount = (html.match(/studio-additions\.css/g) || []).length;
  const jsScriptCount = (html.match(/studio-additions\.js/g) || []).length;
  assert.strictEqual(cssLinkCount, 1, 'CSS link should appear exactly once');
  assert.strictEqual(jsScriptCount, 1, 'JS script tag should appear exactly once');
});

// Cleanup
try { rmrf(tmpOut); fs.unlinkSync(tmpSel); } catch {}

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);
process.exit(failed > 0 ? 1 : 0);
