'use strict';
/* global React */
const { useState, useEffect } = React;
const { DEFAULT_STATE } = require('../../engine/studio');
const { PRESETS } = require('../../engine/data');

const KEY = 'uds-lab-state';
function useStudioState() {
  const [S, setS] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && PRESETS[saved.preset]) return Object.assign({}, DEFAULT_STATE, saved);
    } catch (_e) { /* storage blocked: use defaults */ }
    return DEFAULT_STATE;
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (_e) { /* ignore */ } }, [S]);
  const patch = (p) => setS(prev => Object.assign({}, prev, typeof p === 'function' ? p(prev) : p));
  return [S, patch];
}

function timed(fn) {
  const t0 = performance.now();
  const value = fn();
  return { value, ms: performance.now() - t0 };
}

module.exports = { useStudioState, timed };
