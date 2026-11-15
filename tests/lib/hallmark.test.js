/**
 * Tests for scripts/lib/hallmark.js and scripts/design-gate.js
 *
 * Run with: node tests/lib/hallmark.test.js
 *
 * Hallmark itself is optional, so these tests use a fake sloplint.mjs
 * written to a temp skill directory. One extra test runs against a real
 * install when one is present and is skipped otherwise.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const hallmark = require('../../scripts/lib/hallmark');
const designGate = require('../../scripts/design-gate');

const CLI = path.resolve(__dirname, '../../scripts/design-gate.js');

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

/** Create a fake skill dir whose sloplint prints the given summary. */
function makeFakeSkill(summary, findings = [], exitCode = 0) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-hallmark-'));
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  const body = [
    `const out = ${JSON.stringify({ summary, findings })};`,
    'out.argv = process.argv.slice(2);',
    'process.stdout.write(JSON.stringify(out));',
    `process.exit(${exitCode});`
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'scripts', 'sloplint.mjs'), body);
  return dir;
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

const CLEAN = { fails: 0, reflex: 0, warns: 0, waived: 0, render: 'off' };

function runTests() {
  console.log('\n=== Testing hallmark.js ===\n');
  let passed = 0;
  let failed = 0;
  const check = (name, fn) => (test(name, fn) ? passed++ : failed++);

  console.log('resolveSkillDir:');

  check('returns null when no skill is installed', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-home-'));
    try {
      assert.strictEqual(hallmark.resolveSkillDir({ env: {}, homedir: home }), null);
    } finally {
      cleanup(home);
    }
  });

  check('honours HALLMARK_SKILL_DIR', () => {
    const dir = makeFakeSkill(CLEAN);
    try {
      assert.strictEqual(hallmark.resolveSkillDir({ env: { HALLMARK_SKILL_DIR: dir }, homedir: os.tmpdir() }), dir);
    } finally {
      cleanup(dir);
    }
  });

  check('finds ~/.claude/skills/hallmark', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-home-'));
    const skill = path.join(home, '.claude', 'skills', 'hallmark');
    fs.mkdirSync(path.join(skill, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(skill, 'scripts', 'sloplint.mjs'), '');
    try {
      assert.strictEqual(hallmark.resolveSkillDir({ env: {}, homedir: home }), skill);
    } finally {
      cleanup(home);
    }
  });

  console.log('\nbuildArgs:');

  check('always asks for JSON and passes flags through', () => {
    const args = hallmark.buildArgs('site', { tier: 'floor', scope: 'app', genre: 'editorial', render: true, kept: true, urls: ['http://localhost:3000/'] });
    assert.deepStrictEqual(args, ['site', '--json', '--tier', 'floor', '--scope', 'app', '--genre', 'editorial', '--render', '--kept', '--url', 'http://localhost:3000/']);
  });

  check('rejects an unknown tier or scope', () => {
    assert.throws(() => hallmark.buildArgs('.', { tier: 'strict' }), /Unknown tier/);
    assert.throws(() => hallmark.buildArgs('.', { scope: 'page' }), /Unknown scope/);
  });

  console.log('\nparseSloplintOutput:');

  check('parses summary and findings', () => {
    const parsed = hallmark.parseSloplintOutput(JSON.stringify({ summary: CLEAN, findings: [] }));
    assert.strictEqual(parsed.summary.fails, 0);
  });

  check('returns null for non-JSON or the wrong shape', () => {
    assert.strictEqual(hallmark.parseSloplintOutput('unknown flag --nope'), null);
    assert.strictEqual(hallmark.parseSloplintOutput('{"summary": 1}'), null);
    assert.strictEqual(hallmark.parseSloplintOutput(''), null);
  });

  console.log('\nrunSloplint:');

  check('reports unavailable when the skill is missing', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-home-'));
    try {
      const result = hallmark.runSloplint('.', { env: {}, homedir: home });
      assert.strictEqual(result.available, false);
      assert.strictEqual(result.ok, false);
      assert.ok(/not found/.test(result.error));
    } finally {
      cleanup(home);
    }
  });

  check('reads findings even though sloplint exits 1', () => {
    const findings = [{ gate: '67', grade: 'FAIL', tier: 'floor', file: 'a.html', line: 3, evidence: 'tracked caps' }];
    const dir = makeFakeSkill({ ...CLEAN, fails: 1, reflex: 2 }, findings, 1);
    try {
      const result = hallmark.runSloplint('.', { skillDir: dir });
      assert.strictEqual(result.ok, true);
      assert.strictEqual(result.fails, 1);
      assert.strictEqual(result.reflex, 2);
      assert.strictEqual(result.findings.length, 1);
      assert.strictEqual(result.renderRan, false);
    } finally {
      cleanup(dir);
    }
  });

  check('detects that the render tier ran', () => {
    const dir = makeFakeSkill({ ...CLEAN, render: 'ran' });
    try {
      assert.strictEqual(hallmark.runSloplint('.', { skillDir: dir, render: true }).renderRan, true);
    } finally {
      cleanup(dir);
    }
  });

  check('returns an error when sloplint prints no JSON', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-hallmark-'));
    fs.mkdirSync(path.join(dir, 'scripts'));
    fs.writeFileSync(path.join(dir, 'scripts', 'sloplint.mjs'), 'console.error("boom"); process.exit(2);');
    try {
      const result = hallmark.runSloplint('.', { skillDir: dir });
      assert.strictEqual(result.available, true);
      assert.strictEqual(result.ok, false);
      assert.ok(/boom/.test(result.error));
    } finally {
      cleanup(dir);
    }
  });

  check('treats "not run: ..." as render not run, and keeps the reason', () => {
    const dir = makeFakeSkill({ ...CLEAN, render: 'not run: no puppeteer-core found locally, globally or via HALLMARK_PUPPETEER' });
    try {
      const result = hallmark.runSloplint('.', { skillDir: dir, render: true });
      assert.strictEqual(result.renderRan, false);
      assert.ok(/no puppeteer-core/.test(result.renderNote));
      const gate = hallmark.evaluateGate(result, { requireRender: true });
      assert.strictEqual(gate.pass, false);
      assert.ok(/no puppeteer-core/.test(gate.reasons.join(' ')));
      assert.ok(/NOT RUN/.test(hallmark.summarize(result)));
    } finally {
      cleanup(dir);
    }
  });

  check('a --before run records and never blocks on findings', () => {
    const dir = makeFakeSkill({ ...CLEAN, fails: 4, reflex: 2 });
    try {
      const result = hallmark.runSloplint('.', { skillDir: dir, before: true });
      assert.strictEqual(result.recording, true);
      assert.strictEqual(hallmark.evaluateGate(result).pass, true);
      assert.ok(/recorded for --kept/.test(hallmark.summarize(result)));
    } finally {
      cleanup(dir);
    }
  });

  check('--kept findings arrive as FAILs and block', () => {
    const findings = [{ gate: 'kept', grade: 'FAIL', tier: 'floor', file: 'index.html', line: 1, evidence: 'links the page had before and no longer has: rooms.html' }];
    const dir = makeFakeSkill({ ...CLEAN, fails: 1 }, findings, 1);
    try {
      const result = hallmark.runSloplint('.', { skillDir: dir, kept: true });
      assert.strictEqual(hallmark.evaluateGate(result).pass, false);
      assert.strictEqual(hallmark.topGates(result.findings)[0].gate, 'kept');
    } finally {
      cleanup(dir);
    }
  });

  console.log('\nevaluateGate and summarize:');

  const okResult = (over) => ({ available: true, ok: true, error: null, fails: 0, reflex: 0, warns: 0, waived: 0, renderRan: false, findings: [], ...over });

  check('passes a clean result', () => {
    assert.strictEqual(hallmark.evaluateGate(okResult()).pass, true);
  });

  check('blocks on any FAIL', () => {
    const gate = hallmark.evaluateGate(okResult({ fails: 3 }));
    assert.strictEqual(gate.pass, false);
    assert.ok(gate.reasons[0].includes('3 FAIL'));
  });

  check('blocks on open REFLEX except at the floor tier', () => {
    assert.strictEqual(hallmark.evaluateGate(okResult({ reflex: 1 })).pass, false);
    assert.strictEqual(hallmark.evaluateGate(okResult({ reflex: 1 }), { tier: 'floor' }).pass, true);
  });

  check('requireRender blocks a static-only run', () => {
    assert.strictEqual(hallmark.evaluateGate(okResult(), { requireRender: true }).pass, false);
    assert.strictEqual(hallmark.evaluateGate(okResult({ renderRan: true }), { requireRender: true }).pass, true);
  });

  check('summarize prints one line with render status', () => {
    assert.strictEqual(hallmark.summarize(okResult({ fails: 0, reflex: 2, waived: 1, warns: 4 })), 'Floor 0 FAIL · Reflex 2 (1 waived) · 4 WARN · render: skipped');
    assert.ok(/not installed/.test(hallmark.summarize({ available: false })));
  });

  check('topGates groups and sorts findings', () => {
    const top = hallmark.topGates([
      { gate: '48', grade: 'FAIL', evidence: 'a' },
      { gate: '67', grade: 'FAIL', evidence: 'b' },
      { gate: '67', grade: 'FAIL', evidence: 'c' }
    ]);
    assert.strictEqual(top[0].gate, '67');
    assert.strictEqual(top[0].count, 2);
  });

  console.log('\ndesign-gate CLI:');

  check('parseArgs defaults to the current directory', () => {
    assert.strictEqual(designGate.parseArgs([]).target, '.');
    assert.strictEqual(designGate.parseArgs(['--url', 'http://x/']).target, '');
    assert.throws(() => designGate.parseArgs(['--nope']), /Unknown flag/);
  });

  const runCli = (args, env) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });

  check('exits 0 on a clean page', () => {
    const dir = makeFakeSkill(CLEAN);
    try {
      const run = runCli(['.'], { HALLMARK_SKILL_DIR: dir });
      assert.strictEqual(run.status, 0, run.stdout + run.stderr);
      assert.ok(run.stdout.includes('PASS'));
    } finally {
      cleanup(dir);
    }
  });

  check('exits 1 when the gate fails', () => {
    const dir = makeFakeSkill({ ...CLEAN, fails: 2 }, [], 1);
    try {
      const run = runCli(['.'], { HALLMARK_SKILL_DIR: dir });
      assert.strictEqual(run.status, 1, run.stdout + run.stderr);
      assert.ok(run.stdout.includes('BLOCKED'));
    } finally {
      cleanup(dir);
    }
  });

  check('skips with exit 0 when Hallmark is missing, exits 1 with --require-hallmark', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-home-'));
    const env = { HALLMARK_SKILL_DIR: '', HOME: home, USERPROFILE: home };
    try {
      const soft = runCli(['.'], env);
      assert.strictEqual(soft.status, 0, soft.stdout + soft.stderr);
      assert.ok(soft.stdout.includes('SKIPPED'));
      assert.strictEqual(runCli(['.', '--require-hallmark'], env).status, 1);
    } finally {
      cleanup(home);
    }
  });

  check('a URL-only run says the source was not checked', () => {
    const dir = makeFakeSkill(CLEAN);
    try {
      const run = runCli(['--url', 'http://localhost:1/'], { HALLMARK_SKILL_DIR: dir });
      assert.strictEqual(run.status, 0, run.stdout + run.stderr);
      assert.ok(/only the running page was checked/.test(run.stdout));
      const both = runCli(['src', '--url', 'http://localhost:1/'], { HALLMARK_SKILL_DIR: dir });
      assert.ok(!/only the running page/.test(both.stdout));
    } finally {
      cleanup(dir);
    }
  });

  check('exits 2 on a bad flag', () => {
    assert.strictEqual(runCli(['--nope'], {}).status, 2);
  });

  console.log('\nReal Hallmark install (optional):');

  const realSkill = hallmark.resolveSkillDir();
  if (!realSkill) {
    console.log('  - skipped: Hallmark is not installed');
  } else {
    check('lints a page with the installed skill', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-page-'));
      fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html><head><style>a { transition: all 0.2s; }</style></head><body><a href="#">x</a></body></html>');
      try {
        const result = hallmark.runSloplint(dir, { skillDir: realSkill, tier: 'floor' });
        assert.strictEqual(result.ok, true, result.error || '');
        assert.ok(result.fails > 0, 'expected at least one Floor FAIL');
      } finally {
        cleanup(dir);
      }
    });
  }

  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
