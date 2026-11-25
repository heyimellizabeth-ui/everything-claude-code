'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { scaffold, buildTokenMap, applyTokens, accentInk, textSafe, contrastRatio } = require('../../plugins/studio-kit/scripts/site-template/scaffold');
const { validate } = require('../../plugins/studio-kit/scripts/site-template/validate');

const TEMPLATE_DIR = path.resolve(__dirname, '../../plugins/studio-kit/templates/queer-nightclub');
const EXAMPLE_CONFIG = path.join(TEMPLATE_DIR, 'brand.config.json');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-scaffold-'));
}

function cleanTmp(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ── buildTokenMap ───────────────────────────────────────────────────────────

console.log('\n=== buildTokenMap ===\n');

test('produces expected tokens from config', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  const map = buildTokenMap(cfg);
  assert(map['{{SITE_NAME}}'] === cfg.site.name, 'SITE_NAME mismatch');
  assert(map['{{SITE_DOMAIN}}'] === cfg.site.domain, 'SITE_DOMAIN mismatch');
  assert(map['{{COLOR_ACCENT}}'] === cfg.colors.accent, 'COLOR_ACCENT mismatch');
  assert(map['{{VENUE_CITY}}'] === cfg.venue.city, 'VENUE_CITY mismatch');
  assert(map['{{SOCIAL_INSTAGRAM}}'] === cfg.social.instagram, 'SOCIAL_INSTAGRAM mismatch');
  assert(map['{{FORMS_BACKEND}}'] === cfg.forms.backend, 'FORMS_BACKEND mismatch');
  assert(map['{{TICKET_URL}}'] === cfg.ticketUrl, 'TICKET_URL mismatch');
});

test('all tokens map to strings (required tokens non-empty)', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  const map = buildTokenMap(cfg);
  const required = ['{{SITE_NAME}}', '{{SITE_DOMAIN}}', '{{COLOR_ACCENT}}', '{{VENUE_CITY}}', '{{FORMS_BACKEND}}'];
  for (const [token, value] of Object.entries(map)) {
    assert(typeof value === 'string', `${token} is not a string`);
  }
  for (const token of required) {
    assert(map[token] && map[token].length > 0, `required ${token} maps to empty string`);
  }
});

// ── applyTokens ─────────────────────────────────────────────────────────────

console.log('\n=== applyTokens ===\n');

test('substitutes a single token', () => {
  const result = applyTokens('Hello {{SITE_NAME}}!', { '{{SITE_NAME}}': 'Club Test' });
  assert(result === 'Hello Club Test!', `got: ${result}`);
});

test('substitutes multiple occurrences of the same token', () => {
  const result = applyTokens('{{SITE_NAME}} / {{SITE_NAME}}', { '{{SITE_NAME}}': 'X' });
  assert(result === 'X / X', `got: ${result}`);
});

test('substitutes multiple different tokens', () => {
  const result = applyTokens('{{A}} and {{B}}', { '{{A}}': 'foo', '{{B}}': 'bar' });
  assert(result === 'foo and bar', `got: ${result}`);
});

test('returns content unchanged when no tokens present', () => {
  const result = applyTokens('no tokens here', { '{{SITE_NAME}}': 'X' });
  assert(result === 'no tokens here', `got: ${result}`);
});

test('handles empty token map', () => {
  const result = applyTokens('{{SITE_NAME}}', {});
  assert(result === '{{SITE_NAME}}', `got: ${result}`);
});

// ── scaffold ────────────────────────────────────────────────────────────────

console.log('\n=== scaffold (integration) ===\n');

test('scaffold creates output directory and files', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    const files = fs.readdirSync(out);
    assert(files.length > 0, 'no files written');
    assert(files.includes('index.html'), 'index.html missing');
    assert(files.includes('about.html'), 'about.html missing');
    assert(files.includes('brand.config.json'), 'brand.config.json not copied to output');
  } finally {
    cleanTmp(out);
  }
});

test('scaffold output contains no unsubstituted {{TOKEN}} in HTML files', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    const htmlFiles = fs.readdirSync(out).filter(f => f.endsWith('.html'));
    for (const file of htmlFiles) {
      const content = fs.readFileSync(path.join(out, file), 'utf8');
      const tokens = content.match(/\{\{[A-Z_]+\}\}/g);
      assert(!tokens, `${file} still has tokens: ${(tokens || []).join(', ')}`);
    }
  } finally {
    cleanTmp(out);
  }
});

test('scaffold substitutes SITE_NAME throughout', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    const idx = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
    assert(idx.includes(cfg.site.name), `${cfg.site.name} not found in index.html`);
  } finally {
    cleanTmp(out);
  }
});

