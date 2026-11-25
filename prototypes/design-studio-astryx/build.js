// Bundles the spike into one self-contained HTML file: node build.js
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

// Keep only CSS rules whose class names appear in the bundled JS, plus rules with no class
// selector (variables, reset). StyleX emits atomic classes, so unused components drop out.
function trimCss(css, code) {
  const postcss = require('postcss');
  const used = new Set(code.match(/[A-Za-z_][\w-]*/g));
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    if (rule.parent && rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
    const keep = rule.selectors.filter((sel) => {
      const classes = sel.match(/\.([A-Za-z_][\w-]*)/g) || [];
      return classes.every((c) => used.has(c.slice(1)));
    });
    if (keep.length) rule.selectors = keep; else rule.remove();
  });
  root.walkAtRules((at) => { if (at.nodes && at.nodes.length === 0) at.remove(); });
  return root.toString();
}

const res = esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'entry.jsx')],
  bundle: true, minify: true, write: false, format: 'iife', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' }
});
const js = res.outputFiles[0].text;
const fullCss = fs.readFileSync(require.resolve('@astryxdesign/core/astryx.css'), 'utf8');
const astryxCss = trimCss(fullCss, js);
const theme = fs.readFileSync(path.join(__dirname, 'theme.css'), 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Astryx spike</title>
<style>${astryxCss}\n${theme}</style></head><body><div id="root"></div>
<script>${js.replace(/<\/script/g, '<\\/script')}</script></body></html>`;
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'spike.html'), html);
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1);
const gz = (s) => (require('zlib').gzipSync(s).length / 1024).toFixed(1);
console.log(`JS ${kb(js)} KB, Astryx CSS ${kb(astryxCss)} KB, page ${kb(html)} KB (${gz(html)} KB gzipped)`);
