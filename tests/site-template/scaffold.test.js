'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { scaffold, buildTokenMap, applyTokens } = require('../../scripts/site-template/scaffold');
const { validate } = require('../../scripts/site-template/validate');

const TEMPLATE_DIR = path.resolve(__dirname, '../../templates/queer-nightclub');
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
    try { validate(out, null); } catch (_) {}
    process.exit = origExit;
    assert(exited, 'validate did not call process.exit on leftover token');
  } finally {
    cleanTmp(out);
  }
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
    try { scaffold('/nonexistent/brand-config.json', out); } catch (_) {}
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
    try { scaffold(cfgPath, out); } catch (_) {}
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
  // Build the emoji at runtime so the literal codepoint stays out of source
  // (keeps the unicode-safety checker happy) while still exercising an
  // emoji-bearing, non-ASCII site name end to end.
  const unicodeName = '클럽 테스트 ' + String.fromCodePoint(0x1F3B5);
  cfg.site.name = unicodeName;
  const map = buildTokenMap(cfg);
  assert(typeof map['{{SITE_NAME}}'] === 'string', 'SITE_NAME not a string');
  assert(map['{{SITE_NAME}}'] === unicodeName, 'SITE_NAME mismatch');
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
