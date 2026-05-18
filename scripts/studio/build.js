#!/usr/bin/env node
'use strict';

/**
 * Design Studio — build.js
 *
 * Bridges a studio selection.json into the existing site-template scaffold:
 *   1. Reads selection.json (contains embedded brand config + components)
 *   2. Writes the embedded brand to a temp brand.config.json
 *   3. Runs scripts/site-template/scaffold.js with that config
 *   4. Layers selected component snippets in as studio-additions.css/.js
 *   5. Injects link/script tags into the scaffolded index.html
 *   6. Validates output with scripts/site-template/validate.js (if present)
 *
 * Usage:
 *   node scripts/studio/build.js --selection <selection.json> --out <output-dir>
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const { scaffold } = require('../site-template/scaffold.js');

function usage() {
  console.error('Usage: node scripts/studio/build.js --selection <selection.json> --out <output-dir>');
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--selection') args.selection = argv[++i];
    if (argv[i] === '--out') args.out = argv[++i];
  }
  return args;
}

function classifySnippet(snippet) {
  // Heuristic: a snippet may contain HTML, CSS, and JS sections delimited by comments.
  // We split into parts based on common cues. Anything resembling CSS rules → .css,
  // anything resembling JS (function/const/let/=>/script) → .js, anything else with tags → .html.
  const css = [];
  const js = [];
  const html = [];

  // Common pattern in catalog snippets: "<!-- HTML -->...\n/* CSS */...\n// JS\n..."
  // We do a coarse split by looking for /* CSS */, // JS markers
  const cssMarker = /\/\*\s*CSS\s*\*\//i;
  const jsMarker = /\/\/\s*JS\b/i;

  let remainder = snippet;
  let cssPart = '';
  let jsPart = '';
  let htmlPart = '';

  const jsIdx = remainder.search(jsMarker);
  if (jsIdx !== -1) {
    jsPart = remainder.slice(jsIdx).replace(jsMarker, '').trim();
    remainder = remainder.slice(0, jsIdx);
  }
  const cssIdx = remainder.search(cssMarker);
  if (cssIdx !== -1) {
    cssPart = remainder.slice(cssIdx).replace(cssMarker, '').trim();
    htmlPart = remainder.slice(0, cssIdx).trim();
  } else {
    // No explicit markers — guess by content shape. Priority: HTML > CSS > JS > fallback.
    const trimmed = remainder.trim();
    const looksLikeHtml = /^\s*</.test(trimmed);
    // CSS: starts with a selector (.foo, #foo, @rule, :root, tag) followed by { ... }
    const looksLikeCss = /^\s*(?::[\w-]+|[.#@][\w-]+|[a-zA-Z][\w-]*\s*[,{])/.test(trimmed) && /\{[^}]*\}/.test(trimmed);
    // JS: function/keyword followed by space (so `--my-test-var` doesn't match), or document./window./console.
    const looksLikeJs = /(?:^|[\s;{(])(?:function\s|const\s|let\s|var\s|=>|document\.|window\.|console\.)/.test(trimmed);
    if (looksLikeHtml) htmlPart = trimmed;
    else if (looksLikeCss) cssPart = trimmed;
    else if (looksLikeJs) jsPart = trimmed;
    else htmlPart = trimmed; // fall back — keep as HTML comment block
  }

  if (cssPart) css.push(cssPart);
  if (jsPart) js.push(jsPart);
  if (htmlPart) html.push(htmlPart);
  return { css, js, html };
}

function build(selectionPath, outDir) {
  if (!fs.existsSync(selectionPath)) {
    console.error(`[studio-build] selection.json not found: ${selectionPath}`);
    process.exit(1);
  }

  let selection;
  try {
    selection = JSON.parse(fs.readFileSync(selectionPath, 'utf8'));
  } catch (e) {
    console.error(`[studio-build] invalid JSON in selection: ${e.message}`);
    process.exit(1);
  }

  if (!selection.brand) {
    console.error('[studio-build] selection.json is missing the `brand` block — re-export from the studio UI.');
    process.exit(1);
  }
  if (!Array.isArray(selection.components)) {
    console.error('[studio-build] selection.json is missing the `components` array.');
    process.exit(1);
  }

  // 1. Write brand to a temp config so scaffold.js can consume it
  const tmpConfig = path.join(os.tmpdir(), `studio-brand-${Date.now()}.json`);
  fs.writeFileSync(tmpConfig, JSON.stringify(selection.brand, null, 2));

  try {
    // 2. Run scaffold (writes the queer-nightclub template into outDir with token substitutions)
    scaffold(tmpConfig, path.resolve(outDir));
  } finally {
    try { fs.unlinkSync(tmpConfig); } catch {}
  }

  // 3. Layer in selected component snippets as additional CSS/JS/HTML files
  const allCss = [];
  const allJs = [];
  const allHtml = [];

  for (const comp of selection.components) {
    if (!comp.snippet) continue;
    const parts = classifySnippet(comp.snippet);
    const header = `\n/* ── ${comp.name} (${comp.id}) — from ${comp.source} ───────────── */\n`;
    const htmlHeader = `\n<!-- ── ${comp.name} (${comp.id}) — from ${comp.source} ── -->\n`;
    for (const c of parts.css) allCss.push(header + c);
    for (const j of parts.js) allJs.push(header + j);
    for (const h of parts.html) allHtml.push(htmlHeader + h);
  }

  const additionsCssPath = path.join(outDir, 'studio-additions.css');
  const additionsJsPath = path.join(outDir, 'studio-additions.js');
  const additionsHtmlPath = path.join(outDir, 'studio-components.html');

  if (allCss.length) {
    const header = `/* Generated by scripts/studio/build.js — ${new Date().toISOString()} */\n`;
    fs.writeFileSync(additionsCssPath, header + allCss.join('\n'));
  }
  if (allJs.length) {
    const header = `/* Generated by scripts/studio/build.js — ${new Date().toISOString()} */\n`;
    fs.writeFileSync(additionsJsPath, header + allJs.join('\n'));
  }
  if (allHtml.length) {
    const header = `<!-- Generated by scripts/studio/build.js — ${new Date().toISOString()} -->\n<!-- Paste these snippets into the relevant pages by hand -->\n`;
    fs.writeFileSync(additionsHtmlPath, header + allHtml.join('\n'));
  }

  // 4. Inject <link>/<script> tags into index.html (idempotent)
  const indexPath = path.join(outDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    if (allCss.length && !html.includes('studio-additions.css')) {
      html = html.replace(/<\/head>/i, '  <link rel="stylesheet" href="studio-additions.css">\n</head>');
    }
    if (allJs.length && !html.includes('studio-additions.js')) {
      html = html.replace(/<\/body>/i, '  <script src="studio-additions.js" defer></script>\n</body>');
    }
    fs.writeFileSync(indexPath, html);
  }

  // 5. Copy the selection.json into the output so the site remembers its lineage
  fs.copyFileSync(selectionPath, path.join(outDir, 'studio-selection.json'));

  // 6. Try to validate (best-effort — non-fatal if validator missing)
  try {
    const validatePath = path.resolve(__dirname, '..', 'site-template', 'validate.js');
    if (fs.existsSync(validatePath)) {
      const { spawnSync } = require('child_process');
      const res = spawnSync(process.execPath, [validatePath, '--dir', outDir], { stdio: 'inherit' });
      if (res.status !== 0) console.warn('[studio-build] validate reported issues (non-fatal).');
    }
  } catch {}

  const summary = {
    css: allCss.length,
    js: allJs.length,
    html: allHtml.length,
    components: selection.components.length
  };
  console.log(`[studio-build] Wrote site to ${outDir}`);
  console.log(`[studio-build]   ${summary.components} components layered in (${summary.css} CSS, ${summary.js} JS, ${summary.html} HTML)`);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.selection || !args.out) usage();
  build(path.resolve(args.selection), path.resolve(args.out));
}

module.exports = { build, classifySnippet };
