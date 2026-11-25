'use strict';
// Run: node prototypes/design-studio-lab/engine/bench.js
const fs = require('fs');
const path = require('path');
const { jsEngine } = require('./color');
const { loadWasmEngine } = require('./wasm');

(async () => {
  const rs = await loadWasmEngine(fs.readFileSync(path.join(__dirname, '..', 'rust-engine', 'target', 'wasm32-unknown-unknown', 'release', 'uds_engine.wasm')));
  const time = (fn) => { const t0 = process.hrtime.bigint(); fn(); return Number(process.hrtime.bigint() - t0) / 1e6; };
  const cases = [
    ['One review-gate pass (6 contrast checks)', (e) => { for (let i = 0; i < 6; i++) e.contrast('#6b5f6c', '#fbf9fb'); }],
    ['Accent wheel, 36 hues (what the UI shows)', (e) => e.wheelChecksum('#fbf9fb', 36, 0.65)],
    ['Accent wheel, 3,600 hues (bulk palette search)', (e) => e.wheelChecksum('#fbf9fb', 3600, 0.65)]
  ];
  for (const [label, fn] of cases) {
    for (const e of [jsEngine, rs]) for (let i = 0; i < 5; i++) fn(e); // warm up
    const ms = (e) => Math.min(...Array.from({ length: 15 }, () => time(() => fn(e))));
    const j = ms(jsEngine), r = ms(rs);
    console.log(label.padEnd(48), 'JS', j.toFixed(3).padStart(8), 'ms   Rust', r.toFixed(3).padStart(8), 'ms   ', (j / r).toFixed(1) + 'x');
  }
})();
