#!/usr/bin/env node
'use strict';

/**
 * chelp-pipeline: check that the chelp web chains have what they need, prove the
 * browser tier works with a smoke test, and print the exact fix for anything
 * missing. Installing is opt-in (--install). Nothing is changed otherwise.
 *
 * Usage:
 *   node scripts/chelp-pipeline.js [--no-smoke] [--install] [--json]
 *
 * Exit codes: 0 ready (with or without the browser checks), 1 not ready.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const hallmark = require('./lib/hallmark');

const REPO_ROOT = path.resolve(__dirname, '..');
const HALLMARK_INSTALL = 'npx skills add nutlope/hallmark -g';
const PUPPETEER_INSTALL = 'npm i -g puppeteer-core';
const HALLMARK_LABEL = 'Hallmark design skill (optional: runs /design-gate)';
const CHROME_CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ]
};

function check(id, label, ok, detail, fix, required) {
  return { id, label, ok, detail, fix: ok ? '' : fix, required };
}

function checkNode(version = process.versions.node) {
  const major = Number(String(version).split('.')[0]);
  return check('node', 'Node 18 or later', major >= 18, `Node ${version}`, 'Install Node 18 or later.', true);
}

function checkHallmark(options = {}) {
  const dir = options.skillDir || hallmark.resolveSkillDir({ env: options.env, homedir: options.homedir });
  if (!dir) {
    return check('hallmark', HALLMARK_LABEL, false, 'not found (the review checklist is the gate without it)', `${HALLMARK_INSTALL}  (or from a clone: node skills/hallmark/scripts/install.mjs). Set HALLMARK_SKILL_DIR if it lives elsewhere.`, false);
  }
  let version = '';
  try {
    const match = /^version:\s*(\S+)/m.exec(fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8'));
    version = match ? ` ${match[1]}` : '';
  } catch {
    version = '';
  }
  return check('hallmark', HALLMARK_LABEL, true, `${dir}${version ? ` (version${version})` : ''}`, '', false);
}

function globalNodeModules() {
  const result = spawnSync('npm', ['root', '-g'], { encoding: 'utf8', timeout: 15000 });
  return result.status === 0 ? String(result.stdout).trim() : '';
}

function checkPuppeteer(options = {}) {
  const env = options.env || process.env;
  const cwd = options.cwd || process.cwd();
  const candidates = [];
  if (env.HALLMARK_PUPPETEER && env.HALLMARK_PUPPETEER.trim()) candidates.push(env.HALLMARK_PUPPETEER.trim());
  candidates.push(path.join(cwd, 'node_modules', 'puppeteer-core'));
  const globalRoot = options.globalRoot !== undefined ? options.globalRoot : globalNodeModules();
  if (globalRoot) candidates.push(path.join(globalRoot, 'puppeteer-core'));
  const found = candidates.find(c => fs.existsSync(c));
  return check('puppeteer', 'puppeteer-core (browser checks)', Boolean(found), found || 'not found',
    `${PUPPETEER_INSTALL}  (or point HALLMARK_PUPPETEER at an installed copy). Playwright alone is not enough.`, false);
}

function checkChrome(options = {}) {
  const env = options.env || process.env;
  const platform = options.platform || process.platform;
  const candidates = [];
  if (env.CHROME_PATH && env.CHROME_PATH.trim()) candidates.push(env.CHROME_PATH.trim());
  candidates.push(...(CHROME_CANDIDATES[platform] || []));
  const found = candidates.find(c => fs.existsSync(c));
  return check('chrome', 'Chrome or Chromium (browser checks)', Boolean(found), found || 'not found',
    'Install Chrome, or set CHROME_PATH to a Chrome or Chromium binary. In a cloud session use CHROME_PATH=/usr/bin/google-chrome if it exists (it adds --no-sandbox for root).', false);
}

function checkEccFiles(root = REPO_ROOT) {
  // Each entry is a list of places the file can be: a repository checkout, or the
  // installer's layout, which puts skills under skills/ecc/.
  const needed = [
    ['scripts/design-gate.js'],
    ['skills/unified-design-system/SKILL.md', 'skills/ecc/unified-design-system/SKILL.md'],
    ['skills/chelp-advisor/SKILL.md', 'skills/ecc/chelp-advisor/SKILL.md'],
    ['agents/chelp-advisor.md'],
    ['commands/chelp-advisor.md']
  ];
  const missing = needed
    .filter(options => !options.some(f => fs.existsSync(path.join(root, f))))
    .map(options => options[0]);
  return check('ecc', 'ECC chelp files (design system, gate, advisor)', missing.length === 0,
    missing.length ? `missing: ${missing.join(', ')}` : root,
    'Update ECC to a version that includes the chelp advisor and /design-gate.', true);
}

function projectNotes(cwd = process.cwd()) {
  const notes = [];
  let pkg = null;
  try { pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')); } catch { pkg = null; }
  const deps = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};
  if (deps['@astryxdesign/core']) {
    notes.push('Astryx project: use the stone theme and the global CSS in the astryx-components skill, and always pass the source path with --url.');
  } else if (deps.react) {
    notes.push('React project without Astryx: see the astryx-components skill if you want it as the component directory.');
  }
  const master = hallmark.findDesignSystemMaster('.', { cwd });
  const project = hallmark.isHallmarkProject('.', { cwd });
  if (master) {
    notes.push(`Unified design system project (${master}): every chain reads MASTER.md and PREFERENCES.md first, and /design-gate will block on findings.`);
  } else if (project.hallmark) {
    notes.push(`Hallmark project (${project.reason}): /design-gate will block on findings. Run the unified-design-system skill to add design-system/MASTER.md.`);
  } else {
    notes.push('/design-gate will REPORT ONLY here (no design-system/MASTER.md, Hallmark stamp, design.md or .hallmark record). Use --enforce to block.');
  }
  return notes;
}

/** Prove the browser tier works: lint a tiny page with --render and read the summary. */
function smokeTest(options = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chelp-smoke-'));
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'chelp-smoke-cwd-'));
  try {
    fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Smoke</title></head><body><h1>Smoke test</h1></body></html>');
    const previous = process.cwd();
    process.chdir(cwd);
    let result;
    try {
      result = hallmark.runSloplint(dir, { render: true, skillDir: options.skillDir, timeoutMs: 120000 });
    } finally {
      process.chdir(previous);
    }
    return {
      ran: Boolean(result.available && result.ok && result.renderRan),
      note: result.renderNote || result.error || ''
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(cwd, { recursive: true, force: true });
  }
}

