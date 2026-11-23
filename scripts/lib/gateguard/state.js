/**
 * Per-session state for the GateGuard fact-forcing hook: which files and
 * commands have already passed the gate. Atomic writes, bounded size.
 * Extracted from scripts/hooks/gateguard-fact-force.js.
 *
 * The hook creates a store each time it is loaded, so the state directory
 * is resolved from the environment at hook load time (as before the split).
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// State expires after 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const READ_HEARTBEAT_MS = 60 * 1000;

// Maximum checked entries to prevent unbounded growth
const MAX_CHECKED_ENTRIES = 500;
const MAX_SESSION_KEYS = 50;
const ROUTINE_BASH_SESSION_KEY = '__bash_session__';

function defaultStateDir() {
  return process.env.GATEGUARD_STATE_DIR || path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.gateguard');
}

function hashSessionKey(prefix, value) {
  return `${prefix}-${crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24)}`;
}

function sanitizeSessionKey(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const sanitized = raw.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (sanitized && sanitized.length <= 64) {
    return sanitized;
  }

  return hashSessionKey('sid', raw);
}

function resolveSessionKey(data) {
  const directCandidates = [data && data.session_id, data && data.sessionId, data && data.session && data.session.id, process.env.CLAUDE_SESSION_ID, process.env.ECC_SESSION_ID];

  for (const candidate of directCandidates) {
    const sanitized = sanitizeSessionKey(candidate);
    if (sanitized) {
      return sanitized;
    }
  }

  const transcriptPath = (data && (data.transcript_path || data.transcriptPath)) || process.env.CLAUDE_TRANSCRIPT_PATH;
  if (transcriptPath && String(transcriptPath).trim()) {
    return hashSessionKey('tx', path.resolve(String(transcriptPath).trim()));
  }

  const projectFingerprint = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  return hashSessionKey('proj', path.resolve(projectFingerprint));
}

function pruneCheckedEntries(checked) {
  if (checked.length <= MAX_CHECKED_ENTRIES) {
    return checked;
  }

  const preserved = checked.includes(ROUTINE_BASH_SESSION_KEY) ? [ROUTINE_BASH_SESSION_KEY] : [];
  const sessionKeys = checked.filter(k => k.startsWith('__') && k !== ROUTINE_BASH_SESSION_KEY);
  const fileKeys = checked.filter(k => !k.startsWith('__'));
  const remainingSessionSlots = Math.max(MAX_SESSION_KEYS - preserved.length, 0);
  const cappedSession = sessionKeys.slice(-remainingSessionSlots);
  const remainingFileSlots = Math.max(MAX_CHECKED_ENTRIES - preserved.length - cappedSession.length, 0);
  const cappedFiles = fileKeys.slice(-remainingFileSlots);
  return [...preserved, ...cappedSession, ...cappedFiles];
}

function createStateStore(stateDir = defaultStateDir()) {
  let activeStateFile = null;

  function resetStateFile() {
    activeStateFile = null;
  }

  function getStateFile(data) {
    if (!activeStateFile) {
      const sessionKey = resolveSessionKey(data);
      activeStateFile = path.join(stateDir, `state-${sessionKey}.json`);
    }
    return activeStateFile;
  }

  function loadState() {
    const stateFile = getStateFile();
    try {
      if (fs.existsSync(stateFile)) {
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        const lastActive = state.last_active || 0;
        if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
          try {
            fs.unlinkSync(stateFile);
          } catch (_) {
            /* ignore */
          }
          return { checked: [], last_active: Date.now() };
        }
        return state;
      }
    } catch (_) {
      /* ignore */
    }
    return { checked: [], last_active: Date.now() };
  }

  function saveState(state) {
    const stateFile = getStateFile();
    let tmpFile = null;
    try {
      fs.mkdirSync(stateDir, { recursive: true });

      let mergedChecked = Array.isArray(state.checked) ? state.checked : [];
      let mergedLastActive = typeof state.last_active === 'number' ? state.last_active : 0;

      try {
        if (fs.existsSync(stateFile)) {
          const diskState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
          if (Array.isArray(diskState.checked)) {
            mergedChecked = Array.from(new Set([...diskState.checked, ...mergedChecked]));
          }
          if (typeof diskState.last_active === 'number') {
            mergedLastActive = Math.max(mergedLastActive, diskState.last_active);
          }
        }
      } catch (_) {
        /* ignore malformed or transient disk state */
      }

      const finalState = {
        checked: pruneCheckedEntries(mergedChecked),
        last_active: Math.max(mergedLastActive, Date.now())
      };

      // Atomic write: temp file + rename prevents partial reads
      tmpFile = `${stateFile}.tmp.${process.pid}.${crypto.randomBytes(4).toString('hex')}`;
      fs.writeFileSync(tmpFile, JSON.stringify(finalState, null, 2), 'utf8');
      try {
        fs.renameSync(tmpFile, stateFile);
      } catch (error) {
        if (error && (error.code === 'EEXIST' || error.code === 'EPERM')) {
          try {
            fs.unlinkSync(stateFile);
          } catch (_) {
            /* ignore */
          }
          fs.renameSync(tmpFile, stateFile);
        } else {
          throw error;
        }
      }
      tmpFile = null;
      return true;
    } catch (_) {
      if (tmpFile) {
        try {
          fs.unlinkSync(tmpFile);
        } catch (_) {
          /* ignore */
        }
      }
      return false;
    }
  }

  function markChecked(key) {
    const state = loadState();
    if (!state.checked.includes(key)) {
      state.checked.push(key);
      return saveState(state);
    }
    return true;
  }

  function isChecked(key) {
    const state = loadState();
    const found = state.checked.includes(key);
    if (found && Date.now() - (state.last_active || 0) > READ_HEARTBEAT_MS) {
      saveState(state);
    }
    return found;
  }

  // Prune stale session files older than 1 hour
  function pruneStaleFiles() {
    try {
      const files = fs.readdirSync(stateDir);
      const now = Date.now();
      for (const f of files) {
        const isStateFile = f.startsWith('state-') && (f.endsWith('.json') || f.includes('.json.tmp.'));
        if (!isStateFile) continue;
        const fp = path.join(stateDir, f);
        try {
          const stat = fs.statSync(fp);
          if (now - stat.mtimeMs > SESSION_TIMEOUT_MS * 2) {
            fs.unlinkSync(fp);
          }
        } catch (_) {
          // Ignore files that disappear between readdir/stat/unlink.
        }
      }
    } catch (_) {
      /* ignore */
    }
  }

  return {
    stateDir,
    resetStateFile,
    getStateFile,
    loadState,
    saveState,
    markChecked,
    isChecked,
    pruneStaleFiles
  };
}

module.exports = {
  SESSION_TIMEOUT_MS,
  READ_HEARTBEAT_MS,
  MAX_CHECKED_ENTRIES,
  MAX_SESSION_KEYS,
  ROUTINE_BASH_SESSION_KEY,
  defaultStateDir,
  hashSessionKey,
  sanitizeSessionKey,
  resolveSessionKey,
  pruneCheckedEntries,
  createStateStore
};
