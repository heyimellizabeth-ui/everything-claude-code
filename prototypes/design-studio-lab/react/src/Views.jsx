/* global React */
// The mod's Capabilities, Chains, Preferences and Health views, for the published Design Studio page.
// Logic comes from plugins/design-studio/hooks/engine.ts so the page and the mod stay in step.
const mod = require('../../../../plugins/design-studio/hooks/engine.ts');

const CAPS = (typeof window !== 'undefined' && window.__UDS_CAPS__) || { generated: '', items: [] };
const PREFS_KEY = 'uds-studio-prefs';
const PILL = { ok: 'Good', warn: 'Check', bad: 'Fix' };
// The catalog tags each entry with a group, which is more exact than the mod's name match.
const isDesign = c => c.group === 'design';
const capabilityList = (all, query, designOnly) => {
  const q = query.trim().toLowerCase();
  return all
    .filter(c => (!designOnly || isDesign(c)) && (q === '' || `${c.name} ${c.description} ${c.repo}`.toLowerCase().includes(q)))
    .sort((a, b) => Number(isDesign(b)) - Number(isDesign(a)) || a.name.localeCompare(b.name));
};
const RULE_COLOR = { always: 'var(--good)', never: 'var(--bad)', prefer: 'var(--warn)' };

function useCopy() {
  const [status, setStatus] = React.useState('');
  const copy = (text, label) => {
    const done = () => { setStatus(label || 'Copied'); setTimeout(() => setStatus(''), 1800); };
    try { navigator.clipboard.writeText(text).then(done, () => setStatus('Copy blocked here. Select the text instead.')); } catch (_e) { setStatus('Copy blocked here. Select the text instead.'); }
  };
  return [status, copy];
}

function Capabilities({ S }) {
  const [q, setQ] = React.useState('');
  const [only, setOnly] = React.useState(true);
  const all = CAPS.items;
  const list = capabilityList(all, q, only);
  const designCount = all.filter(isDesign).length;
  return (
    <section className="panel view" aria-label="Capabilities">
      <p className="hint top-hint">{all.length} skills, commands, agents and mods across the 7 repos, {designCount} of them design. Design ones are marked ◆. Catalog from docs/capabilities.json{CAPS.generated ? `, built ${CAPS.generated}` : ''}.</p>
      <div className="row">
        <input type="text" className="search" aria-label="Search" placeholder="Search names and descriptions" value={q} onChange={e => setQ(e.target.value)} />
        <div className="seg" role="group" aria-label="Filter">
          <button type="button" aria-pressed={only} onClick={() => setOnly(true)}>Design only</button>
          <button type="button" aria-pressed={!only} onClick={() => setOnly(false)}>Everything</button>
        </div>
      </div>
      <ul className="caps">
        {list.slice(0, 200).map(c => (
          <li key={c.id}>
            <span className="mk" style={{ color: isDesign(c) ? S.accent : 'var(--muted)' }} aria-hidden="true">{isDesign(c) ? '◆' : '·'}</span>
            <div><b>{c.invoke || c.name}</b> <span className="tag">{c.kind} · {c.repo}</span><span className="d">{c.description}</span></div>
          </li>
        ))}
      </ul>
      {list.length > 200 && <p className="hint">and {list.length - 200} more. Search to narrow.</p>}
      {list.length === 0 && <p className="hint">Nothing matches.</p>}
    </section>
  );
}

function Chains({ S }) {
  const [status, copy] = useCopy();
  return (
    <section className="panel view" aria-label="Chains">
      <div className="out-head"><p className="hint top-hint">Every chain reads MASTER.md and PREFERENCES.md first and ends with the review gate. Copy a chain's prompt and paste it into Claude Code.</p><span className="status" aria-live="polite">{status}</span></div>
      <div className="chains">
        {mod.CHAINS.map(c => (
          <article key={c.id} className="chain">
            <div className="chain-head"><b>/{c.id}</b><span>{c.name}</span></div>
            <span className="d">{c.when}</span>
            <ol className="steps">{c.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            <button type="button" className="fix run" onClick={() => copy(mod.chainPrompt(S, c.id), `Copied the /${c.id} prompt`)}>Copy /{c.id} prompt</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function usePrefs() {
  const [md, setMd] = React.useState(() => { try { return localStorage.getItem(PREFS_KEY) || ''; } catch (_e) { return ''; } });
  const save = (next) => { setMd(next); try { localStorage.setItem(PREFS_KEY, next); } catch (_e) { /* storage blocked */ } };
  return [md, save];
}

function Preferences() {
  const [md, save] = usePrefs();
  const [rule, setRule] = React.useState('always');
  const [text, setText] = React.useState('');
  const [status, copy] = useCopy();
  const prefs = mod.parsePreferences(md);
  const hint = mod.promotionHint(prefs);
  const add = (e) => {
    e.preventDefault();
    const means = text.trim();
    if (!means) return;
    save(mod.addPreference(md, { date: new Date().toISOString().slice(0, 10), rule, means, words: 'added in Design Studio' }));
    setText('');
  };
  return (
    <section className="panel view" aria-label="Preferences">
      <p className="hint top-hint">What you liked or rejected, in the design-system/PREFERENCES.md format. Every build reads it first. This page keeps the log in your browser; copy it into your project's design-system/PREFERENCES.md.</p>
      {prefs.length === 0 ? <p className="hint">No preferences logged here yet.</p> : (
        <ul className="prefs">{prefs.map((p, i) => <li key={i}><b style={{ color: RULE_COLOR[p.rule] }}>{p.rule}</b><span>{p.means}</span><span className="d">{p.date}</span></li>)}</ul>
      )}
      {hint && <p className="warn-line">{hint}</p>}
      <form className="row add" onSubmit={add}>
        <select aria-label="Rule" value={rule} onChange={e => setRule(e.target.value)}>
          <option value="always">Always</option><option value="never">Never</option><option value="prefer">Prefer</option>
        </select>
        <input type="text" className="search" aria-label="What it means" placeholder="What it means, e.g. no gradients on buttons" value={text} onChange={e => setText(e.target.value)} />
        <button type="submit" className="copy-btn">Add</button>
      </form>
      <div className="row">
        <button type="button" className="fix run" disabled={!md} onClick={() => copy(md, 'Copied PREFERENCES.md')}>Copy PREFERENCES.md</button>
        <span className="status" aria-live="polite">{status}</span>
      </div>
    </section>
  );
}

function Health() {
  const [md] = usePrefs();
  // The catalog lists every repo's skills, including other repos' skills that share a retired name,
  // so it cannot say what is installed. Leave retired names out; the mod checks that in a session.
  const names = CAPS.items.filter(c => (c.kind === 'skill' || c.kind === 'command') && !mod.RETIRED.includes(c.name.split(':').pop().toLowerCase())).map(c => c.name);
  const items = mod.health(names, true, mod.parsePreferences(md));
  return (
    <section className="panel view" aria-label="Health">
      <p className="hint top-hint">Checks the catalog of all 7 repos against what the chains need. In Claude Code, the mod's Health view also checks your session and project's MASTER.md.</p>
      <div className="checks">
        {items.map((i, n) => (
          <div key={n} className="check"><span className="pill" style={{ color: i.level === 'ok' ? 'var(--good)' : i.level === 'warn' ? 'var(--warn)' : 'var(--bad)' }}>{PILL[i.level]}</span><div><span>{i.text}</span></div></div>
        ))}
      </div>
    </section>
  );
}

module.exports = { Capabilities, Chains, Preferences, Health };
