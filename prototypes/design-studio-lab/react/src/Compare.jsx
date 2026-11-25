/* global React */
const SIZES = (typeof window !== 'undefined' && window.__UDS_SIZES__) || {};
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

const ROWS = [
  ['What it is', 'One HTML file with a hand-written render() that rebuilds the DOM on each change.', 'Small components (Controls, Preview, ReviewGate, Output) over a pure, tested engine. Built into one HTML file.'],
  ['Page weight', kb(SIZES.live || 0) + ', no libraries.', kb(SIZES.app || 0) + ' of our code plus React from a CDN (about 45 KB gzipped, cached).'],
  ['Changing it', 'Every feature touches the one render() function. Logic and DOM are mixed, so it has no tests.', 'Each feature is one component. The engine has unit tests and can be reused by the skill or a CLI.'],
  ['Speed', 'Fast enough. Redraws everything on each keystroke.', 'Same speed for people. React only redraws what changed.'],
  ['What it unlocks', 'Nothing new without growing the single function.', 'Fix-accent button and accessible accent wheel took about 60 lines. Next easy wins: saved projects, side-by-side presets, undo.'],
  ['What it costs', 'Nothing today. Gets harder with every feature.', 'A build step (esbuild, under a second) before publishing.']
];

function Compare() {
  return (
    <div className="right">
      <section className="panel" aria-label="Recommendation">
        <span className="label">Recommendation</span>
        <p className="read">Move the studio to <em>React</em>. Same look, same outputs, and each new feature becomes a small, tested piece.</p>
      </section>
      <section className="panel" aria-label="Side by side">
        <span className="label">Side by side</span>
        <div className="tablewrap">
          <table className="cmp">
            <thead><tr><th></th><th>Live studio (today)</th><th>React prototype</th></tr></thead>
            <tbody>{ROWS.map(r => <tr key={r[0]}><th scope="row">{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="panel" aria-label="Found while porting">
        <span className="label">Found while porting</span>
        <p style={{ margin: 0 }}>The live studio's default Soft accent, #c2577a, scores 4.4:1 under a button label and 4.1:1 as a link, so its own review gate shows two Checks out of the box. The Brutalist orange fails as a link at 2.9:1. The new Fix accent button suggests #bd4a70 for Soft, which passes everything and looks almost the same.</p>
        <p style={{ margin: '10px 0 0' }}>The live studio also styles its Copy button and the preview's hero text with the same class name, so the hero text block is painted in the accent colour and its paragraph is hard to read. Splitting the page into components made the clash obvious. It is fixed here.</p>
      </section>
    </div>
  );
}

module.exports = { Compare };
