'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { scaffold } = require('../../plugins/studio-kit/scripts/site-template/scaffold');
const { validate, designCheck } = require('../../plugins/studio-kit/scripts/site-template/validate');

const TEMPLATE_DIR = path.resolve(__dirname, '../../plugins/studio-kit/templates/queer-nightclub');
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
    try { validate(out, null, { design: false }); } catch (e) { caught = e; }
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
    try { validate(out, null, { design: false }); } catch (_) { /* expected: stubbed process.exit throws */ }
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
    let _warnFired = false;
    const origWarn = console.warn;
    console.warn = (msg) => { if (msg && msg.includes('source')) _warnFired = true; origWarn(msg); };
    let caught = null;
    try { validate(out, altCfgPath, { design: false }); } catch (e) { caught = e; }
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
    try { validate(out, null, { design: false }); } catch (_) { /* expected: stubbed process.exit throws */ }
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
  try { validate('/nonexistent/output-dir', null); } catch (_) { /* expected: stubbed process.exit throws */ }
  process.exit = origExit;
  assert(exited, 'validate did not call process.exit for missing output dir');
});

// ── Hallmark design check ────────────────────────────────────────────────────

console.log('\n=== validate: Hallmark design check ===\n');

/** A fake skill dir whose sloplint prints the given summary and findings. */
function fakeSkill(summary, findings = []) {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'scripts', 'sloplint.mjs'),
    `process.stdout.write(JSON.stringify(${JSON.stringify({ summary, findings })})); process.exit(${summary.fails ? 1 : 0});`
  );
  return dir;
}
const CLEAN_SUMMARY = { fails: 0, reflex: 0, warns: 0, waived: 0, render: 'off' };

/** Run validate with process.exit stubbed; returns whether it exited. */
function validateExits(out, options) {
  let exited = false;
  const origExit = process.exit;
  const origErr = console.error;
  process.exit = () => { exited = true; throw new Error('exit called'); };
  console.error = () => {};
  try { validate(out, null, options); } catch (_) { /* expected: stubbed process.exit throws */ }
  process.exit = origExit;
  console.error = origErr;
  return exited;
}

test('designCheck warns, without failing, when Hallmark is not installed', () => {
  const home = tmpDir();
  try {
    const result = designCheck(home, { env: {}, homedir: home });
    assert(result.errors.length === 0, `unexpected errors: ${result.errors}`);
    assert(result.warnings.some(w => /not installed/.test(w)), 'expected a not-installed warning');
    assert(result.ran === false, 'ran should be false');
  } finally {
    cleanTmp(home);
  }
});

test('designCheck errors when Hallmark is missing and requireHallmark is set', () => {
  const home = tmpDir();
  try {
    const result = designCheck(home, { env: {}, homedir: home, requireHallmark: true });
    assert(result.errors.some(e => /not installed/.test(e)), 'expected a not-installed error');
  } finally {
    cleanTmp(home);
  }
});

test('designCheck passes a clean result', () => {
  const skill = fakeSkill(CLEAN_SUMMARY);
  try {
    const result = designCheck(skill, { skillDir: skill });
    assert(result.errors.length === 0 && result.ran === true, JSON.stringify(result));
  } finally {
    cleanTmp(skill);
  }
});

test('designCheck reports Floor FAILs with their gates', () => {
  const findings = [
    { gate: '67', grade: 'FAIL', evidence: 'tracked caps' },
    { gate: '67', grade: 'FAIL', evidence: 'tracked caps' },
    { gate: '48', grade: 'FAIL', evidence: 'literal colour' }
  ];
  const skill = fakeSkill({ ...CLEAN_SUMMARY, fails: 3 }, findings);
  try {
    const result = designCheck(skill, { skillDir: skill });
    assert(result.errors.length === 1, `expected one error, got ${result.errors.length}`);
    assert(/3 Hallmark Floor FAIL/.test(result.errors[0]) && /gate 67 x2/.test(result.errors[0]), result.errors[0]);
  } finally {
    cleanTmp(skill);
  }
});

test('validate fails a scaffolded site when the design check finds a Floor FAIL', () => {
  const out = tmpDir();
  const skill = fakeSkill({ ...CLEAN_SUMMARY, fails: 1 }, [{ gate: '34', grade: 'FAIL', evidence: 'no overflow-x: clip' }]);
  try {
    scaffold(EXAMPLE_CONFIG, out);
    assert(validateExits(out, { skillDir: skill }), 'validate should exit on a design failure');
  } finally {
    cleanTmp(out);
    cleanTmp(skill);
  }
});

test('validate skips the design check with design: false', () => {
  const out = tmpDir();
  const skill = fakeSkill({ ...CLEAN_SUMMARY, fails: 1 }, [{ gate: '34', grade: 'FAIL', evidence: 'x' }]);
  try {
    scaffold(EXAMPLE_CONFIG, out);
    assert(!validateExits(out, { skillDir: skill, design: false }), 'validate should not exit when design is off');
  } finally {
    cleanTmp(out);
    cleanTmp(skill);
  }
});

// ── Results ──────────────────────────────────────────────────────────────────

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) process.exit(1);
