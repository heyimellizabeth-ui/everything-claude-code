'use strict';
// Pure studio logic: state in, tokens / checks / text out. No DOM, so it is unit-tested
// and shared by the React UI. `eng` is either the JS or the Rust (WASM) colour engine.
const { KINDS, FONTS, PRESETS } = require('./data');
const { hue } = require('./color');

const DEFAULT_STATE = { project: 'Sockwave', kind: 'landing', preset: 'soft', dials: [7, 6, 4], accent: PRESETS.soft.accent, font: 'fraunces', mode: 'light', tab: 'prompt' };

function darkAccent(eng, accent, darkBg) {
  return eng.contrast(accent, darkBg) < 4.5 ? eng.mix(accent, '#ffffff', 0.35) : accent;
}

function tokens(eng, S) {
  const p = PRESETS[S.preset], pal = p[S.mode];
  const accent = S.mode === 'dark' ? darkAccent(eng, S.accent, pal.bg) : S.accent;
  const onAccent = eng.contrast('#ffffff', accent) >= eng.contrast('#111111', accent) ? '#ffffff' : '#111111';
  const [v, m, d] = S.dials;
  return { p, pal, accent, onAccent, v, m, d, space: Math.round(22 - d * 1.4), radius: p.radius, dur: m <= 2 ? 0 : Math.round(60 + m * 40) };
}

function previewVars(S, t, f) {
  const sym = t.v <= 4;
  return {
    '--p-bg': t.pal.bg, '--p-surface': t.pal.surface, '--p-text': t.pal.text, '--p-muted': t.pal.muted, '--p-border': t.pal.border,
    '--p-accent': t.accent, '--p-on-accent': t.onAccent,
    '--p-display': f.display, '--p-body': f.body, '--p-dw': String(f.dw),
    '--p-radius': t.radius + 'px', '--p-bw': t.p.bw + 'px',
    '--p-shadow': S.mode === 'dark' ? t.p.shadowDark : t.p.shadow,
    '--p-space': t.space + 'px', '--p-track': t.p.track, '--p-case': t.p.upper ? 'uppercase' : 'none',
    '--p-dur': t.dur + 'ms', '--p-lift': t.m >= 4 ? '-' + Math.min(6, Math.round(t.m / 2)) + 'px' : '0px',
    '--p-hero-cols': sym ? 'minmax(0,1fr)' : (t.v >= 8 ? 'minmax(0,1.6fr) minmax(0,1fr)' : 'minmax(0,1.2fr) minmax(0,1fr)'),
    '--p-align': sym ? 'center' : 'left', '--p-justify': sym ? 'center' : 'flex-start', '--p-pmargin': sym ? 'auto' : '0',
    '--p-h': 'clamp(28px, ' + (3 + t.v * 0.45).toFixed(1) + 'vw, ' + (34 + t.v * 5) + 'px)'
  };
}

const VIBE = { soft: 'soft, premium', minimal: 'calm editorial', brutalist: 'raw brutalist', product: 'quiet product-tool', trust: 'plain trust-first' };
// Returns [text, emphasised] parts so the UI can highlight without innerHTML.
function readParts(S) {
  const kind = KINDS.find(k => k.id === S.kind), p = PRESETS[S.preset];
  return [['Reading this as: ', false], [kind.name.toLowerCase(), true], [' for ' + kind.audience + ', with a ', false], [VIBE[S.preset], true],
    [' language, leaning toward the ', false], [p.name, true], [' preset. Dials ' + S.dials.join('/') + '.', false]];
}
function readText(S) { return readParts(S).map(x => x[0]).join(''); }

function checks(eng, S, t) {
  const kind = KINDS.find(k => k.id === S.kind);
  const body = eng.contrast(t.pal.text, t.pal.bg), muted = eng.contrast(t.pal.muted, t.pal.bg);
  const btn = eng.contrast(t.onAccent, t.accent), acc = eng.contrast(t.accent, t.pal.bg);
  const h = hue(S.accent);
  const busy = (S.kind === 'dashboard' || S.kind === 'public') && S.dials[1] > 4;
  const slop = h.s > 0.45 && h.h >= 230 && h.h <= 290;
  const grade = (x) => (x >= 4.5 ? 'ok' : x >= 3 ? 'warn' : 'bad');
  return [
    { id: 'body', name: 'Body text contrast', state: body >= 4.5 ? 'ok' : 'bad', detail: body.toFixed(1) + ':1, needs 4.5:1' },
    { id: 'muted', name: 'Muted text contrast', state: grade(muted), detail: muted.toFixed(1) + ':1, needs 4.5:1' },
    { id: 'button', name: 'Button label on accent', state: grade(btn), detail: btn.toFixed(1) + ':1, needs 4.5:1' },
    { id: 'link', name: 'Accent as link colour', state: grade(acc), detail: acc.toFixed(1) + ':1 on background' },
    { id: 'motion', name: 'Motion fits the job', state: busy ? 'warn' : 'ok', detail: busy ? 'High motion on a ' + kind.name.toLowerCase() : 'Reduced motion respected' },
    { id: 'slop', name: 'AI-slop default', state: slop ? 'warn' : 'ok', detail: slop ? 'Purple-blue accent is the generic default' : 'Accent avoids the stock purple' }
  ];
}

