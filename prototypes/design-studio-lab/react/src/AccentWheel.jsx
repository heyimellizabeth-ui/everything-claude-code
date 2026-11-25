/* global React */
const { PRESETS } = require('../../engine/data');
const { timed } = require('./hooks');

function AccentWheel({ S, patch, eng }) {
  const bg = PRESETS[S.preset].light.bg;
  const { value: swatches, ms } = React.useMemo(() => timed(() => eng.wheel(bg, 36, 0.65)), [eng, bg]);
  return (
    <section className="panel" aria-label="Accessible accents">
      <div className="out-head">
        <span className="label" style={{ margin: 0 }}>Accents that pass on {PRESETS[S.preset].name}</span>
        <span className="hint" style={{ margin: 0 }}>36 hues searched by {eng.name} in {ms.toFixed(2)} ms</span>
      </div>
      <div className="wheel" role="group" aria-label="Pick a passing accent">
        {swatches.map((c, i) => (
          <button type="button" key={i} title={c} aria-label={'Use ' + c} aria-pressed={c === S.accent} style={{ background: c }} onClick={() => patch({ accent: c })} />
        ))}
      </div>
      <p className="hint">Every swatch keeps 4.5:1 as a link on the light background and under a button label. New in this prototype.</p>
    </section>
  );
}

module.exports = { AccentWheel };
