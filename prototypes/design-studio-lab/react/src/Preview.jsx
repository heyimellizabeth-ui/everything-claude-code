/* global React */
const { COPY } = require('../../engine/data');

function Preview({ S, vars }) {
  const [h, p, metric, metricLabel, cards] = COPY[S.kind];
  return (
    <section className="stage" aria-label="Live preview">
      <div className="pv" style={vars}>
        <nav><span className="logo">{S.project || 'Project'}</span><span className="links"><span>Work</span><span>About</span><span>Journal</span></span></nav>
        <div className="hero">
          <div className="copy">
            <h2>{h}</h2>
            <p>{p}</p>
            <div className="ctas"><button className="btn primary" type="button">Get started</button><button className="btn" type="button">See examples</button></div>
          </div>
          <div className="art" aria-hidden="true"><div><div className="metric">{metric}</div><small>{metricLabel}</small></div></div>
        </div>
        <div className="cards">
          {cards.map(([tag, title, body]) => (
            <div className="card" key={title}><span className="tag">{tag}</span><h3>{title}</h3><p>{body}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

module.exports = { Preview };
