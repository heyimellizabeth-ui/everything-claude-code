#!/usr/bin/env node
/**
 * Checks that ECC's pinned copy of the REA skill is not behind REA itself.
 *
 * skills/reverse-engineer-anything/SKILL.md is copied from the rea package
 * (.agents/skills/reverse-engineer-anything/SKILL.md there) and carries
 * `metadata.version`. This compares that number with a local rea checkout.
 *
 * Usage:
 *   node scripts/ci/check-rea-skill-sync.js --rea <path-to-rea-checkout>
 *   REA_REPO=<path> node scripts/ci/check-rea-skill-sync.js
 *
 * Exit codes: 0 in sync (or no checkout given), 1 ECC's copy is behind,
 * 2 a file could not be read.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ECC_SKILL = path.join('skills', 'reverse-engineer-anything', 'SKILL.md');
const REA_SKILL = path.join('.agents', 'skills', 'reverse-engineer-anything', 'SKILL.md');

function readSkillVersion(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) throw new Error(`${filePath} has no frontmatter`);
  const version = frontmatter[1].match(/^\s+version:\s*"?(\d+)"?\s*$/m);
  if (!version) throw new Error(`${filePath} has no metadata.version`);
  return Number(version[1]);
}

function checkReaSkillSync({ eccRoot, reaRoot }) {
  const ecc = readSkillVersion(path.join(eccRoot, ECC_SKILL));
  const rea = readSkillVersion(path.join(reaRoot, REA_SKILL));
  return { ecc, rea, isBehind: ecc < rea };
}

function parseReaRoot(argv, env) {
  const index = argv.indexOf('--rea');
  if (index !== -1 && argv[index + 1]) return argv[index + 1];
  return env.REA_REPO || null;
}

function main() {
  const reaRoot = parseReaRoot(process.argv.slice(2), process.env);
  if (!reaRoot) {
    console.log('No rea checkout given (--rea <path> or REA_REPO); skipping REA skill sync check.');
    return 0;
  }
  let result;
  try {
    result = checkReaSkillSync({ eccRoot: path.join(__dirname, '..', '..'), reaRoot });
  } catch (error) {
    console.error(`[check-rea-skill-sync] ${error.message}`);
    return 2;
  }
  if (result.isBehind) {
    console.error(
      `ECC's reverse-engineer-anything skill is version ${result.ecc}; rea has version ${result.rea}. ` +
        `Copy ${REA_SKILL} from rea into ${ECC_SKILL}, keeping ECC's pinned rea-agents version.`
    );
    return 1;
  }
  console.log(`REA skill in sync (ECC ${result.ecc}, rea ${result.rea}).`);
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { checkReaSkillSync, parseReaRoot, readSkillVersion };
