'use strict';
// Builds the published Design Studio page: out/design-studio.html.
// Same template and components as the Lab, plus the mod's Capabilities, Chains, Preferences and Health views.
// Run from the repo root:  node prototypes/design-studio-lab/react/build-studio.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const here = __dirname;
const root = path.join(here, '..');
const repo = path.join(root, '..', '..');

const cat = JSON.parse(fs.readFileSync(path.join(repo, 'docs', 'capabilities.json'), 'utf8'));
const short = s => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > 160 ? `${t.slice(0, 159)}…` : t; };
const caps = {
  generated: fs.statSync(path.join(repo, 'docs', 'capabilities.json')).mtime.toISOString().slice(0, 10),
  items: cat.capabilities.map(c => ({ id: c.id, kind: c.kind, name: c.name, invoke: c.invoke, repo: c.repo, group: c.group, description: short(c.description) })),
};

const app = execFileSync('npx', ['--yes', 'esbuild@0.25.0', path.join(here, 'src', 'studio-main.jsx'), '--bundle', '--minify',
  '--format=iife', '--jsx-factory=React.createElement', '--jsx-fragment=React.Fragment', '--target=es2019'], { encoding: 'utf8' });

const safe = s => s.replace(/<\/script/gi, '<\\/script');
const html = fs.readFileSync(path.join(here, 'template.html'), 'utf8')
  .replace('<title>Design Studio Lab</title>', '<title>Design Studio</title>')
  .replace('/*SIZES*/', () => `{}; window.__UDS_CAPS__ = ${safe(JSON.stringify(caps))}`)
  .replace('</style>', () => fs.readFileSync(path.join(here, 'studio-views.css'), 'utf8') + '</style>')
  .replace('/*APP*/', () => safe(app));
fs.mkdirSync(path.join(root, 'out'), { recursive: true });
fs.writeFileSync(path.join(root, 'out', 'design-studio.html'), html);
console.log('out/design-studio.html', (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB', caps.items.length, 'capabilities');