/**
 * @param {object[]} checks
 * @param {{ ran: boolean, note: string }|null} smoke - null when not run
 * @returns {{ verdict: string, ready: boolean }}
 */
function evaluate(checks, smoke) {
  const failedRequired = checks.filter(c => c.required && !c.ok);
  if (failedRequired.length) return { verdict: 'NOT READY', ready: false };
  if (checks.some(c => c.id === 'hallmark' && !c.ok)) return { verdict: 'READY (checklist gate only)', ready: true };
  const browserOk = checks.filter(c => !c.required).every(c => c.ok);
  if (!browserOk) return { verdict: 'READY (static checks only)', ready: true };
  if (smoke === null) return { verdict: 'READY (browser checks not smoke tested)', ready: true };
  if (!smoke.ran) return { verdict: 'READY (static checks only)', ready: true };
  return { verdict: 'READY', ready: true };
}

function runChecks(options = {}) {
  return [
    checkNode(),
    checkHallmark(options),
    checkEccFiles(options.root),
    checkPuppeteer(options),
    checkChrome(options)
  ];
}

function install(checks) {
  const steps = [];
  const missing = id => checks.some(c => c.id === id && !c.ok);
  if (missing('hallmark')) steps.push(['npx', ['--yes', 'skills', 'add', 'nutlope/hallmark', '-g']]);
  if (missing('puppeteer')) steps.push(['npm', ['i', '-g', 'puppeteer-core']]);
  const results = [];
  for (const [cmd, args] of steps) {
    const run = spawnSync(cmd, args, { stdio: 'inherit' });
    results.push({ command: `${cmd} ${args.join(' ')}`, ok: run.status === 0 });
  }
  return results;
}

function parseArgs(argv) {
  const options = { smoke: true, install: false, json: false };
  for (const arg of argv) {
    if (arg === '--no-smoke') options.smoke = false;
    else if (arg === '--install') options.install = true;
    else if (arg === '--json') options.json = true;
    else throw new Error(`Unknown flag: ${arg}`);
  }
  return options;
}

function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (err) {
    console.error(`[chelp-pipeline] ${err.message}`);
    return 2;
  }

  let checks = runChecks();
  let installs = [];
  if (options.install && checks.some(c => !c.ok && (c.id === 'hallmark' || c.id === 'puppeteer'))) {
    installs = install(checks);
    checks = runChecks();
  }

  const browserReady = checks.filter(c => !c.required).every(c => c.ok);
  const requiredReady = checks.filter(c => c.required).every(c => c.ok);
  const smoke = options.smoke && browserReady && requiredReady ? smokeTest() : null;
  const { verdict, ready } = evaluate(checks, smoke);
  const notes = projectNotes();

  if (options.json) {
    console.log(JSON.stringify({ verdict, ready, checks, smoke, installs, notes }, null, 2));
    return ready ? 0 : 1;
  }

  console.log('[chelp-pipeline] Checking what the chelp chains need\n');
  for (const c of checks) {
    console.log(`  ${c.ok ? 'OK     ' : 'MISSING'}  ${c.label}: ${c.detail}`);
    if (!c.ok) console.log(`           fix: ${c.fix}`);
  }
  if (smoke) {
    console.log(`\n  ${smoke.ran ? 'OK     ' : 'FAILED '}  Browser-tier smoke test: ${smoke.ran ? 'render: ran' : (smoke.note || 'the render tier did not run')}`);
  }
  console.log('\nProject:');
  notes.forEach(n => console.log(`  - ${n}`));
  console.log('\nStill to do by hand:');
  console.log('  - Run /advisor opus so the advisor tool uses Opus, then read the chelp-advisor skill before consulting.');
  console.log('  - Pick a chain with /chelp.');
  console.log(`\n[chelp-pipeline] ${verdict}`);
  if (verdict === 'READY (checklist gate only)') {
    console.log('[chelp-pipeline] Without Hallmark the chains run the review checklist (unified-design-system references/review-checklist.md) as the gate. Install Hallmark for the executable /design-gate.');
  }
  if (verdict === 'READY (static checks only)') {
    console.log('[chelp-pipeline] /design-gate runs the static checks; --render and --require-render (c4) will not pass until the browser checks work.');
  }
  return ready ? 0 : 1;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = {
  checkNode,
  checkHallmark,
  checkPuppeteer,
  checkChrome,
  checkEccFiles,
  projectNotes,
  smokeTest,
  evaluate,
  runChecks,
  parseArgs,
  main
};