test('scaffold substitutes accent color in HTML', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    const idx = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
    assert(idx.includes(cfg.colors.accent), `accent color ${cfg.colors.accent} not found`);
  } finally {
    cleanTmp(out);
  }
});

test('scaffold with renamed brand produces no original brand strings in HTML', () => {
  const out = tmpDir();
  const cfgPath = path.join(out, 'test-brand.json');
  try {
    fs.mkdirSync(out, { recursive: true });
    const base = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    base.site.name = 'Club Test';
    base.site.short = 'TEST';
    base.site.domain = 'clubtest.nl';
    fs.writeFileSync(cfgPath, JSON.stringify(base), 'utf8');
    scaffold(cfgPath, out);
    const htmlFiles = fs.readdirSync(out).filter(f => f.endsWith('.html'));
    for (const file of htmlFiles) {
      const content = fs.readFileSync(path.join(out, file), 'utf8');
      assert(!content.includes('CLUB KUDT'), `${file} still has CLUB KUDT`);
      assert(!content.includes('clubkudt.nl'), `${file} still has clubkudt.nl`);
    }
  } finally {
    cleanTmp(out);
  }
});

test('scaffold copies brand.config.json into output', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    const copied = path.join(out, 'brand.config.json');
    assert(fs.existsSync(copied), 'brand.config.json not in output');
    const original = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    const copy = JSON.parse(fs.readFileSync(copied, 'utf8'));
    assert(copy.site.name === original.site.name, 'brand.config.json content mismatch');
  } finally {
    cleanTmp(out);
  }
});

// ── validate ────────────────────────────────────────────────────────────────

console.log('\n=== validate ===\n');

test('validate passes on clean scaffold output', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    // validate should not throw or exit — we capture by not crashing
    let caught = null;
    try { validate(out, null); } catch (e) { caught = e; }
    assert(!caught, `validate threw: ${caught}`);
  } finally {
    cleanTmp(out);
  }
});

test('validate catches remaining {{TOKEN}} in a file', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    // Inject a fake token
    const idx = path.join(out, 'index.html');
    fs.appendFileSync(idx, '\n<!-- {{LEFTOVER_TOKEN}} -->');
    let exited = false;
    const origExit = process.exit;
    process.exit = () => { exited = true; throw new Error('exit called'); };
    try { validate(out, null); } catch (_) { /* expected: stubbed process.exit throws */ }
    process.exit = origExit;
    assert(exited, 'validate did not call process.exit on leftover token');
  } finally {
    cleanTmp(out);
  }
});

// ── accent ink ──────────────────────────────────────────────────────────────

console.log('\n=== accent ink (text on accent fills) ===\n');

const luminance = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

test('accent ink reaches 4.5:1 on the default brand', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  const ink = buildTokenMap(cfg)['{{COLOR_ACCENT_INK}}'];
  assert(ratio(ink, cfg.colors.accent) >= 4.5, `ink ${ink} on ${cfg.colors.accent} is ${ratio(ink, cfg.colors.accent).toFixed(2)}:1`);
});

test('accent ink follows the accent: a green accent takes the dark colour, a dark accent the light one', () => {
  const colors = { void: '#101826', cream: '#F2EFE6' };
  assert(accentInk({ ...colors, accent: '#38C172' }) === colors.void, 'green accent should take the dark colour');
  assert(accentInk({ ...colors, accent: '#101010' }) === colors.cream, 'dark accent should take the light colour');
});

test('accent ink falls back to the light colour for a non-hex value', () => {
  assert(accentInk({ void: '#000000', cream: '#FFFFFF', accent: 'rebeccapurple' }) === '#FFFFFF', 'non-hex accent should fall back');
});

test('accent ink reaches 4.5:1 even for a mid-tone accent where neither brand colour does', () => {
  const crimson = { void: '#0A0003', cream: '#F5ECED', accent: '#DC143C' };
  const blue = { void: '#0B1020', cream: '#F2F4FA', accent: '#3B6CFF' };
  for (const colors of [crimson, blue]) {
    const ink = accentInk(colors);
    assert(contrastRatio(ink, colors.accent) >= 4.5, `ink ${ink} on ${colors.accent} is ${contrastRatio(ink, colors.accent).toFixed(2)}:1`);
  }
});

