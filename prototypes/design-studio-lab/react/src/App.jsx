/* global React */
const { FONTS } = require('../../engine/data');
const { jsEngine } = require('../../engine/color');
const { loadWasmEngine } = require('../../engine/wasm');
const studio = require('../../engine/studio');
const { useStudioState } = require('./hooks');
const { Controls } = require('./Controls.jsx');
const { Preview } = require('./Preview.jsx');
const { ReviewGate } = require('./ReviewGate.jsx');
const { AccentWheel } = require('./AccentWheel.jsx');
const { Output } = require('./Output.jsx');
const { Compare } = require('./Compare.jsx');

function useEngines() {
  const [rs, setRs] = React.useState(null);
  const [err, setErr] = React.useState(null);
  React.useEffect(() => {
    try {
      const bin = atob(window.__UDS_WASM__ || '');
      const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
      loadWasmEngine(bytes).then(setRs, e => setErr(String(e && e.message || e)));
    } catch (e) { setErr(String(e && e.message || e)); }
  }, []);
  return { js: jsEngine, rs, err };
}

function Read({ S }) {
  return <p className="read">{studio.readParts(S).map(([text, em], i) => (em ? <em key={i}>{text}</em> : text))}</p>;
}

function Studio({ S, patch, eng }) {
  const t = studio.tokens(eng, S);
  const f = FONTS.find(x => x.id === S.font) || FONTS[0];
  const checks = studio.checks(eng, S, t);
  return (
    <div className="grid">
      <Controls S={S} patch={patch} />
      <main className="right">
        <section className="panel" aria-label="Design read"><span className="label">Design read</span><Read S={S} /></section>
        <Preview S={S} vars={studio.previewVars(S, t, f)} />
        <ReviewGate S={S} patch={patch} eng={eng} checks={checks} />
        <AccentWheel S={S} patch={patch} eng={eng} />
        <Output S={S} patch={patch} text={studio.output(eng, S)} />
      </main>
    </div>
  );
}

function App() {
  const [S, patch] = useStudioState();
  const engines = useEngines();
  const [view, setView] = React.useState('studio');
  const [which, setWhich] = React.useState('js');
  const eng = which === 'rs' && engines.rs ? engines.rs : engines.js;
  return (
    <div className="wrap">
      <header className="top">
        <div>
          <p className="eyebrow">Sandbox prototype</p>
          <h1>Design Studio Lab</h1>
          <p className="sub">The Unified Design Studio rebuilt in React, with a colour engine you can switch to Rust. The live studio is unchanged.</p>
        </div>
        <div className="bar">
          <div className="seg" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={view === 'studio'} aria-pressed={view === 'studio'} onClick={() => setView('studio')}>Studio</button>
            <button type="button" role="tab" aria-selected={view === 'compare'} aria-pressed={view === 'compare'} onClick={() => setView('compare')}>Compare</button>
          </div>
          <div className="seg" role="group" aria-label="Colour engine">
            <button type="button" aria-pressed={which === 'js'} onClick={() => setWhich('js')}>JavaScript</button>
            <button type="button" aria-pressed={which === 'rs'} disabled={!engines.rs} title={engines.err ? 'Rust engine unavailable: ' + engines.err : ''} onClick={() => setWhich('rs')}>Rust (WASM)</button>
          </div>
          <span className="engine-note">{engines.rs ? 'Engine: ' + eng.name : engines.err ? 'Rust engine blocked here, using JavaScript' : 'Loading Rust engine…'}</span>
        </div>
      </header>
      {view === 'studio' ? <Studio S={S} patch={patch} eng={eng} /> : <Compare engines={engines} />}
    </div>
  );
}

module.exports = { App };
