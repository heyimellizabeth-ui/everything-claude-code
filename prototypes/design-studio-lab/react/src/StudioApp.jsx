/* global React */
// The published Design Studio page: the Lab's Studio view plus the mod's other views.
const { FONTS } = require('../../engine/data');
const { jsEngine } = require('../../engine/color');
const studio = require('../../engine/studio');
const { useStudioState } = require('./hooks');
const { Controls } = require('./Controls.jsx');
const { Preview } = require('./Preview.jsx');
const { ReviewGate } = require('./ReviewGate.jsx');
const { AccentWheel } = require('./AccentWheel.jsx');
const { Output } = require('./Output.jsx');
const { Capabilities, Chains, Preferences, Health } = require('./Views.jsx');

const VIEWS = [['studio', 'Studio'], ['capabilities', 'Capabilities'], ['chains', 'Chains'], ['preferences', 'Preferences'], ['health', 'Health']];
const VIEW_KEY = 'uds-studio-view';

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

function StudioApp() {
  const [S, patch] = useStudioState();
  const [view, setViewRaw] = React.useState(() => { try { const v = localStorage.getItem(VIEW_KEY); return VIEWS.some(([id]) => id === v) ? v : 'studio'; } catch (_e) { return 'studio'; } });
  const setView = (v) => { setViewRaw(v); try { localStorage.setItem(VIEW_KEY, v); } catch (_e) { /* ignore */ } };
  const eng = jsEngine;
  return (
    <div className="wrap">
      <header className="top">
        <div>
          <p className="eyebrow">Unified design system</p>
          <h1>Design Studio</h1>
          <p className="sub">Brief, dials, accent and review gate, with the chains, capabilities, preferences and health checks from the Design Studio mod.</p>
        </div>
        <nav className="seg views" aria-label="View">
          {VIEWS.map(([id, name]) => <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>{name}</button>)}
        </nav>
      </header>
      {view === 'studio' && <Studio S={S} patch={patch} eng={eng} />}
      {view === 'capabilities' && <Capabilities S={S} />}
      {view === 'chains' && <Chains S={S} />}
      {view === 'preferences' && <Preferences />}
      {view === 'health' && <Health />}
    </div>
  );
}

module.exports = { StudioApp };
