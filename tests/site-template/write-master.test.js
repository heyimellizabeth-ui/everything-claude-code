'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildMaster, writeMaster } = require('../../scripts/site-template/write-master');

const EXAMPLE_CONFIG = path.resolve(__dirname, '../../templates/queer-nightclub/brand.config.json');

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

console.log('\nwrite-master:');

test('maps the five brand colours and fonts to MASTER.md tokens', () => {
  const cfg = JSON.parse(fs.readFileSync(EXAMPLE_CONFIG, 'utf8'));
  const md = buildMaster(cfg);
  assert(md.startsWith(`# Design System: ${cfg.site.name}`), md.slice(0, 80));
  assert(md.includes(`| --color-bg | ${cfg.colors.void} |`), 'bg token');
  assert(md.includes(`| --color-accent | ${cfg.colors.accent} |`), 'accent token');
  assert(md.includes(`| --color-text-muted | ${cfg.colors.muted} |`), 'muted token');
  assert(md.includes(`Display: ${cfg.fonts.heading}`), 'display font');
  assert(md.includes('## 7. Never do'), 'never section');
});

test('writes once and keeps an existing MASTER.md unless forced', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'write-master-'));
  try {
    const first = writeMaster(EXAMPLE_CONFIG, dir);
    assert(first.written && fs.existsSync(first.path), 'first write');
    fs.writeFileSync(first.path, '# Edited by hand\n');
    const second = writeMaster(EXAMPLE_CONFIG, dir);
    assert(!second.written, 'second write must not overwrite');
    assert(fs.readFileSync(first.path, 'utf8') === '# Edited by hand\n', 'hand edits kept');
    assert(writeMaster(EXAMPLE_CONFIG, dir, { force: true }).written, 'force replaces');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

console.log(`\nPassed: ${passed}\nFailed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
