/* global React */
const { PRESETS } = require('../../engine/data');

const LABEL = { ok: 'Pass', warn: 'Check', bad: 'Fail' };

function ReviewGate({ S, patch, eng, checks }) {
  const accentIssue = checks.some(c => (c.id === 'button' || c.id === 'link') && c.state !== 'ok');
  const bg = PRESETS[S.preset].light.bg;
  const fix = accentIssue ? eng.fixAccent(S.accent, bg) : null;
  return (
    <section className="panel" aria-label="Review gate">
      <div className="out-head">
        <span className="label" style={{ margin: 0 }}>Review gate (live)</span>
        {fix && fix !== S.accent && (
          <button type="button" className="fix" onClick={() => patch({ accent: fix })}>
            <i style={{ background: fix }} /> Fix accent to {fix}
          </button>
        )}
      </div>
      <div className="checks">
        {checks.map(c => (
          <div className="check" key={c.id}>
            <span className={'pill ' + c.state}>{LABEL[c.state]}</span>
            <div><b>{c.name}</b><span className="d">{c.detail}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

module.exports = { ReviewGate };
