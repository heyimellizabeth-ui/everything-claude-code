#!/usr/bin/env node
/**
 * release-check.js: deterministic checks for a static-site release (a zip or folder).
 *
 *   node release-check.js structure <new.zip|dir>
 *   node release-check.js diff <old.zip|dir> <new.zip|dir>
 *   node release-check.js live <new.zip|dir> <https://example.com> [--old <old.zip|dir>]
 *
 * structure: the zip must unpack with index.html at the top (no wrapper folder),
 *            and every local href/src/url() must point at a file that exists.
 * diff:      lists added / removed / changed files. A changed CSS/JS/image/font that kept
 *            its name is an ERROR, because CDNs cache those for a long time (often a year,
 *            "immutable"), so visitors keep getting the old file. Removed files are printed
 *            as the "delete from the server" list.
 * live:      fetches every file of the release from the live site and reports which ones
 *            match, differ or are missing. With --old it also checks that removed files are
 *            gone (404). It uses curl so the system proxy settings apply.
 *
 * Exit code: 0 = no errors, 1 = errors found, 2 = bad usage.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const CACHED = /\.(css|js|mjs|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot)$/i;
const SKIP = /(^|\/)(\.git|\.hallmark|\.playwright-mcp|node_modules)(\/|$)|(^|\/)\.DS_Store$/;

function fail(msg) {
  console.error(`[release-check] ${msg}`);
  process.exit(2);
}

/** Unpack a zip into a fresh temp folder (or use a folder as is) and return the site root. */
function loadRoot(input) {
  if (!fs.existsSync(input)) fail(`not found: ${input}`);
  let dir = input;
  if (fs.statSync(input).isFile()) {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-'));
    const r = spawnSync('unzip', ['-q', input, '-d', dir], { encoding: 'utf8' });
    if (r.status !== 0) fail(`could not unzip ${input}: ${r.stderr || r.error}`);
  }
  const top = fs.readdirSync(dir).filter(n => !n.startsWith('.') && n !== '__MACOSX');
  const wrapper = !fs.existsSync(path.join(dir, 'index.html')) && top.length === 1
    && fs.statSync(path.join(dir, top[0])).isDirectory()
    && fs.existsSync(path.join(dir, top[0], 'index.html'));
  return { root: wrapper ? path.join(dir, top[0]) : dir, wrapper: wrapper ? top[0] : null };
}

function listFiles(root, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    const p = rel ? `${rel}/${e.name}` : e.name;
    if (SKIP.test(p)) continue;
    if (e.isDirectory()) out.push(...listFiles(root, p));
    else out.push(p);
  }
  return out.sort();
}

const hash = buf => crypto.createHash('sha256').update(buf).digest('hex');
const fileHash = (root, rel) => hash(fs.readFileSync(path.join(root, rel)));

