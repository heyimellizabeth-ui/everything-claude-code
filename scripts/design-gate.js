#!/usr/bin/env node
'use strict';

/**
 * Design gate CLI: runs the Hallmark linter on a path or URL and exits
 * non-zero when the gate fails.
 *
 * Usage:
 *   node scripts/design-gate.js [path] [--tier floor] [--scope app|component]
 *     [--genre <genre>] [--render] [--require-render] [--enforce] [--before] [--kept]
 *     [--url <url> ...] [--json]
 *
 * Exit codes: 0 pass (or Hallmark missing without --require-hallmark),
 *             1 gate failed, 2 usage or runtime error.
 */

const hallmark = require('./lib/hallmark');

const VALUE_FLAGS = new Set(['--tier', '--scope', '--genre', '--url']);
const BOOLEAN_FLAGS = new Set(['--render', '--require-render', '--require-hallmark', '--enforce', '--before', '--kept', '--json']);

function parseArgs(argv) {
  const options = { urls: [] };
  let target = '';
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (VALUE_FLAGS.has(arg)) {
      const value = argv[++i];
      if (value === undefined) throw new Error(`${arg} needs a value`);
      if (arg === '--url') options.urls.push(value);
      else options[arg.slice(2)] = value;
    } else if (BOOLEAN_FLAGS.has(arg)) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      options[key] = true;
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`);
    } else if (!target) {
      target = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  if (!target && options.urls.length === 0) target = '.';
  return { target, options };
}

function main(argv) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    console.error(`[design-gate] ${err.message}`);
    return 2;
  }

  const { target, options } = parsed;
  // Decide this before the run: the linter writes .hallmark/ files of its own.
  const project = hallmark.isHallmarkProject(target);
  const master = hallmark.findDesignSystemMaster(target);
  const result = hallmark.runSloplint(target, options);
  const gate = hallmark.evaluateGate(result, { tier: options.tier, requireRender: options.requireRender });
  const summary = hallmark.summarize(result);
  // Blocking applies to pages Hallmark built or polished, and to projects with a
  // unified-design-system MASTER.md. Elsewhere the gate reports and exits 0,
  // unless --enforce is passed.
  const enforced = Boolean(options.enforce || project.hallmark || master);

  if (options.json) {
    console.log(JSON.stringify({ pass: gate.pass, enforced, master, reasons: gate.reasons, summary, result }, null, 2));
  } else {
    console.log(`[design-gate] ${summary}`);
    if (result.renderNote) console.log(`[design-gate] ${result.renderNote}`);
    if (!target && result.available) {
      console.log('[design-gate] NOTE: only the running page was checked. Pass the source path too (for example `src --url ...`) so tokens, overflow, the stamp and copy rules are checked.');
    }
    for (const entry of hallmark.topGates(result.findings)) {
      console.log(`  ${entry.grade} ${entry.gate} x${entry.count}  ${entry.example}`);
    }
    if (!result.available && !options.requireHallmark) console.log('[design-gate] SKIPPED');
    else if (!gate.pass && !enforced) {
      console.log(`[design-gate] REPORT ONLY: ${gate.reasons.join('; ')}`);
      console.log(`[design-gate] Not a Hallmark project and no design-system/MASTER.md (${project.reason}), so nothing is blocked. Add --enforce to block, or run /hallmark audit <path> for a full report.`);
    } else if (!gate.pass) console.log(`[design-gate] BLOCKED: ${gate.reasons.join('; ')}`);
    else console.log('[design-gate] PASS');
  }

  if (!result.available) return options.requireHallmark ? 1 : 0;
  if (!result.ok) return 2;
  return gate.pass || !enforced ? 0 : 1;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = { parseArgs, main };
