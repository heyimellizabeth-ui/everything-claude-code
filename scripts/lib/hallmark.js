'use strict';

/**
 * Thin wrapper around the Hallmark design skill's linter (sloplint.mjs).
 *
 * Hallmark is an optional, separately installed skill. Nothing here vendors
 * it: the wrapper finds an installed copy, runs its linter with --json and
 * turns the result into a pass/fail gate. Callers must handle
 * `{ available: false }` when the skill is not installed.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SLOPLINT_RELATIVE_PATH = path.join('scripts', 'sloplint.mjs');
const VALID_TIERS = new Set(['floor', 'reflex', 'finish']);
const VALID_SCOPES = new Set(['component', 'app']);

/**
 * Candidate skill directories, most specific first.
 * @param {{ env?: object, homedir?: string }} [options]
 * @returns {string[]}
 */
function candidateSkillDirs(options = {}) {
  const env = options.env || process.env;
  const home = options.homedir || os.homedir();
  const candidates = [];

  if (env.HALLMARK_SKILL_DIR && env.HALLMARK_SKILL_DIR.trim()) {
    candidates.push(env.HALLMARK_SKILL_DIR.trim());
  }
  candidates.push(path.join(home, '.claude', 'skills', 'hallmark'));
  candidates.push(path.join(home, '.agents', 'skills', 'hallmark'));
  candidates.push(path.join(home, '.claude', 'plugins', 'marketplaces', 'hallmark', 'skills', 'hallmark'));

  return candidates;
}

/**
 * Find an installed Hallmark skill directory.
 * @param {{ env?: object, homedir?: string }} [options]
 * @returns {string|null} Directory containing scripts/sloplint.mjs, or null
 */
function resolveSkillDir(options = {}) {
  for (const dir of candidateSkillDirs(options)) {
    if (fs.existsSync(path.join(dir, SLOPLINT_RELATIVE_PATH))) return dir;
  }
  return null;
}

/**
 * Build the sloplint argument list from gate options.
 * @param {string} target - File, directory, or empty when only urls are given
 * @param {object} [options]
 * @returns {string[]}
 */
function buildArgs(target, options = {}) {
  const args = [];
  if (target) args.push(target);
  args.push('--json');

  if (options.tier) {
    if (!VALID_TIERS.has(options.tier)) throw new Error(`Unknown tier: ${options.tier}`);
    args.push('--tier', options.tier);
  }
  if (options.scope) {
    if (!VALID_SCOPES.has(options.scope)) throw new Error(`Unknown scope: ${options.scope}`);
    args.push('--scope', options.scope);
  }
  if (options.genre) args.push('--genre', String(options.genre));
  if (options.render) args.push('--render');
  if (options.before) args.push('--before');
  if (options.kept) args.push('--kept');
  for (const url of options.urls || []) args.push('--url', String(url));

  return args;
}

/**
 * Parse sloplint --json output.
 * @param {string} stdout
 * @returns {{ summary: object, findings: object[] }|null}
 */
