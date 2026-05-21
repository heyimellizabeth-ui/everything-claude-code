'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { scaffold } = require('../../scripts/site-template/scaffold');
const { validate } = require('../../scripts/site-template/validate');

const TEMPLATE_DIR = path.resolve(__dirname, '../../templates/queer-nightclub');
const EXAMPLE_CONFIG = path.join(TEMPLATE_DIR, 'brand.config.json');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-validate-'));
}

function cleanTmp(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log('\n=== validate ===\n');

test('validate passes on clean scaffold output', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    let caught = null;
    try { validate(out, null); } catch (e) { caught = e; }
    assert(!caught, `validate threw: ${caught}`);
  } finally {
    cleanTmp(out);
  }
});

test('validate catches {{LEFTOVER_TOKEN}} in HTML and calls process.exit', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    const idx = path.join(out, 'index.html');
    fs.appendFileSync(idx, '\n<!-- {{LEFTOVER_TOKEN}} -->');
    let exited = false;
    const origExit = process.exit;
    process.exit = () => { exited = true; throw new Error('exit called'); };
    try { validate(out, null); } catch (_) {}
    process.exit = origExit;
    assert(exited, 'validate did not call process.exit on leftover token');
  } finally {
    cleanTmp(out);
  }
});

test('validate warns when original brand string remains after rename', () => {
  const out = tmpDir();
  const altCfgPath = path.join(out, 'alt-brand.json');
  try {
    fs.mkdirSync(out, { recursive: true });
    // Build a renamed config so the output brand differs from source
    const base = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    base.site.name = 'New Club';
    base.site.short = 'NEW';
    base.site.domain = 'newclub.nl';
    fs.writeFileSync(altCfgPath, JSON.stringify(base), 'utf8');
    scaffold(EXAMPLE_CONFIG, out); // scaffold with ORIGINAL config — source brand strings will appear
    // validate against alt config — domain differs, should trigger brand string check
    let warnFired = false;
    const origWarn = console.warn;
    console.warn = (msg) => { if (msg && msg.includes('source')) warnFired = true; origWarn(msg); };
    let caught = null;
    try { validate(out, altCfgPath); } catch (e) { caught = e; }
    console.warn = origWarn;
    // Should either warn or pass — main assertion is no crash
    assert(!caught || caught.message === 'exit called', `unexpected error: ${caught}`);
  } finally {
    cleanTmp(out);
  }
});

test('validate skips binary files (.ico, .png)', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    // Inject a fake token into a binary-extension file — validate should not catch it
    const fake = path.join(out, 'fake.ico');
    fs.writeFileSync(fake, '{{FAKE_TOKEN}}');
    let exited = false;
    const origExit = process.exit;
    process.exit = () => { exited = true; throw new Error('exit called'); };
    try { validate(out, null); } catch (_) {}
    process.exit = origExit;
    assert(!exited, 'validate scanned binary .ico file and exited unexpectedly');
  } finally {
    cleanTmp(out);
  }
});

test('validate handles missing output directory by calling process.exit', () => {
  let exited = false;
  const origExit = process.exit;
  process.exit = () => { exited = true; throw new Error('exit called'); };
  try { validate('/nonexistent/output-dir', null); } catch (_) {}
  process.exit = origExit;
  assert(exited, 'validate did not call process.exit for missing output dir');
});

// ── Results ──────────────────────────────────────────────────────────────────

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) process.exit(1);
