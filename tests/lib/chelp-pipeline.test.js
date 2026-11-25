/**
 * Tests for plugins/studio-kit/scripts/chelp-pipeline.js
 *
 * Run with: node tests/lib/chelp-pipeline.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const pipeline = require('../../plugins/studio-kit/scripts/chelp-pipeline');

const CLI = path.resolve(__dirname, '../../plugins/studio-kit/scripts/chelp-pipeline.js');

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

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-pipeline-'));
const rm = dir => fs.rmSync(dir, { recursive: true, force: true });

/** A fake Hallmark skill dir: SKILL.md with a version and a sloplint script. */
function fakeSkill(version = '2.0.0') {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: hallmark\nversion: ${version}\n---\n`);
  fs.writeFileSync(path.join(dir, 'scripts', 'sloplint.mjs'), '');
  return dir;
}

function runCli(args, env) {
  const cwd = tmp();
  try {
    return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd, env });
  } finally {
    rm(cwd);
  }
}

function runTests() {
  console.log('\n=== Testing chelp-pipeline.js ===\n');
  let passed = 0;
  let failed = 0;
  const check = (name, fn) => (test(name, fn) ? passed++ : failed++);

  console.log('checks:');

  check('Node 18 passes and Node 16 fails', () => {
    assert.strictEqual(pipeline.checkNode('18.19.0').ok, true);
    assert.strictEqual(pipeline.checkNode('22.1.0').ok, true);
    assert.strictEqual(pipeline.checkNode('16.20.0').ok, false);
  });

  check('Hallmark is found with its version, and missing gives the install command', () => {
    const skill = fakeSkill('2.0.0');
    const home = tmp();
    try {
      const found = pipeline.checkHallmark({ skillDir: skill });
      assert.strictEqual(found.ok, true);
      assert.ok(found.detail.includes('2.0.0'), found.detail);
      const missing = pipeline.checkHallmark({ env: {}, homedir: home });
      assert.strictEqual(missing.ok, false);
      assert.ok(missing.fix.includes('npx skills add nutlope/hallmark -g'), missing.fix);
      assert.strictEqual(missing.required, false, 'Hallmark is optional: the review checklist gates without it');
    } finally {
      rm(skill);
      rm(home);
    }
  });

  check('puppeteer-core is found through HALLMARK_PUPPETEER, or reported missing', () => {
    const dir = tmp();
    const cwd = tmp();
    try {
      assert.strictEqual(pipeline.checkPuppeteer({ env: { HALLMARK_PUPPETEER: dir }, cwd, globalRoot: '' }).ok, true);
      const missing = pipeline.checkPuppeteer({ env: {}, cwd, globalRoot: '' });
      assert.strictEqual(missing.ok, false);
      assert.ok(missing.fix.includes('npm i -g puppeteer-core'));
      assert.strictEqual(missing.required, false);
    } finally {
      rm(dir);
      rm(cwd);
    }
  });

  check('puppeteer-core is found in the working folder or the global root', () => {
    const cwd = tmp();
    const globalRoot = tmp();
    fs.mkdirSync(path.join(cwd, 'node_modules', 'puppeteer-core'), { recursive: true });
    fs.mkdirSync(path.join(globalRoot, 'puppeteer-core'));
    try {
      assert.strictEqual(pipeline.checkPuppeteer({ env: {}, cwd, globalRoot: '' }).ok, true);
      const empty = tmp();
      assert.strictEqual(pipeline.checkPuppeteer({ env: {}, cwd: empty, globalRoot }).ok, true);
      rm(empty);
    } finally {
      rm(cwd);
      rm(globalRoot);
    }
  });

  check('Chrome is found through CHROME_PATH, or reported missing', () => {
    const dir = tmp();
    const chrome = path.join(dir, 'chrome');
    fs.writeFileSync(chrome, '');
    try {
      assert.strictEqual(pipeline.checkChrome({ env: { CHROME_PATH: chrome }, platform: 'freebsd' }).ok, true);
      const missing = pipeline.checkChrome({ env: { CHROME_PATH: path.join(dir, 'nope') }, platform: 'freebsd' });
      assert.strictEqual(missing.ok, false);
      assert.ok(missing.fix.includes('CHROME_PATH'));
    } finally {
      rm(dir);
    }
  });

  check('the ECC files check lists what is missing', () => {
    const root = tmp();
    try {
      const missing = pipeline.checkEccFiles(root);
      assert.strictEqual(missing.ok, false);
      assert.ok(missing.detail.includes('scripts/design-gate.js'));
      assert.strictEqual(pipeline.checkEccFiles(path.resolve(__dirname, '..', '..', 'plugins', 'studio-kit')).ok, true);
      // The installer's layout: skills under skills/ecc/.
      for (const f of ['scripts/design-gate.js', 'skills/ecc/unified-design-system/SKILL.md', 'skills/ecc/chelp-advisor/SKILL.md', 'agents/chelp-advisor.md', 'commands/chelp-advisor.md']) {
        fs.mkdirSync(path.join(root, path.dirname(f)), { recursive: true });
        fs.writeFileSync(path.join(root, f), '');
      }
      assert.strictEqual(pipeline.checkEccFiles(root).ok, true, pipeline.checkEccFiles(root).detail);
    } finally {
      rm(root);
    }
  });

  console.log('\nverdict:');

  const ok = (id, required) => ({ id, ok: true, required });
  const bad = (id, required) => ({ id, ok: false, required });

  check('a missing required check is NOT READY', () => {
    const verdict = pipeline.evaluate([bad('node', true), ok('hallmark', false), ok('puppeteer', false), ok('chrome', false)], null);
    assert.deepStrictEqual(verdict, { verdict: 'NOT READY', ready: false });
  });

  check('missing Hallmark is READY with the checklist gate only', () => {
    const verdict = pipeline.evaluate([ok('node', true), bad('hallmark', false), ok('ecc', true), bad('puppeteer', false), ok('chrome', false)], null);
    assert.deepStrictEqual(verdict, { verdict: 'READY (checklist gate only)', ready: true });
  });

  check('missing browser checks are READY (static checks only)', () => {
    const verdict = pipeline.evaluate([ok('node', true), ok('hallmark', true), bad('puppeteer', false), ok('chrome', false)], null);
    assert.strictEqual(verdict.verdict, 'READY (static checks only)');
    assert.strictEqual(verdict.ready, true);
  });

  check('everything present: READY after a passing smoke test, not-smoke-tested without one, static only after a failed one', () => {
    const all = [ok('node', true), ok('hallmark', true), ok('puppeteer', false), ok('chrome', false)];
    assert.strictEqual(pipeline.evaluate(all, { ran: true, note: '' }).verdict, 'READY');
    assert.strictEqual(pipeline.evaluate(all, null).verdict, 'READY (browser checks not smoke tested)');
    assert.strictEqual(pipeline.evaluate(all, { ran: false, note: 'no puppeteer' }).verdict, 'READY (static checks only)');
  });

  console.log('\nproject notes:');

  check('an Astryx project and a plain folder get different notes', () => {
    const astryx = tmp();
    const plain = tmp();
    fs.writeFileSync(path.join(astryx, 'package.json'), JSON.stringify({ dependencies: { '@astryxdesign/core': '0.7.16', react: '19.0.0' } }));
    try {
      assert.ok(pipeline.projectNotes(astryx).some(n => n.includes('Astryx project') && n.includes('stone')));
      const notes = pipeline.projectNotes(plain);
      assert.ok(notes.some(n => n.includes('REPORT ONLY')), notes.join('\n'));
      fs.mkdirSync(path.join(plain, 'design-system'));
      fs.writeFileSync(path.join(plain, 'design-system', 'MASTER.md'), '# Master\n');
      const withMaster = pipeline.projectNotes(plain);
      assert.ok(withMaster.some(n => n.includes('Unified design system project') && n.includes('block')), withMaster.join('\n'));
    } finally {
      rm(astryx);
      rm(plain);
    }
  });

  console.log('\nCLI:');

  check('rejects an unknown flag', () => {
    assert.throws(() => pipeline.parseArgs(['--nope']), /Unknown flag/);
    assert.strictEqual(pipeline.parseArgs(['--no-smoke', '--install']).smoke, false);
  });

  check('exits 0 with the checklist gate only when Hallmark is missing, and still prints its install command', () => {
    const home = tmp();
    try {
      const run = runCli(['--no-smoke'], { PATH: process.env.PATH, HOME: home, USERPROFILE: home });
      assert.strictEqual(run.status, 0, run.stdout + run.stderr);
      assert.ok(run.stdout.includes('READY (checklist gate only)') && run.stdout.includes('npx skills add nutlope/hallmark -g'), run.stdout);
    } finally {
      rm(home);
    }
  });

  check('exits 0 and says READY (browser checks not smoke tested) when everything is present', () => {
    const skill = fakeSkill();
    const dir = tmp();
    const chrome = path.join(dir, 'chrome');
    fs.writeFileSync(chrome, '');
    const pptr = path.join(dir, 'puppeteer-core');
    fs.mkdirSync(pptr);
    try {
      const run = runCli(['--no-smoke', '--json'], {
        PATH: process.env.PATH, HOME: dir, USERPROFILE: dir,
        HALLMARK_SKILL_DIR: skill, HALLMARK_PUPPETEER: pptr, CHROME_PATH: chrome
      });
      assert.strictEqual(run.status, 0, run.stdout + run.stderr);
      const result = JSON.parse(run.stdout);
      assert.strictEqual(result.verdict, 'READY (browser checks not smoke tested)');
      assert.ok(result.checks.every(c => c.ok), JSON.stringify(result.checks));
    } finally {
      rm(skill);
      rm(dir);
    }
  });

  console.log('\nReal browser smoke test (optional):');
  const real = require('../../plugins/studio-kit/scripts/lib/hallmark').resolveSkillDir();
  const puppeteer = pipeline.checkPuppeteer();
  const chrome = pipeline.checkChrome();
  if (!real || !puppeteer.ok || !chrome.ok) {
    console.log('  - skipped: needs Hallmark, puppeteer-core and Chrome');
  } else {
    check('the smoke test renders a page', () => {
      const result = pipeline.smokeTest();
      assert.strictEqual(result.ran, true, result.note);
    });
  }

  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
