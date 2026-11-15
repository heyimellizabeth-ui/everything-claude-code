/**
 * Tests for scripts/setup-chelp-cloud.sh (dry run and failure paths only; the
 * real install is run by hand in a clean home).
 *
 * Run with: node tests/scripts/setup-chelp-cloud.test.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.resolve(__dirname, '../../scripts/setup-chelp-cloud.sh');
const ECC_DIR = path.resolve(__dirname, '../..');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function run(args, env) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-setup-home-'));
  try {
    const result = spawnSync('bash', [SCRIPT, ...args], {
      encoding: 'utf8',
      env: { PATH: process.env.PATH, HOME: home, ...env }
    });
    return { ...result, home, left: fs.readdirSync(home) };
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
}

console.log('\n=== Testing setup-chelp-cloud.sh ===\n');
let passed = 0;
let failed = 0;
const check = (name, fn) => (test(name, fn) ? passed++ : failed++);

if (process.platform === 'win32') {
  console.log('  - skipped: needs bash');
} else {
  check('a dry run lists the three installs and changes nothing', () => {
    const r = run(['--dry-run', ECC_DIR], { HALLMARK_DIR: '/nonexistent/hallmark' });
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.ok(/installing ECC/.test(r.stdout), r.stdout);
    assert.ok(/puppeteer-core@/.test(r.stdout), r.stdout);
    assert.ok(/installing Hallmark from \/nonexistent\/hallmark/.test(r.stdout), r.stdout);
    assert.ok(/would run: npm i -g/.test(r.stdout), r.stdout);
    assert.deepStrictEqual(r.left, [], `dry run created files: ${r.left}`);
  });

  check('it exits 0 and says what failed when the ECC folder and Hallmark are missing', () => {
    const r = run(['/nonexistent/ecc'], { HALLMARK_DIR: '/nonexistent/hallmark', PUPPETEER_VERSION: '0.0.0-does-not-exist' });
    assert.strictEqual(r.status, 0, 'a failed step must never fail the session start');
    assert.ok(/ECC installer not found/.test(r.stdout), r.stdout);
    assert.ok(/Hallmark installer not found/.test(r.stdout), r.stdout);
    assert.ok(/one or more steps failed/.test(r.stdout), r.stdout);
  });

  check('the profile and the puppeteer version can be set', () => {
    const r = run(['--dry-run', ECC_DIR], { ECC_PROFILE: 'full', PUPPETEER_VERSION: '99.1.0', HALLMARK_DIR: '/x' });
    assert.ok(/profile full/.test(r.stdout) && /puppeteer-core@99.1.0/.test(r.stdout), r.stdout);
  });
}

console.log('\n=== Test Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);
process.exit(failed > 0 ? 1 : 0);
