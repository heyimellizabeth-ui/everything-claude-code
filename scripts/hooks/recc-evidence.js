#!/usr/bin/env node
/**
 * RECC Evidence Hook
 *
 * Opt-in: does nothing unless the project has a `.recc/` directory
 * (created by /re-investigate or `mkdir .recc`).
 *
 * PostToolUse (matcher mcp__rea__.*):
 *   Appends one row per REA tool call to `.recc/evidence-log.jsonl` with the
 *   tool name, target path, Evidence IDs, and whether the call errored.
 *
 * Stop:
 *   When REA calls were logged for this session since the last reminder,
 *   reminds the agent on stderr to cite Evidence IDs and list open unknowns
 *   before declaring a reverse-engineering task complete.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RECC_DIR = '.recc';
const LOG_FILE = 'evidence-log.jsonl';
const STOP_STATE_FILE = '.stop-state.json';
const REA_TOOL_PREFIX = 'mcp__rea__';
const MAX_EVIDENCE_IDS = 20;
const MAX_TRACKED_SESSIONS = 50;
const EVIDENCE_ID_PATTERN = /"evidence_?[iI][dD]"\s*:\s*"([^"\\]{1,200})"/g;
const TARGET_KEYS = ['input_path', 'target_path', 'path', 'binary_path', 'url', 'package_path'];

function getReccDir(cwd) {
  const dir = path.join(cwd || process.cwd(), RECC_DIR);
  try {
    return fs.statSync(dir).isDirectory() ? dir : null;
  } catch {
    return null;
  }
}

function extractEvidenceIds(response) {
  const text = typeof response === 'string' ? response : JSON.stringify(response || '');
  // Tool results often embed JSON as an escaped string inside content[].text.
  const unescaped = text.replace(/\\"/g, '"');
  const ids = new Set();
  for (const match of unescaped.matchAll(EVIDENCE_ID_PATTERN)) {
    ids.add(match[1]);
    if (ids.size >= MAX_EVIDENCE_IDS) break;
  }
  return [...ids];
}

function extractTarget(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return null;
  for (const key of TARGET_KEYS) {
    if (typeof toolInput[key] === 'string' && toolInput[key]) return toolInput[key];
  }
  return null;
}

function isErrorResponse(response) {
  return Boolean(response && typeof response === 'object' && response.isError === true);
}

function readSessionRowCount(logPath, sessionId) {
  let content;
  try {
    content = fs.readFileSync(logPath, 'utf8');
  } catch {
    return 0;
  }
  let count = 0;
  for (const line of content.split('\n')) {
    if (!line.trim()) continue;
    try {
      if (JSON.parse(line).session_id === sessionId) count++;
    } catch {
      // Skip malformed rows; the log is append-only and human-editable.
    }
  }
  return count;
}

function handlePostToolUse(input, reccDir) {
  const toolName = String(input.tool_name || '');
  if (!toolName.startsWith(REA_TOOL_PREFIX)) return;

  const row = {
    timestamp: new Date().toISOString(),
    session_id: input.session_id || 'unknown',
    tool: toolName.slice(REA_TOOL_PREFIX.length),
    target: extractTarget(input.tool_input),
    evidence_ids: extractEvidenceIds(input.tool_response),
    error: isErrorResponse(input.tool_response)
  };
  fs.appendFileSync(path.join(reccDir, LOG_FILE), `${JSON.stringify(row)}\n`);
}

function handleStop(input, reccDir) {
  const sessionId = input.session_id || 'unknown';
  const total = readSessionRowCount(path.join(reccDir, LOG_FILE), sessionId);
  if (total === 0) return null;

  const statePath = path.join(reccDir, STOP_STATE_FILE);
  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8')) || {};
  } catch {
    state = {};
  }
  const reminded = Number(state[sessionId]) || 0;
  if (total <= reminded) return null;

  state[sessionId] = total;
  const sessions = Object.keys(state);
  for (const stale of sessions.slice(0, Math.max(0, sessions.length - MAX_TRACKED_SESSIONS))) {
    delete state[stale];
  }
  fs.writeFileSync(statePath, JSON.stringify(state));

  return `[RECC] ${total} REA call(s) logged in ${RECC_DIR}/${LOG_FILE} this session. ` +
    'Before calling the work done: cite Evidence IDs for each claim, keep observations, ' +
    'inferences and unknowns separate, and list open unknowns (mcp__rea__list_unknowns).';
}

function run(rawInput) {
  try {
    const input = rawInput && rawInput.trim() ? JSON.parse(rawInput) : {};
    const reccDir = getReccDir(input.cwd);
    if (!reccDir) return rawInput;

    const event = input.hook_event_name;
    if (event === 'Stop') {
      const reminder = handleStop(input, reccDir);
      return reminder ? { stdout: rawInput, stderr: reminder, exitCode: 0 } : rawInput;
    }
    handlePostToolUse(input, reccDir);
  } catch (err) {
    return { stdout: rawInput, stderr: `[RECCEvidence] ${err.message}`, exitCode: 0 };
  }
  return rawInput;
}

module.exports = { run, extractEvidenceIds, extractTarget };

if (require.main === module) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    const output = run(raw);
    if (output && typeof output === 'object') {
      if (output.stderr) process.stderr.write(`${output.stderr}\n`);
      process.stdout.write(String(output.stdout ?? ''));
    } else {
      process.stdout.write(String(output ?? ''));
    }
    process.exit(0);
  });
}
