#!/usr/bin/env node
/**
 * PreToolUse Hook: GateGuard Fact-Forcing Gate
 *
 * Forces Claude to investigate before editing files or running commands.
 * Instead of asking "are you sure?" (which LLMs always answer "yes"),
 * this hook demands concrete facts: importers, public API, data schemas.
 *
 * The act of investigation creates awareness that self-evaluation never did.
 *
 * Gates:
 *   - Edit/Write: list importers, affected API, verify data schemas, quote instruction
 *   - Bash (destructive): list targets, rollback plan, quote instruction
 *   - Bash (routine): quote current instruction (once per session)
 *
 * Compatible with run-with-flags.js via module.exports.run().
 * Cross-platform (Windows, macOS, Linux).
 *
 * Full package with config support: pip install gateguard-ai
 * Repo: https://github.com/zunoworks/gateguard
 */

'use strict';
const crypto = require('crypto');
const { isDestructiveBash } = require('../lib/gateguard/bash-analysis');
const { isReadOnlyGitIntrospection } = require('../lib/gateguard/git-commands');
const { isGateGuardDisabled, isClaudeSettingsPath, isSubagentInvocation } = require('../lib/gateguard/context');
const { createStateStore, ROUTINE_BASH_SESSION_KEY } = require('../lib/gateguard/state');
const {
  BASH_HOOK_ID,
  editGateMsg,
  writeGateMsg,
  destructiveBashMsg,
  routineBashMsg,
  denyResult,
  allowWithStateWarning
} = require('../lib/gateguard/messages');

// Session state — scoped per session to avoid cross-session races.
// Created at load time so GATEGUARD_STATE_DIR is read when the hook loads.
const store = createStateStore();
store.pruneStaleFiles();

// --- Core logic (exported for run-with-flags.js) ---

function run(rawInput) {
  let data;
  try {
    data = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
  } catch (_) {
    return rawInput; // allow on parse error
  }

  if (isGateGuardDisabled()) {
    return rawInput;
  }

  store.resetStateFile();
  store.getStateFile(data);

  const rawToolName = data.tool_name || '';
  const toolInput = data.tool_input || {};
  // Normalize: case-insensitive matching via lookup map
  const TOOL_MAP = { edit: 'Edit', write: 'Write', multiedit: 'MultiEdit', bash: 'Bash' };
  const toolName = TOOL_MAP[rawToolName.toLowerCase()] || rawToolName;
  const inSubagent = isSubagentInvocation(data);

  if (toolName === 'Edit' || toolName === 'Write') {
    const filePath = toolInput.file_path || '';
    if (!filePath || isClaudeSettingsPath(filePath)) {
      return rawInput; // allow
    }

    if (inSubagent) {
      return rawInput; // parent session already passed the first-touch file gate
    }

    if (!store.isChecked(filePath)) {
      if (!store.markChecked(filePath)) {
        return allowWithStateWarning();
      }
      return denyResult(toolName === 'Edit' ? editGateMsg(filePath) : writeGateMsg(filePath));
    }

    return rawInput; // allow
  }

  if (toolName === 'MultiEdit') {
    if (inSubagent) {
      return rawInput; // parent session already passed the first-touch file gate
    }

    const edits = toolInput.edits || [];
    for (const edit of edits) {
      const filePath = edit.file_path || '';
      if (filePath && !isClaudeSettingsPath(filePath) && !store.isChecked(filePath)) {
        if (!store.markChecked(filePath)) {
          return allowWithStateWarning();
        }
        return denyResult(editGateMsg(filePath));
      }
    }
    return rawInput; // allow
  }

  if (toolName === 'Bash') {
    const command = toolInput.command || '';
    if (isReadOnlyGitIntrospection(command)) {
      return rawInput;
    }

    if (isDestructiveBash(command)) {
      // Gate destructive commands on first attempt; allow retry after facts presented
      const key = '__destructive__' + crypto.createHash('sha256').update(command).digest('hex').slice(0, 16);
      if (!store.isChecked(key)) {
        if (!store.markChecked(key)) {
          return allowWithStateWarning();
        }
        return denyResult(destructiveBashMsg(), { includeRecoveryHint: false });
      }
      return rawInput; // allow retry after facts presented
    }

    if (!store.isChecked(ROUTINE_BASH_SESSION_KEY)) {
      if (!store.markChecked(ROUTINE_BASH_SESSION_KEY)) {
        return allowWithStateWarning();
      }
      return denyResult(routineBashMsg(), { hookIds: [BASH_HOOK_ID] });
    }

    return rawInput; // allow
  }

  return rawInput; // allow
}

module.exports = { run };