function cssTokens(eng, S, t, f) {
  const p = t.p, L = p.light, D = p.dark, sp = t.space;
  return ':root {\n' +
    '  --color-bg: ' + L.bg + ';\n  --color-surface: ' + L.surface + ';\n  --color-text: ' + L.text + ';\n  --color-text-muted: ' + L.muted + ';\n  --color-border: ' + L.border + ';\n  --color-accent: ' + S.accent + ';\n' +
    '  --font-display: ' + f.display + ';\n  --font-body: ' + f.body + ';\n' +
    '  --space-1: ' + Math.round(sp / 2) + 'px;\n  --space-2: ' + sp + 'px;\n  --space-3: ' + sp * 2 + 'px;\n  --space-4: ' + sp * 3 + 'px;\n' +
    '  --radius: ' + t.radius + 'px;\n  --border-width: ' + p.bw + 'px;\n  --shadow: ' + p.shadow.replace(/var\(--p-text\)/g, 'var(--color-text)') + ';\n' +
    '  --duration: ' + t.dur + 'ms;\n}\n\n' +
    '@media (prefers-color-scheme: dark) {\n  :root {\n    --color-bg: ' + D.bg + ';\n    --color-surface: ' + D.surface + ';\n    --color-text: ' + D.text + ';\n    --color-text-muted: ' + D.muted + ';\n    --color-border: ' + D.border + ';\n    --color-accent: ' + darkAccent(eng, S.accent, D.bg) + ';\n  }\n}\n\n' +
    '@media (prefers-reduced-motion: reduce) {\n  :root { --duration: 0ms; }\n}\n';
}

function output(eng, S) {
  const t = tokens(eng, S), f = FONTS.find(x => x.id === S.font) || FONTS[0], p = t.p, read = readText(S);
  if (S.tab === 'css') return cssTokens(eng, S, t, f);
  if (S.tab === 'master') {
    return '# Design System: ' + (S.project || 'Project') + '\n\n## 1. Design read\n' + read + '\nPreset: ' + p.name + '\nDials: VARIANCE ' + S.dials[0] + ' / MOTION ' + S.dials[1] + ' / DENSITY ' + S.dials[2] + '\n\n' +
      '## 2. Colour tokens\n| Token | Light | Dark | Use |\n|---|---|---|---|\n' +
      '| --color-bg | ' + p.light.bg + ' | ' + p.dark.bg + ' | page background |\n| --color-surface | ' + p.light.surface + ' | ' + p.dark.surface + ' | cards, panels |\n| --color-text | ' + p.light.text + ' | ' + p.dark.text + ' | body text |\n| --color-text-muted | ' + p.light.muted + ' | ' + p.dark.muted + ' | secondary text |\n| --color-accent | ' + S.accent + ' | ' + darkAccent(eng, S.accent, p.dark.bg) + ' | primary actions |\n| --color-border | ' + p.light.border + ' | ' + p.dark.border + ' | dividers |\n\n' +
      '## 3. Typography\nDisplay: ' + f.display.split(',')[0].replace(/"/g, '') + ' (weight ' + f.dw + (p.upper ? ', uppercase' : '') + ')\nBody: ' + f.body.split(',')[0].replace(/"/g, '') + '\nGoogle Fonts: https://fonts.googleapis.com/css2?family=' + f.gf + '&display=swap\n\n' +
      '## 4. Spacing, radius, shadow\nSpacing scale: ' + [Math.round(t.space / 2), t.space, t.space * 2, t.space * 3].join(' / ') + 'px\nRadius: ' + t.radius + 'px\nBorder: ' + p.bw + 'px\nShadow: ' + (p.shadow === 'none' ? 'none' : 'one level, see tokens') + '\n\n' +
      '## 5. Components\n' + (S.kind === 'dashboard' || S.kind === 'app' ? 'Astryx (React) via astryx-components, theme matched to these tokens.' : 'Native HTML and CSS variables unless the project already has a component library.') + '\n\n' +
      '## 6. Motion\nDuration: ' + t.dur + 'ms' + (t.dur === 0 ? ' (static)' : '') + '. Animate state changes only. Always respect prefers-reduced-motion.\n\n' +
      '## 7. Never do\n' + p.never.map(x => '- ' + x).join('\n') + '\n- Purple-to-blue gradient defaults\n- Cards inside cards\n';
  }
  return 'Use the unified-design-system skill for ' + (S.project || 'this project') + '.\n\n' + read + '\n\nPreset: ' + p.name + '\nAccent: ' + S.accent + '\nFonts: ' + f.name + '\nDials: VARIANCE ' + S.dials[0] + ' / MOTION ' + S.dials[1] + ' / DENSITY ' + S.dials[2] + '\n\nIf design-system/MASTER.md does not exist yet, create it from these choices before building. Run the review gate before calling it done. Log what I like or reject to design-system/PREFERENCES.md so the next build remembers it.';
}

module.exports = { DEFAULT_STATE, tokens, previewVars, readParts, readText, checks, output };