/** Local references (href, src, url()) that point at files missing from the release. */
function brokenRefs(root, files) {
  const set = new Set(files);
  const broken = [];
  for (const f of files.filter(x => /\.(html?|css)$/i.test(x))) {
    const text = fs.readFileSync(path.join(root, f), 'utf8');
    const refs = [...text.matchAll(/(?:href|src)=["']([^"'#?]+)/gi), ...text.matchAll(/url\(\s*["']?([^"')#?]+)/gi)]
      .map(m => m[1].trim())
      .filter(u => u && !/^(https?:|\/\/|mailto:|tel:|data:|javascript:|#)/i.test(u));
    for (const u of refs) {
      let target;
      try {
        target = decodeURIComponent(u.startsWith('/') ? u.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(f), u)));
      } catch {
        continue;
      }
      if (target.endsWith('/')) target += 'index.html';
      if (!set.has(target)) broken.push(`${f} -> ${u}`);
    }
  }
  return [...new Set(broken)];
}

function structure(input) {
  const { root, wrapper } = loadRoot(input);
  let errors = 0;
  if (wrapper) {
    console.log(`ERROR  the zip wraps the site in a "${wrapper}/" folder: uploading it as is puts the site at /${wrapper}/. Zip the folder's contents instead.`);
    errors++;
  } else if (!fs.existsSync(path.join(root, 'index.html'))) {
    console.log('ERROR  no index.html at the top of the release');
    errors++;
  } else {
    console.log('OK     index.html is at the top of the release');
  }
  const files = listFiles(root);
  const broken = brokenRefs(root, files);
  broken.forEach(b => console.log(`ERROR  broken local reference: ${b}`));
  if (!broken.length) console.log(`OK     ${files.length} files, every local reference resolves`);
  return errors + broken.length;
}

function diff(oldInput, newInput) {
  const a = loadRoot(oldInput).root;
  const b = loadRoot(newInput).root;
  const fa = new Set(listFiles(a));
  const fb = listFiles(b);
  const added = fb.filter(f => !fa.has(f));
  const removed = [...fa].filter(f => !fb.includes(f));
  const changed = fb.filter(f => fa.has(f) && fileHash(a, f) !== fileHash(b, f));
  const inPlace = changed.filter(f => CACHED.test(f));
  inPlace.forEach(f => console.log(`ERROR  ${f} changed but kept its name: the CDN will keep serving the old copy. Rename it with a new version (e.g. style-v5.css -> style-v6.css) and update every reference.`));
  console.log(`\nChanged (${changed.length}): ${changed.join(', ') || 'none'}`);
  console.log(`Added (${added.length}): ${added.join(', ') || 'none'}`);
  console.log(`\nDelete from the server after uploading (${removed.length}):`);
  removed.forEach(f => console.log(`  - ${f}`));
  if (!removed.length) console.log('  (nothing)');
  return inPlace.length;
}

function curlGet(url) {
  const r = spawnSync('curl', ['-sL', '--max-time', '30', '-o', '-', '-w', '\n%{http_code}', url], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return { code: 0, body: Buffer.alloc(0) };
  const buf = r.stdout;
  const nl = buf.lastIndexOf(10);
  return { code: Number(buf.subarray(nl + 1).toString()), body: buf.subarray(0, nl) };
}

function live(newInput, base, oldInput) {
  const root = loadRoot(newInput).root;
  const site = base.replace(/\/+$/, '');
  const files = listFiles(root).filter(f => !/^\.htaccess$|\.md$/i.test(f));
  const tally = { same: [], differs: [], missing: [], challenge: [] };
  for (const f of files) {
    const { code, body } = curlGet(`${site}/${f.split('/').map(encodeURIComponent).join('/')}`);
    if (code === 404) tally.missing.push(f);
    else if (code !== 200) tally.differs.push(`${f} (HTTP ${code})`);
    else if (/Checking your browser|cf-challenge|captcha/i.test(body.subarray(0, 4000).toString())) tally.challenge.push(f);
    else if (hash(body) === fileHash(root, f)) tally.same.push(f);
    else tally.differs.push(f);
  }
  console.log(`Live matches the release: ${tally.same.length}/${files.length} files`);
  if (tally.differs.length) console.log(`Different online (old version, or changed by the server): ${tally.differs.join(', ')}`);
  if (tally.differs.some(f => CACHED.test(f.split(' ')[0]))) {
    console.log('NOTE   a cached asset that differs online is usually an old copy (edited in place, or not uploaded). Check its Last-Modified header; some hosts also recompress images.');
  }
  if (tally.missing.length) console.log(`Not uploaded yet (404): ${tally.missing.join(', ')}`);
  if (tally.challenge.length) console.log(`Bot check page instead of the file (verify these in a real browser): ${tally.challenge.join(', ')}`);
  let errors = tally.missing.length;
  if (oldInput) {
    const keep = new Set(listFiles(root));
    const gone = listFiles(loadRoot(oldInput).root).filter(f => !keep.has(f) && !/^\.htaccess$|\.md$/i.test(f));
    const still = gone.filter(f => curlGet(`${site}/${f.split('/').map(encodeURIComponent).join('/')}`).code === 200);
    still.forEach(f => console.log(`ERROR  ${f} was removed from the release but is still online: delete it on the server`));
    if (gone.length && !still.length) console.log(`OK     all ${gone.length} removed files are gone from the server`);
    errors += still.length;
  }
  return errors;
}

const [mode, ...args] = process.argv.slice(2);
const oldIdx = args.indexOf('--old');
const oldArg = oldIdx >= 0 ? args.splice(oldIdx, 2)[1] : null;
let errors;
if (mode === 'structure' && args.length === 1) errors = structure(args[0]);
else if (mode === 'diff' && args.length === 2) errors = diff(args[0], args[1]);
else if (mode === 'live' && args.length === 2) errors = live(args[0], args[1], oldArg);
else fail('usage: release-check.js structure <zip|dir> | diff <old> <new> | live <zip|dir> <url> [--old <zip|dir>]');
process.exit(errors ? 1 : 0);
