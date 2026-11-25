/* global React */
const { timed } = require('./hooks');

const SIZES = (typeof window !== 'undefined' && window.__UDS_SIZES__) || {};
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

// [name, note, work, repeats]: tiny tasks are repeated so the browser's coarse timer can see them.
const CASES = [
  ['One review-gate pass', 'six contrast checks, what runs on every change', (e) => { for (let i = 0; i < 6; i++) e.contrast('#6b5f6c', '#fbf9fb'); }, 2000],
  ['Accent wheel, 36 hues', 'the swatch row on the Studio tab', (e) => e.wheelChecksum('#fbf9fb', 36, 0.65), 20],
  ['Accent wheel, 3,600 hues', 'bulk palette search, a future feature', (e) => e.wheelChecksum('#fbf9fb', 3600, 0.65), 1]
];
const fmt = (ms) => (ms < 0.01 ? (ms * 1000).toFixed(1) + ' µs' : ms.toFixed(2) + ' ms');
const ratio = (js, rs) => (js >= rs ? (js / rs).toFixed(1) + '× faster' : (rs / js).toFixed(1) + '× slower');

function Bench({ engines }) {
  const [rows, setRows] = React.useState(null);
  const run = () => {
    const out = CASES.map(([name, note, fn, reps]) => {
      const many = (e) => { for (let i = 0; i < reps; i++) fn(e); };
      const best = (e) => { for (let i = 0; i < 5; i++) many(e); return Math.min(...Array.from({ length: 9 }, () => timed(() => many(e)).ms)) / reps; };
      return { name, note, js: best(engines.js), rs: engines.rs ? best(engines.rs) : null };
    });
    setRows(out);
  };
  return (
    <section className="panel" aria-label="Speed test">
      <div className="out-head">
        <span className="label" style={{ margin: 0 }}>Speed test in your browser</span>
        <button type="button" className="copy-btn" onClick={run}>{rows ? 'Run again' : 'Run speed test'}</button>
      </div>
      {!engines.rs && <p className="hint">The Rust engine could not start in this viewer, so only JavaScript can be timed here.</p>}
      <div className="tablewrap">
        <table className="cmp num">
          <thead><tr><th>Task</th><th>JavaScript</th><th>Rust (WASM)</th><th>Rust is</th></tr></thead>
          <tbody>
            {(rows || CASES.map(([name, note]) => ({ name, note }))).map(r => (
              <tr key={r.name}>
                <td><b>{r.name}</b><span className="d">{r.note}</span></td>
                <td>{r.js == null ? '–' : fmt(r.js)}</td>
                <td>{r.rs == null ? '–' : fmt(r.rs)}</td>
                <td>{r.js == null || r.rs == null ? '–' : ratio(r.js, r.rs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">Best of 9 runs, per task. On the build machine Rust was 1.4× faster in Node, but 1.3 to 2× slower than JavaScript in Chromium, because the browser compiles this kind of maths very well and each call into WASM has a small cost. A review-gate pass takes microseconds either way and a frame is 16 ms, so the engine is never the slow part today.</p>
    </section>
  );
}

const ROWS = [
  ['What it is', 'One HTML file with a hand-written render() that rebuilds the DOM on each change.', 'Small components (Controls, Preview, ReviewGate, Output) over a pure, tested engine. Built into one HTML file.', 'The same React UI, with the colour maths swapped for a Rust crate compiled to WebAssembly.'],
  ['Page weight', kb(SIZES.live || 0) + ', no libraries.', kb(SIZES.app || 0) + ' of our code plus React from a CDN (about 45 KB gzipped, cached).', 'React version plus ' + kb(SIZES.wasm || 0) + ' of WASM (embedded).'],
  ['Changing it', 'Every feature touches the one render() function. Logic and DOM are mixed, so it has no tests.', 'Each feature is one component. The engine has 5 unit tests and can be reused by the skill or a CLI.', 'Two languages to keep in step. A parity test checks Rust and JS agree on every colour.'],
  ['Speed', 'Fast enough. Redraws everything on each keystroke.', 'Same speed for people. React only redraws what changed.', 'Within about 40% of JavaScript either way, and slower in some browsers. Nobody would notice.'],
  ['What it unlocks', 'Nothing new without growing the single function.', 'Fix-accent button and accessible accent wheel took about 60 lines. Next easy wins: saved projects, side-by-side presets, undo.', 'One colour engine shared by this page and the ecc2 Rust control plane, so the terminal dashboard and the studio grade colours the same way.'],
  ['What it costs', 'Nothing today. Gets harder with every feature.', 'A build step (esbuild, under a second) before publishing.', 'Rust toolchain and the wasm target, plus the build step. Some viewers may block WASM.']
];

function Compare({ engines }) {
  return (
    <div className="right">
      <section className="panel" aria-label="Recommendation">
        <span className="label">Recommendation</span>
        <p className="read">Move the studio to <em>React</em> and keep the colour maths in JavaScript. Keep the <em>Rust engine</em> on this branch for the day ecc2 needs the same checks in the terminal.</p>
        <p className="hint">Rewriting the whole UI in Rust (Leptos or Dioxus) was not built: it would mean a full rewrite, a 200 KB or larger download, and slower changes, for no visible gain on a page this size.</p>
      </section>
      <section className="panel" aria-label="Side by side">
        <span className="label">Side by side</span>
        <div className="tablewrap">
          <table className="cmp">
            <thead><tr><th></th><th>Live studio (today)</th><th>React prototype</th><th>React + Rust engine</th></tr></thead>
            <tbody>{ROWS.map(r => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <Bench engines={engines} />
      <section className="panel" aria-label="Found while porting">
        <span className="label">Found while porting</span>
        <p style={{ margin: 0 }}>The live studio's default Soft accent, #c2577a, scores 4.4:1 under a button label and 4.1:1 as a link, so its own review gate shows two Checks out of the box. The Brutalist orange fails as a link at 2.9:1. The new Fix accent button suggests #bd4a70 for Soft, which passes everything and looks almost the same.</p>
        <p style={{ margin: '10px 0 0' }}>The live studio also styles its Copy button and the preview's hero text with the same class name, so the hero text block is painted in the accent colour and its paragraph is hard to read. Splitting the page into components made the clash obvious. It is fixed here.</p>
      </section>
    </div>
  );
}

module.exports = { Compare };
