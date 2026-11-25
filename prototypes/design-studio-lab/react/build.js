'use strict';
// Builds react/src into one self-contained HTML file: out/studio-lab.html.
// Run from the repo root:  node prototypes/design-studio-lab/react/build.js
// Needs esbuild (npx downloads it).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const here = __dirname;
const root = path.join(here, '..');
const livePath = process.env.LIVE_HTML; // optional: the live studio's HTML, for the size comparison

const app = execFileSync('npx', ['--yes', 'esbuild@0.25.0', path.join(here, 'src', 'main.jsx'), '--bundle', '--minify',
  '--format=iife', '--jsx-factory=React.createElement', '--jsx-fragment=React.Fragment', '--target=es2019'], { encoding: 'utf8' });
const sizes = { app: Buffer.byteLength(app), live: livePath ? fs.statSync(livePath).size : 35694 };

const html = fs.readFileSync(path.join(here, 'template.html'), 'utf8')
  .replace('/*SIZES*/', JSON.stringify(sizes))
  .replace('/*APP*/', () => app.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync(path.join(root, 'out'), { recursive: true });
fs.writeFileSync(path.join(root, 'out', 'studio-lab.html'), html);
console.log('out/studio-lab.html', (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB', sizes);
