'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { scaffold } = require('../../scripts/site-template/scaffold');
const { validate } = require('../../scripts/site-template/validate');

const TEMPLATE_DIR = path.resolve(__dirname, '../../templates/portfolio');
const EXAMPLE_CONFIG = path.join(TEMPLATE_DIR, 'brand.config.json');
const SCAFFOLD_CLI = path.resolve(__dirname, '../../scripts/site-template/scaffold.js');

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
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-portfolio-'));
}

function cleanTmp(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log('\n=== scaffold: portfolio template ===\n');

test('portfolio scaffold writes the full page set', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out, 'portfolio');
    const files = fs.readdirSync(out);
    for (const f of ['index.html', 'work.html', 'about.html', 'contact.html', '404.html',
      'robots.txt', 'sitemap.xml', '.htaccess', 'form-handler.php', 'brand.config.json']) {
      assert(files.includes(f), `${f} missing from output`);
    }
  } finally {
    cleanTmp(out);
  }
});

test('portfolio scaffold skips template docs (README.md)', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out, 'portfolio');
    assert(!fs.existsSync(path.join(out, 'README.md')), 'README.md should not be scaffolded');
  } finally {
    cleanTmp(out);
  }
});

test('portfolio output contains no unsubstituted {{TOKEN}}s (validate passes)', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out, 'portfolio');
    let caught = null;
    try { validate(out, null); } catch (e) { caught = e; }
    assert(!caught, `validate threw: ${caught}`);
  } finally {
    cleanTmp(out);
  }
});

test('portfolio scaffold substitutes owner and palette values', () => {
  const out = tmpDir();
  try {
    scaffold(EXAMPLE_CONFIG, out, 'portfolio');
    const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    const idx = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
    assert(idx.includes(cfg.owner.name), `${cfg.owner.name} not found in index.html`);
    assert(idx.includes(cfg.colors.light.accent), `light accent ${cfg.colors.light.accent} not found`);
    assert(idx.includes(cfg.colors.dark.accent), `dark accent ${cfg.colors.dark.accent} not found`);
    assert(idx.includes(`lang="${cfg.site.lang}"`), 'lang attribute not substituted');
  } finally {
    cleanTmp(out);
  }
});

test('portfolio scaffold rejects a config missing owner fields', () => {
  const out = tmpDir();
  const cfgPath = path.join(out, 'bad.json');
  try {
    fs.mkdirSync(out, { recursive: true });
    const base = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
    delete base.owner;
    fs.writeFileSync(cfgPath, JSON.stringify(base), 'utf8');
    const res = spawnSync(process.execPath,
      [SCAFFOLD_CLI, '--config', cfgPath, '--out', path.join(out, 'site'), '--template', 'portfolio'],
      { encoding: 'utf8' });
    assert(res.status === 1, `expected exit 1, got ${res.status}`);
    assert(/missing required fields/.test(res.stderr), `unexpected stderr: ${res.stderr}`);
  } finally {
    cleanTmp(out);
  }
});

test('unknown template name exits with the available list', () => {
  const out = tmpDir();
  try {
    const res = spawnSync(process.execPath,
      [SCAFFOLD_CLI, '--config', EXAMPLE_CONFIG, '--out', path.join(out, 'site'), '--template', 'nope'],
      { encoding: 'utf8' });
    assert(res.status === 1, `expected exit 1, got ${res.status}`);
    assert(/Unknown template/.test(res.stderr), `unexpected stderr: ${res.stderr}`);
    assert(/portfolio/.test(res.stderr), 'available-template list should mention portfolio');
  } finally {
    cleanTmp(out);
  }
});

test('default template stays queer-nightclub (back-compat)', () => {
  const out = tmpDir();
  try {
    const nightclubConfig = path.resolve(__dirname, '../../templates/queer-nightclub/brand.config.json');
    scaffold(nightclubConfig, out);
    assert(fs.existsSync(path.join(out, 'events.html')), 'nightclub events.html missing under default template');
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