test('textSafe leaves a readable colour alone and lifts an unreadable one on both backgrounds', () => {
  const colors = { void: '#0D0D0D', cream: '#F5F0E8', surface: '#1A1A1A' };
  assert(textSafe('#948B7A', colors) === '#948B7A', 'a readable colour should be unchanged');
  const lifted = textSafe('#555555', colors);
  assert(lifted !== '#555555', 'an unreadable colour should change');
  for (const bg of [colors.void, colors.surface]) {
    assert(contrastRatio(lifted, bg) >= 4.5, `${lifted} on ${bg} is ${contrastRatio(lifted, bg).toFixed(2)}:1`);
  }
});

test('textSafe handles three-digit hex, light schemes and non-hex values', () => {
  const light = { void: '#F5F5F5', cream: '#111111', surface: '#E8E8E8' };
  const fixed = textSafe('#999', light);
  assert(contrastRatio(fixed.length === 4 ? '#999999' : fixed, '#E8E8E8') >= 4.5, `light scheme: ${fixed}`);
  assert(textSafe('rebeccapurple', light) === 'rebeccapurple', 'non-hex value should be returned as is');
});

test('every Design Studio colour preset scaffolds readable accent text, muted text and button text', () => {
  const studio = fs.readFileSync(path.resolve(__dirname, '../../projects/design-studio/index.html'), 'utf8');
  const block = /const COLOR_PRESETS = \{([\s\S]*?)\n\};/.exec(studio);
  assert(block, 'COLOR_PRESETS not found in the Design Studio');
  const re = /(\w+):\s*\{\s*void:\s*'([^']+)',\s*cream:\s*'([^']+)',\s*accent:\s*'([^']+)',\s*surface:\s*'([^']+)',\s*muted:\s*'([^']+)'\s*\}/g;
  let count = 0;
  let m;
  while ((m = re.exec(block[1]))) {
    count++;
    const [, name, v, cr, ac, su, mu] = m;
    const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    cfg.colors = { void: v, cream: cr, accent: ac, surface: su, muted: mu };
    const map = buildTokenMap(cfg);
    const expand = (h) => (h.length === 4 ? '#' + h.slice(1).split('').map((c) => c + c).join('') : h);
    const checks = [
      ['accent ink on accent', map['{{COLOR_ACCENT_INK}}'], [ac]],
      ['accent text', map['{{COLOR_ACCENT_TEXT}}'], [v, su]],
      ['muted text', map['{{COLOR_MUTED_TEXT}}'], [v, su]],
    ];
    for (const [label, fg, bgs] of checks) {
      for (const bg of bgs) {
        const r = contrastRatio(expand(fg), expand(bg));
        assert(r >= 4.5, `${name}: ${label} ${fg} on ${bg} is ${r.toFixed(2)}:1`);
      }
    }
  }
  assert(count >= 16, `expected at least 16 presets, found ${count}`);
});

// ── new token groups ────────────────────────────────────────────────────────

console.log('\n=== new tokens (fonts, sections, reviews, modules) ===\n');

test('font tokens use configured values', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.fonts = { heading: 'Syne', body: 'Inter' };
  const map = buildTokenMap(cfg);
  assert(map['{{FONT_HEADING}}'] === 'Syne', `FONT_HEADING: ${map['{{FONT_HEADING}}']}`);
  assert(map['{{FONT_BODY}}'] === 'Inter', `FONT_BODY: ${map['{{FONT_BODY}}']}`);
  assert(map['{{FONT_GOOGLE_LINK}}'].includes('fonts.googleapis.com'), 'FONT_GOOGLE_LINK missing googleapis');
  assert(map['{{FONT_GOOGLE_LINK}}'].includes('Syne'), 'FONT_GOOGLE_LINK missing Syne');
});

test('font tokens fall back to system-ui when fonts absent', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  delete cfg.fonts;
  const map = buildTokenMap(cfg);
  assert(map['{{FONT_HEADING}}'].includes('system-ui'), `FONT_HEADING fallback: ${map['{{FONT_HEADING}}']}`);
  assert(map['{{FONT_BODY}}'].includes('system-ui'), `FONT_BODY fallback: ${map['{{FONT_BODY}}']}`);
  assert(map['{{FONT_GOOGLE_LINK}}'] === '', 'FONT_GOOGLE_LINK should be empty when no fonts');
});

test('section flags return display:none for disabled sections', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.sections = { gallery: false, newsletter: true };
  const map = buildTokenMap(cfg);
  assert(map['{{SECTION_GALLERY}}'] === 'display:none', `SECTION_GALLERY: ${map['{{SECTION_GALLERY}}']}`);
  assert(map['{{SECTION_NEWSLETTER}}'] === '', `SECTION_NEWSLETTER: ${map['{{SECTION_NEWSLETTER}}']}`);
});

