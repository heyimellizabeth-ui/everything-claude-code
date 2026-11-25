/* global React */
const { FONTS } = require('../../engine/data');
const { jsEngine } = require('../../engine/color');
const studio = require('../../engine/studio');
const { useStudioState } = require('./hooks');
const { Controls } = require('./Controls.jsx');
const { Preview } = require('./Preview.jsx');
const { ReviewGate } = require('./ReviewGate.jsx');
const { AccentWheel } = require('./AccentWheel.jsx');
const { Output } = require('./Output.jsx');
const { Compare } = require('./Compare.jsx');

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
  const [view, setView] = React.useState('studio');
  const eng = jsEngine;
  return (
    <div className="wrap">
      <header className="top">
        <div>
          <p className="eyebrow">Sandbox prototype</p>
          <h1>Design Studio Lab</h1>
          <p className="sub">The Unified Design Studio rebuilt in React, with two new accent tools. The live studio is unchanged.</p>
        </div>
        <div className="bar">
          <div className="seg" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={view === 'studio'} aria-pressed={view === 'studio'} onClick={() => setView('studio')}>Studio</button>
            <button type="button" role="tab" aria-selected={view === 'compare'} aria-pressed={view === 'compare'} onClick={() => setView('compare')}>Compare</button>
          </div>
        </div>
      </header>
      {view === 'studio' ? <Studio S={S} patch={patch} eng={eng} /> : <Compare />}
    </div>
  );
}

module.exports = { App };
