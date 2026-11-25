/* global React */
const { KINDS, FONTS, PRESETS, DIALS } = require('../../engine/data');
const { validHex } = require('../../engine/color');

function Dial({ dial, value, onChange }) {
  const id = 'd-' + dial.id;
  return (
    <div className="dial">
      <label htmlFor={id}>{dial.name}</label>
      <span className="v">{value}</span>
      <input type="range" id={id} min="1" max="10" step="1" value={value} onChange={e => onChange(+e.target.value)} />
      <span className="ends"><span>{dial.lo}</span><span>{dial.hi}</span></span>
    </div>
  );
}

function PresetButton({ id, p, active, onPick }) {
  return (
    <button type="button" className="preset" aria-pressed={active} onClick={() => onPick(id)}>
      <span className="swatches">{[p.light.bg, p.light.text, p.accent, p.dark.bg].map((c, i) => <i key={i} style={{ background: c }} />)}</span>
      <b>{p.name}</b>
      <small>{p.blurb}</small>
    </button>
  );
}

function Controls({ S, patch }) {
  const [hexDraft, setHexDraft] = React.useState(null);
  const pickKind = (id) => { const k = KINDS.find(x => x.id === id); const p = PRESETS[k.preset]; patch({ kind: id, dials: k.dials.slice(), preset: k.preset, accent: p.accent, font: p.font }); };
  const pickPreset = (id) => patch({ preset: id, accent: PRESETS[id].accent, font: PRESETS[id].font });
  const setDial = (i, v) => patch(prev => { const dials = prev.dials.slice(); dials[i] = v; return { dials }; });
  const onHex = (v) => { setHexDraft(v); const t = v.trim(); if (validHex(t)) patch({ accent: (t[0] === '#' ? t : '#' + t).toLowerCase() }); };

  return (
    <aside className="panel controls" aria-label="Design controls">
      <div>
        <label className="label" htmlFor="project">Project name</label>
        <input type="text" id="project" value={S.project} onChange={e => patch({ project: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="kind">What are you building?</label>
        <select id="kind" value={S.kind} onChange={e => pickKind(e.target.value)}>
          {KINDS.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
      </div>
      <div>
        <span className="label">Preset</span>
        <div className="presets" role="group" aria-label="Style preset">
          {Object.entries(PRESETS).map(([id, p]) => <PresetButton key={id} id={id} p={p} active={S.preset === id} onPick={pickPreset} />)}
        </div>
      </div>
      <div>
        <span className="label">Dials</span>
        {DIALS.map((d, i) => <Dial key={d.id} dial={d} value={S.dials[i]} onChange={v => setDial(i, v)} />)}
      </div>
      <div>
        <span className="label">Brand accent and fonts</span>
        <div className="row" style={{ marginBottom: 10 }}>
          <input type="color" id="accent" aria-label="Accent colour" value={S.accent} onChange={e => { setHexDraft(null); patch({ accent: e.target.value }); }} />
          <input type="text" id="accentHex" aria-label="Accent hex value" className="mono" value={hexDraft ?? S.accent} onChange={e => onHex(e.target.value)} onBlur={() => setHexDraft(null)} />
        </div>
        <select id="fonts" aria-label="Font pairing" value={S.font} onChange={e => patch({ font: e.target.value })}>
          {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <span className="label">Preview theme</span>
        <div className="seg" role="group" aria-label="Preview theme">
          <button type="button" id="mLight" aria-pressed={S.mode === 'light'} onClick={() => patch({ mode: 'light' })}>Light</button>
          <button type="button" id="mDark" aria-pressed={S.mode === 'dark'} onClick={() => patch({ mode: 'dark' })}>Dark</button>
        </div>
      </div>
    </aside>
  );
}

module.exports = { Controls };