test('section flags default to empty string when sections key absent', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  delete cfg.sections;
  const map = buildTokenMap(cfg);
  assert(map['{{SECTION_EVENTS}}'] === '', `SECTION_EVENTS should default empty: ${map['{{SECTION_EVENTS}}']}`);
  assert(map['{{SECTION_GALLERY}}'] === '', `SECTION_GALLERY should default empty: ${map['{{SECTION_GALLERY}}']}`);
});

test('scaffold skips pages whose section flag is false', () => {
  const out = tmpDir();
  const cfgPath = path.join(out, 'cfg.json');
  try {
    fs.mkdirSync(out, { recursive: true });
    const base = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    base.sections = { gallery: false };
    fs.writeFileSync(cfgPath, JSON.stringify(base), 'utf8');
    scaffold(cfgPath, out);
    assert(!fs.existsSync(path.join(out, 'gallery.html')), 'gallery.html should be skipped');
    assert(fs.existsSync(path.join(out, 'index.html')), 'index.html should still exist');
  } finally {
    cleanTmp(out);
  }
});

test('reviews token serialises array as JSON', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.reviews = [{ author: 'Test', text: 'Great night', rating: 5, source: 'google' }];
  const map = buildTokenMap(cfg);
  const parsed = JSON.parse(map['{{REVIEWS_JSON}}']);
  assert(Array.isArray(parsed), 'REVIEWS_JSON is not an array');
  assert(parsed[0].author === 'Test', 'review author mismatch');
});

test('reviews token is empty array JSON when reviews absent', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  delete cfg.reviews;
  const map = buildTokenMap(cfg);
  assert(map['{{REVIEWS_JSON}}'] === '[]', `REVIEWS_JSON: ${map['{{REVIEWS_JSON}}']}`);
});

test('module enabled returns empty string flag', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.modules = { calendar: { enabled: true, type: 'ra-embed' } };
  const map = buildTokenMap(cfg);
  assert(map['{{MODULE_CALENDAR}}'] === '', `MODULE_CALENDAR enabled should be '': ${map['{{MODULE_CALENDAR}}']}`);
  assert(map['{{MODULE_CALENDAR_TYPE}}'] === 'ra-embed', `MODULE_CALENDAR_TYPE: ${map['{{MODULE_CALENDAR_TYPE}}']}`);
});

test('module disabled returns display:none flag', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.modules = { checkout: { enabled: false, url: 'https://buy.stripe.com/test' } };
  const map = buildTokenMap(cfg);
  assert(map['{{MODULE_CHECKOUT}}'] === 'display:none', `MODULE_CHECKOUT: ${map['{{MODULE_CHECKOUT}}']}`);
});

test('module tokens absent when modules key missing', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  delete cfg.modules;
  const map = buildTokenMap(cfg);
  assert(map['{{MODULE_CALENDAR}}'] === 'display:none', 'MODULE_CALENDAR should default to hidden');
  assert(map['{{MODULE_PLANNER}}'] === 'display:none', 'MODULE_PLANNER should default to hidden');
});

// ── layout tokens ───────────────────────────────────────────────────────────

console.log('\n=== layout tokens ===\n');

test('layout tokens use configured values', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.layout = { hero: 'split', nextEvent: 'banner', footer: 'minimal' };
  const map = buildTokenMap(cfg);
  assert(map['{{LAYOUT_HERO}}'] === 'split', `LAYOUT_HERO: ${map['{{LAYOUT_HERO}}']}`);
  assert(map['{{LAYOUT_NEXT_EVENT}}'] === 'banner', `LAYOUT_NEXT_EVENT: ${map['{{LAYOUT_NEXT_EVENT}}']}`);
  assert(map['{{LAYOUT_FOOTER}}'] === 'minimal', `LAYOUT_FOOTER: ${map['{{LAYOUT_FOOTER}}']}`);
});

test('layout tokens fall back to defaults when layout key absent', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  delete cfg.layout;
  const map = buildTokenMap(cfg);
  assert(map['{{LAYOUT_HERO}}'] === 'full-bleed', `LAYOUT_HERO default: ${map['{{LAYOUT_HERO}}']}`);
  assert(map['{{LAYOUT_NEXT_EVENT}}'] === 'card', `LAYOUT_NEXT_EVENT default: ${map['{{LAYOUT_NEXT_EVENT}}']}`);
  assert(map['{{LAYOUT_FOOTER}}'] === 'standard', `LAYOUT_FOOTER default: ${map['{{LAYOUT_FOOTER}}']}`);
});