function parseSloplintOutput(stdout) {
  const text = String(stdout || '');
  const start = text.indexOf('{');
  if (start === -1) return null;
  try {
    const parsed = JSON.parse(text.slice(start));
    if (!parsed || typeof parsed.summary !== 'object' || !Array.isArray(parsed.findings)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Run the Hallmark linter. Never throws for lint findings: sloplint exits 1
 * whenever it reports a FAIL or REFLEX, so the exit code is not an error here.
 *
 * @param {string} target
 * @param {object} [options] - tier, scope, genre, render, before, kept, urls, skillDir, timeoutMs
 * @returns {{
 *   available: boolean, ok: boolean, error: string|null,
 *   fails: number, reflex: number, warns: number, waived: number,
 *   renderRan: boolean, renderNote: string, renderRequested: boolean,
 *   recording: boolean, findings: object[]
 * }}
 */
function runSloplint(target, options = {}) {
  const base = {
    available: false,
    ok: false,
    error: null,
    fails: 0,
    reflex: 0,
    warns: 0,
    waived: 0,
    renderRan: false,
    renderNote: '',
    renderRequested: Boolean(options.render || (options.urls && options.urls.length)),
    recording: Boolean(options.before),
    findings: []
  };

  const skillDir = options.skillDir || resolveSkillDir(options);
  if (!skillDir) {
    return { ...base, error: 'Hallmark skill not found. Install it or set HALLMARK_SKILL_DIR.' };
  }

  const sloplint = path.join(skillDir, SLOPLINT_RELATIVE_PATH);
  let args;
  try {
    args = buildArgs(target, options);
  } catch (err) {
    return { ...base, available: true, error: err.message };
  }

  const result = spawnSync(process.execPath, [sloplint, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: options.timeoutMs || 300000
  });

  if (result.error) {
    return { ...base, available: true, error: `sloplint failed to run: ${result.error.message}` };
  }

  const parsed = parseSloplintOutput(result.stdout);
  if (!parsed) {
    const detail = String(result.stderr || result.stdout || '').trim().split('\n')[0] || `exit ${result.status}`;
    return { ...base, available: true, error: `sloplint produced no JSON: ${detail}` };
  }

  const summary = parsed.summary;
  return {
    ...base,
    available: true,
    ok: true,
    fails: Number(summary.fails) || 0,
    reflex: Number(summary.reflex) || 0,
    warns: Number(summary.warns) || 0,
    waived: Number(summary.waived) || 0,
    renderRan: summary.render === 'ran',
    renderNote: typeof summary.render === 'string' && summary.render.startsWith('not run') ? summary.render : '',
    recording: Boolean(options.before),
    findings: parsed.findings
  };
}

/**
 * Decide whether a lint result passes the design gate.
 *
 * - Any Floor FAIL blocks.
 * - An open REFLEX blocks unless only the floor tier was requested.
 * - With requireRender, a run whose render tier did not run blocks.
 * - A --before run only records the page, so it never blocks on findings.
 *
 * @param {object} result - Output of runSloplint
 * @param {{ tier?: string, requireRender?: boolean }} [options]
 * @returns {{ pass: boolean, reasons: string[] }}
 */
function evaluateGate(result, options = {}) {
  const reasons = [];
  if (!result.available) reasons.push(result.error || 'Hallmark skill not found');
  else if (!result.ok) reasons.push(result.error || 'sloplint did not complete');
  else if (result.recording) {
    // --before records links, fields and handlers for a later --kept run.
  } else {
    if (result.fails > 0) reasons.push(`${result.fails} FAIL`);
    if (options.tier !== 'floor' && result.reflex > 0) reasons.push(`${result.reflex} open REFLEX (fix or waive in the stamp)`);
    if (options.requireRender && !result.renderRan) reasons.push(result.renderNote || 'render tier did not run (needs puppeteer-core and Chrome)');
  }
  return { pass: reasons.length === 0, reasons };
}

/**
 * One-line summary for reports and PR bodies.
 * @param {object} result - Output of runSloplint
 * @returns {string}
 */
function summarize(result) {
  if (!result.available) return 'Hallmark: not installed, design gate skipped';
  if (!result.ok) return `Hallmark: ${result.error}`;
  const parts = [`Floor ${result.fails} FAIL`, `Reflex ${result.reflex}`];
  if (result.waived) parts[1] += ` (${result.waived} waived)`;
  parts.push(`${result.warns} WARN`);
  if (result.recording) parts.unshift('recorded for --kept');
  parts.push(`render: ${result.renderRan ? 'ran' : result.renderRequested ? 'NOT RUN' : 'skipped'}`);
  return parts.join(' · ');
}

/**
 * Group findings by gate, most frequent first.
 * @param {object[]} findings
 * @param {number} [limit]
 * @returns {{ gate: string, grade: string, count: number, example: string }[]}
 */
function topGates(findings, limit = 10) {
  const byGate = new Map();
  for (const finding of findings || []) {
    const key = `${finding.grade} ${finding.gate}`;
    const entry = byGate.get(key) || { gate: String(finding.gate), grade: finding.grade, count: 0, example: finding.evidence || '' };
    entry.count += 1;
    byGate.set(key, entry);
  }
  return [...byGate.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

module.exports = {
  SLOPLINT_RELATIVE_PATH,
  candidateSkillDirs,
  resolveSkillDir,
  buildArgs,
  parseSloplintOutput,
  runSloplint,
  evaluateGate,
  summarize,
  topGates
};
