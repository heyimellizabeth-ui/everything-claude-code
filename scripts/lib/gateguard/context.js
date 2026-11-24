/**
 * Environment and tool-input checks for the GateGuard fact-forcing hook.
 * Extracted from scripts/hooks/gateguard-fact-force.js.
 */

'use strict';

const ECC_DISABLE_VALUES = new Set(['0', 'false', 'off', 'disabled', 'disable']);

function normalizeEnvValue(value) {
  return String(value || '').trim().toLowerCase();
}

function isGateGuardDisabled() {
  if (normalizeEnvValue(process.env.GATEGUARD_DISABLED) === '1') {
    return true;
  }

  return ECC_DISABLE_VALUES.has(normalizeEnvValue(process.env.ECC_GATEGUARD));
}

function normalizeForMatch(value) {
  return String(value || '')
    .replace(/\\/g, '/')
    .toLowerCase();
}

function isClaudeSettingsPath(filePath) {
  const normalized = normalizeForMatch(filePath);
  return /(^|\/)\.claude\/settings(?:\.[^/]+)?\.json$/.test(normalized);
}

function isSubagentInvocation(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const candidates = [
    data.agent_id,
    data.agentId,
    data.parent_tool_use_id,
    data.parentToolUseId
  ];

  return candidates.some(candidate => typeof candidate === 'string' && candidate.trim());
}

module.exports = {
  normalizeEnvValue,
  isGateGuardDisabled,
  normalizeForMatch,
  isClaudeSettingsPath,
  isSubagentInvocation
};