test('scaffold output contains no unsubstituted LAYOUT tokens', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out);
    const idx = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
    assert(!idx.includes('{{LAYOUT_'), 'No {{LAYOUT_ tokens remain in index.html');
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});

// ── error handling ──────────────────────────────────────────────────────────

console.log('\n=== error handling ===\n');

test('scaffold exits on missing config file', () => {
  const out = tmpDir();
  try {
    let exited = false;
    const origExit = process.exit;
    process.exit = () => { exited = true; throw new Error('exit called'); };
    try { scaffold('/nonexistent/brand-config.json', out); } catch (_) { /* expected: stubbed process.exit throws */ }
    process.exit = origExit;
    assert(exited, 'process.exit not called for missing config');
  } finally {
    cleanTmp(out);
  }
});

test('scaffold exits on invalid JSON in config', () => {
  const out = tmpDir();
  const cfgPath = path.join(out, 'bad.json');
  try {
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(cfgPath, '{ not valid json }', 'utf8');
    let exited = false;
    const origExit = process.exit;
    process.exit = () => { exited = true; throw new Error('exit called'); };
    try { scaffold(cfgPath, out); } catch (_) { /* expected: stubbed process.exit throws */ }
    process.exit = origExit;
    assert(exited, 'process.exit not called for invalid JSON');
  } finally {
    cleanTmp(out);
  }
});

test('scaffold handles config with all optional keys absent', () => {
  const out = tmpDir();
  const cfgPath = path.join(out, 'minimal.json');
  try {
    fs.mkdirSync(out, { recursive: true });
    const base = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    delete base.fonts;
    delete base.sections;
    delete base.reviews;
    delete base.images;
    delete base.modules;
    delete base.layout;
    delete base.seo;
    fs.writeFileSync(cfgPath, JSON.stringify(base), 'utf8');
    scaffold(cfgPath, out);
    assert(fs.existsSync(path.join(out, 'index.html')), 'index.html missing with minimal config');
  } finally {
    cleanTmp(out);
  }
});

test('applyTokens handles token value containing $ (no regex substitution)', () => {
  const result = applyTokens('{{A}}', { '{{A}}': '$100' });
  assert(result === '$100', `got: ${result}`);
});

test('applyTokens with two-token map substitutes all tokens sequentially', () => {
  // Each token in the map is applied once in sequence
  // If {{A}} → {{B}} and {{B}} → 'replaced', {{A}} becomes 'replaced' because {{B}} is also in the map
  const result = applyTokens('{{A}} {{B}}', { '{{A}}': '{{B}}', '{{B}}': 'replaced' });
  assert(result === 'replaced replaced', `got: ${result}`);
});

test('buildTokenMap with unicode site name produces valid string tokens', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.site.name = '클럽 테스트 ' + String.fromCodePoint(0x1F3B5);
  const map = buildTokenMap(cfg);
  assert(typeof map['{{SITE_NAME}}'] === 'string', 'SITE_NAME not a string');
  assert(map['{{SITE_NAME}}'] === '클럽 테스트 ' + String.fromCodePoint(0x1F3B5), 'SITE_NAME mismatch');
});

test('REVIEWS_JSON token escapes </script> tags to prevent injection', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.reviews = [{ author: 'Test', text: '</script><script>alert(1)</script>', rating: 5, source: 'google' }];
  const map = buildTokenMap(cfg);
  assert(!map['{{REVIEWS_JSON}}'].includes('</script>'), 'unescaped </script> found in REVIEWS_JSON');
  assert(map['{{REVIEWS_JSON}}'].includes('<\\/script>'), 'escaped form not found in REVIEWS_JSON');
});

test('scaffold with all non-index pages disabled still creates index.html', () => {
  const out = tmpDir();
  const cfgPath = path.join(out, 'cfg.json');
  try {
    fs.mkdirSync(out, { recursive: true });
    const base = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    base.sections = { index: true, events: false, about: false, gallery: false, contact: false,
      hero: true, 'next-event': true, newsletter: true, instagram: true, manifesto: false,
      'footer-social': true, 'footer-nav': true, 'footer-bpm': true };
    fs.writeFileSync(cfgPath, JSON.stringify(base), 'utf8');
    scaffold(cfgPath, out);
    assert(fs.existsSync(path.join(out, 'index.html')), 'index.html missing when other pages disabled');
    assert(!fs.existsSync(path.join(out, 'events.html')), 'events.html should not exist');
    assert(!fs.existsSync(path.join(out, 'gallery.html')), 'gallery.html should not exist');
  } finally {
    cleanTmp(out);
  }
});

// ── Results ─────────────────────────────────────────────────────────────────

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) process.exit(1);
