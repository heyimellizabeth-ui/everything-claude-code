/* global React */
const TABS = [['prompt', 'Prompt for Claude'], ['master', 'MASTER.md'], ['css', 'CSS tokens']];

function Output({ S, patch, text }) {
  const [status, setStatus] = React.useState('');
  const pre = React.useRef(null);
  const copy = () => {
    const done = () => { setStatus('Copied'); setTimeout(() => setStatus(''), 1600); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(pre.current); const s = getSelection(); s.removeAllRanges(); s.addRange(r); setStatus('Selected, press Ctrl+C or Cmd+C'); };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (_e) { fallback(); }
  };
  return (
    <section className="panel" aria-label="Output">
      <div className="out-head">
        <div className="tabs" role="tablist">
          {TABS.map(([id, name]) => <button key={id} type="button" role="tab" aria-selected={S.tab === id} onClick={() => patch({ tab: id })}>{name}</button>)}
        </div>
        <div className="row"><span className="status" aria-live="polite">{status}</span><button type="button" className="copy-btn" onClick={copy}>Copy</button></div>
      </div>
      <pre className="code" ref={pre}>{text}</pre>
      <p className="hint">Paste the prompt into any Claude chat, or save MASTER.md as design-system/MASTER.md in your project so every build follows it.</p>
    </section>
  );
}

module.exports = { Output };
