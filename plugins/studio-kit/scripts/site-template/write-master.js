'use strict';

/**
 * Write design-system/MASTER.md for a scaffolded Design Studio site, so the
 * chelp chains and the unified-design-system skill have the project's tokens
 * to read. Never overwrites an existing MASTER.md unless --force is passed.
 *
 * Usage: node write-master.js --config <brand.config.json> --out <project-dir> [--force]
 */

const fs = require('fs');
const path = require('path');
const { accentInk, textSafe, contrastRatio } = require('./scaffold');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config') args.config = argv[++i];
    else if (argv[i] === '--out') args.out = argv[++i];
    else if (argv[i] === '--force') args.force = true;
  }
  return args;
}

function ratio(a, b) {
  return a && b ? `${contrastRatio(a, b).toFixed(1)}:1` : 'n/a';
}

/** Build MASTER.md text from a brand config (5 colour tokens, fonts). */
function buildMaster(cfg) {
  const c = cfg.colors || {};
  const name = (cfg.site && cfg.site.name) || 'Project';
  const fonts = cfg.fonts || {};
  const accentText = textSafe(c.accent, c);
  const rows = [
    ['--color-bg', c.void, 'page background'],
    ['--color-surface', c.surface, 'cards, panels'],
    ['--color-text', c.cream, `body text (${ratio(c.cream, c.void)} on bg)`],
    ['--color-text-muted', c.muted, `secondary text (${ratio(c.muted, c.void)} on bg)`],
    ['--color-accent', c.accent, 'fills, borders, primary actions'],
    ['--color-accent-ink', accentInk(c), 'text on an accent fill'],
    ['--color-accent-text', accentText, `accent used as text (${ratio(accentText, c.void)} on bg)`]
  ];
  return [
    `# Design System: ${name}`,
    '',
    'Written by /studio-build from `brand.config.json`. This file is the only source',
    'of brand tokens: every chain reads it first (unified-design-system step 1).',
    '',
    '## 1. Design read',
    '',
    `Reading this as: venue and events site for ${name}, with a dark, atmospheric language.`,
    'Dials: VARIANCE 7 / MOTION 5 / DENSITY 4. Change them here if the brand calls for it.',
    '',
    '## 2. Colour tokens',
    '',
    'The site is dark only; there is no light theme.',
    '',
    '| Token | Value | Use |',
    '|---|---|---|',
    ...rows.map(([t, v, u]) => `| ${t} | ${v || 'unset'} | ${u} |`),
    '',
    '## 3. Typography',
    '',
    `Display: ${fonts.heading || 'system-ui, sans-serif'}`,
    `Body: ${fonts.body || 'system-ui, sans-serif'}`,
    '',
    '## 4. Spacing, radius, shadow',
    '',
    'Taken from `templates/queer-nightclub/`. Record changes here before making them.',
    '',
    '## 5. Components',
    '',
    'Native HTML and CSS variables (static site, no build step).',
    '',
    '## 6. Motion',
    '',
    'Calm (motion dial 5): feedback 150ms, panels 300ms, short 8px fades, no choreography.',
    '',
    '| Token | Value |',
    '|---|---|',
    '| --duration-fast | 150ms |',
    '| --duration-medium | 300ms |',
    '| --ease-out | cubic-bezier(0.22, 1, 0.36, 1) |',
    '| --enter-distance | 8px |',
    '| --press-scale | 0.96 |',
    '',
    '- Animate transform and opacity only; list the properties, never `transition: all`.',
    '- Loops only for real live state.',
    '- prefers-reduced-motion removes movement and keeps fades of 150ms or less.',
    '',
    '## 7. Never do',
    '',
    '- Raw hex values in components; use the tokens above.',
    '- Accent colour as body text; use `--color-accent-text`.',
    ''
  ].join('\n');
}

/**
 * @returns {{ written: boolean, path: string }}
 */
function writeMaster(configPath, outDir, options = {}) {
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const target = path.join(outDir, 'design-system', 'MASTER.md');
  if (fs.existsSync(target) && !options.force) return { written: false, path: target };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, buildMaster(cfg));
  return { written: true, path: target };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config || !args.out) {
    console.error('Usage: node write-master.js --config <brand.config.json> --out <project-dir> [--force]');
    process.exit(1);
  }
  const result = writeMaster(path.resolve(args.config), path.resolve(args.out), { force: args.force });
  console.log(result.written ? `[write-master] wrote ${result.path}` : `[write-master] kept existing ${result.path} (use --force to replace)`);
}

module.exports = { buildMaster, writeMaster, parseArgs };
