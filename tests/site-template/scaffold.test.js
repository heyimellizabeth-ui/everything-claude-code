'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { scaffold, buildTokenMap, applyTokens, applySections, buildGoogleFontLink } = require('../../scripts/site-template/scaffold');
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

test('all tokens map to non-empty strings', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  const map = buildTokenMap(cfg);
  for (const [token, value] of Object.entries(map)) {
    assert(typeof value === 'string', `${token} is not a string`);
    // FONT_GOOGLE_LINK is intentionally empty when cfg.fonts is absent
    if (token !== '{{FONT_GOOGLE_LINK}}') {
      assert(value.length > 0, `${token} maps to empty string`);
    }
  }
});

test('includes font tokens when fonts provided', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  cfg.fonts = { heading: 'Syne', body: 'Inter' };
  const map = buildTokenMap(cfg);
  assert(map['{{FONT_HEADING}}'] === 'Syne', `FONT_HEADING: got ${map['{{FONT_HEADING}}']}`);
  assert(map['{{FONT_BODY}}'] === 'Inter', `FONT_BODY: got ${map['{{FONT_BODY}}']}`);
  assert(map['{{FONT_GOOGLE_LINK}}'].includes('googleapis.com'), 'FONT_GOOGLE_LINK missing googleapis');
  assert(map['{{FONT_GOOGLE_LINK}}'].includes('Syne'), 'FONT_GOOGLE_LINK missing Syne');
});

test('font tokens fall back safely when fonts absent', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  delete cfg.fonts;
  const map = buildTokenMap(cfg);
  assert(typeof map['{{FONT_HEADING}}'] === 'string' && map['{{FONT_HEADING}}'].length > 0,
    'FONT_HEADING fallback must be non-empty');
  assert(typeof map['{{FONT_BODY}}'] === 'string' && map['{{FONT_BODY}}'].length > 0,
    'FONT_BODY fallback must be non-empty');
  assert(map['{{FONT_GOOGLE_LINK}}'] === '', 'FONT_GOOGLE_LINK should be empty when fonts absent');
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

// ── applySections ───────────────────────────────────────────────────────────

console.log('\n=== applySections ===\n');

test('keeps block when section is true', () => {
  const result = applySections('A<!-- IF_SECTION:foo -->B<!-- /IF_SECTION -->C', { foo: true });
  assert(result === 'ABC', `got: ${result}`);
});

test('removes block when section is false', () => {
  const result = applySections('A<!-- IF_SECTION:foo -->B<!-- /IF_SECTION -->C', { foo: false });
  assert(result === 'AC', `got: ${result}`);
});

test('keeps block when section key is absent (default open)', () => {
  const result = applySections('A<!-- IF_SECTION:foo -->B<!-- /IF_SECTION -->C', {});
  assert(result === 'ABC', `got: ${result}`);
});

test('is a no-op when sections is undefined', () => {
  const content = 'A<!-- IF_SECTION:foo -->B<!-- /IF_SECTION -->C';
  const result = applySections(content, undefined);
  assert(result === content, `should be unchanged: got ${result}`);
});

// ── buildGoogleFontLink ──────────────────────────────────────────────────────

console.log('\n=== buildGoogleFontLink ===\n');

test('builds link with both fonts', () => {
  const link = buildGoogleFontLink({ heading: 'Syne', body: 'Inter' });
  assert(link.includes('googleapis.com'), 'missing googleapis');
  assert(link.includes('Syne'), 'missing Syne');
  assert(link.includes('Inter'), 'missing Inter');
});

test('deduplicates when heading and body are the same font', () => {
  const link = buildGoogleFontLink({ heading: 'Syne', body: 'Syne' });
  assert((link.match(/Syne/g) || []).length === 1, 'Syne should appear once');
});

test('returns empty string when fonts is null', () => {
  assert(buildGoogleFontLink(null) === '', 'should return empty string');
  assert(buildGoogleFontLink(undefined) === '', 'should return empty string');
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

// ── Results ─────────────────────────────────────────────────────────────────

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) process.exit(1);
