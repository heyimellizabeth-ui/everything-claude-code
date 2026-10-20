/**
 * Helpers for keeping RECC (ECC + REA) in sync with a pinned rea-agents release.
 *
 * RECC consumes REA as an external MCP server (`npx rea-agents@<pin> mcp`).
 * These helpers own the three things ECC vendors from REA:
 *   1. The version pin in mcp-configs/mcp-servers.json
 *   2. A copy of REA's `reverse-engineer-anything` skill
 *   3. A snapshot of REA's MCP tool/prompt catalog used by the contract test
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REA_PACKAGE = 'rea-agents';
const REA_SERVER_ID = 'rea';
const REA_SKILL_NAME = 'reverse-engineer-anything';
const REA_SKILL_CANDIDATES = [
  path.join('skills', REA_SKILL_NAME),
  path.join('.agents', 'skills', REA_SKILL_NAME)
];
const REA_TOOL_REF_PATTERN = /mcp__rea__([a-z0-9_]+)/g;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function isValidVersion(version) {
  return typeof version === 'string' && VERSION_PATTERN.test(version);
}

function parseArgs(argv) {
  const options = { version: null, from: null, catalog: true, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--version') {
      options.version = argv[++i] || null;
    } else if (arg === '--from') {
      options.from = argv[++i] || null;
    } else if (arg === '--no-catalog') {
      options.catalog = false;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (options.version !== null && !isValidVersion(options.version)) {
    throw new Error(`Invalid rea-agents version: ${options.version}`);
  }
  return options;
}

function getReaPin(mcpConfig) {
  const entry = mcpConfig && mcpConfig.mcpServers && mcpConfig.mcpServers[REA_SERVER_ID];
  if (!entry || !Array.isArray(entry.args)) return null;
  const prefix = `${REA_PACKAGE}@`;
  const spec = entry.args.find(arg => typeof arg === 'string' && arg.startsWith(prefix));
  return spec ? spec.slice(prefix.length) : null;
}

/**
 * Rewrite the pinned version inside the raw mcp-servers.json text. Editing the
 * text (instead of re-serializing) keeps the file's hand-maintained layout.
 */
function setReaPinInText(configText, version) {
  if (!isValidVersion(version)) {
    throw new Error(`Invalid rea-agents version: ${version}`);
  }
  const pattern = new RegExp(`"${REA_PACKAGE}@[^"]+"`, 'g');
  const matches = configText.match(pattern) || [];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${REA_PACKAGE} pin in MCP config, found ${matches.length}`);
  }
  return configText.replace(pattern, `"${REA_PACKAGE}@${version}"`);
}

function findReaSkillDir(root) {
  for (const candidate of REA_SKILL_CANDIDATES) {
    const dir = path.join(root, candidate);
    if (fs.existsSync(path.join(dir, 'SKILL.md'))) return dir;
  }
  return null;
}

/**
 * Set `origin: rea@<version>` in the skill frontmatter so the vendored copy
 * records exactly which REA release it came from.
 */
function annotateSkillOrigin(skillMarkdown, version) {
  const match = skillMarkdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error('REA SKILL.md is missing YAML frontmatter');
  }
  const origin = `origin: rea@${version}`;
  const lines = match[1].split(/\r?\n/).filter(line => !/^origin:/.test(line));
  const nameIndex = lines.findIndex(line => /^description:/.test(line));
  lines.splice(nameIndex === -1 ? lines.length : nameIndex + 1, 0, origin);
  return `---\n${lines.join('\n')}\n---${skillMarkdown.slice(match[0].length)}`;
}

function copySkillDir(sourceDir, destDir, version) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.cpSync(sourceDir, destDir, { recursive: true });
  const skillPath = path.join(destDir, 'SKILL.md');
  fs.writeFileSync(skillPath, annotateSkillOrigin(fs.readFileSync(skillPath, 'utf8'), version));
}

function buildCatalogSnapshot({ version, tools, prompts }) {
  if (!isValidVersion(version)) {
    throw new Error(`Invalid rea-agents version: ${version}`);
  }
  const uniqueSorted = values => [...new Set((values || []).filter(v => typeof v === 'string'))].sort();
  return {
    package: REA_PACKAGE,
    version,
    tools: uniqueSorted(tools),
    prompts: uniqueSorted(prompts)
  };
}

function extractReaToolRefs(text) {
  const refs = new Set();
  for (const match of String(text).matchAll(REA_TOOL_REF_PATTERN)) {
    refs.add(match[1]);
  }
  return refs;
}

function findUnknownReaRefs(refs, catalog) {
  const known = new Set([...(catalog.tools || []), ...(catalog.prompts || [])]);
  return [...refs].filter(ref => !known.has(ref)).sort();
}

module.exports = {
  REA_PACKAGE,
  REA_SERVER_ID,
  REA_SKILL_NAME,
  annotateSkillOrigin,
  buildCatalogSnapshot,
  copySkillDir,
  extractReaToolRefs,
  findReaSkillDir,
  findUnknownReaRefs,
  getReaPin,
  isValidVersion,
  parseArgs,
  setReaPinInText
};
