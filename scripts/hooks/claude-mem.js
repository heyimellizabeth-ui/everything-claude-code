#!/usr/bin/env node
/**
 * Bridge ECC hooks to the claude-mem plugin worker (thedotmack/claude-mem).
 *
 * Resolves the installed claude-mem plugin root and forwards the hook
 * payload to its worker service. No-ops (exit 0) when claude-mem is not
 * installed so the hook never blocks tool execution.
 *
 * Routed through run-with-flags.js; the hook id selects the worker action.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const SPAWN_TIMEOUT_MS = 30000;

// hookId -> ordered worker invocations. `capture: true` returns the worker's
// stdout as hook output (context injection); otherwise stdin passes through.
const ACTIONS = {
  'session:claude-mem': [
    { args: ['start'], capture: false },
    { args: ['hook', 'claude-code', 'context'], capture: true }
  ],
  'prompt:claude-mem-init': [
    { args: ['hook', 'claude-code', 'session-init'], capture: true }
  ],
  'pre:claude-mem-file-context': [
    { args: ['hook', 'claude-code', 'file-context'], capture: true }
  ],
  'post:claude-mem-observation': [
    { args: ['hook', 'claude-code', 'observation'], capture: true }
  ],
  'stop:claude-mem-summarize': [
    { args: ['hook', 'claude-code', 'summarize'], capture: true }
  ]
};

function configDir() {
  const fromEnv = (process.env.CLAUDE_CONFIG_DIR || '').trim();
  return fromEnv || path.join(os.homedir(), '.claude');
}

function resolveClaudeMemRoot() {
  const base = configDir();
  const candidates = [];

  const cacheBase = path.join(base, 'plugins', 'cache', 'thedotmack', 'claude-mem');
  try {
    const versions = fs.readdirSync(cacheBase, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && /^[0-9]/.test(entry.name))
      .map(entry => path.join(cacheBase, entry.name))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    candidates.push(...versions);
  } catch {
    // cache dir absent — fall through to marketplace path
  }
  candidates.push(path.join(base, 'plugins', 'marketplaces', 'thedotmack', 'plugin'));

  for (const candidate of candidates) {
    const root = fs.existsSync(path.join(candidate, 'plugin', 'scripts'))
      ? path.join(candidate, 'plugin')
      : candidate;
    if (
      fs.existsSync(path.join(root, 'scripts', 'bun-runner.js')) &&
      fs.existsSync(path.join(root, 'scripts', 'worker-service.cjs'))
    ) {
      return root;
    }
  }
  return null;
}

function run(rawInput, context = {}) {
  const hookId = context.hookId || process.env.ECC_HOOK_ID || '';
  const invocations = ACTIONS[hookId];
  if (!invocations) {
    return { exitCode: 0, stderr: `[ClaudeMem] unknown hook id: ${hookId}` };
  }

  const root = resolveClaudeMemRoot();
  if (!root) {
    // claude-mem not installed — silently pass through
    return { exitCode: 0 };
  }

  const runner = path.join(root, 'scripts', 'bun-runner.js');
  const worker = path.join(root, 'scripts', 'worker-service.cjs');
  let captured = '';

  for (const { args, capture } of invocations) {
    const result = spawnSync(process.execPath, [runner, worker, ...args], {
      input: typeof rawInput === 'string' ? rawInput : '',
      encoding: 'utf8',
      env: process.env,
      cwd: process.cwd(),
      timeout: SPAWN_TIMEOUT_MS
    });

    if (result.error || result.signal || result.status === null) {
      const reason = result.error
        ? result.error.message
        : result.signal
          ? `signal ${result.signal}`
          : 'missing exit status';
      return { exitCode: 0, stderr: `[ClaudeMem] ${args.join(' ')} failed: ${reason}` };
    }
    if (capture && typeof result.stdout === 'string' && result.stdout.trim()) {
      captured = result.stdout;
    }
  }

  return captured ? { exitCode: 0, stdout: captured } : { exitCode: 0 };
}

module.exports = { run, resolveClaudeMemRoot, ACTIONS };
