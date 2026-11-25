#!/usr/bin/env node
/**
 * Builds docs/capabilities.json: one entry per skill, agent, command, hook,
 * MCP server and mod (plugin) in this repository and in sibling repositories.
 *
 * Usage:
 *   node scripts/ci/build-capabilities.js --write [--repo <name>=<path> ...]
 *   node scripts/ci/build-capabilities.js --check
 *
 * This repository is always scanned. Other repositories are scanned only
 * when passed with --repo; otherwise their entries are kept from the
 * committed file, so CI (which has no sibling checkouts) can still check it.
 * Design fields (stage, scores, designStatus, useWhen) are filled by hand or
 * by other tools and are kept across runs.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const SELF = 'everything-claude-code';
const OUTPUT = path.join('docs', 'capabilities.json');
const DESIGN_FIELDS = ['stage', 'scores', 'designStatus', 'useWhen'];
// Authors whose additions count as Lizzy's own work (her commits and Claude sessions she ran).
const OWN_AUTHORS = /heyimellizabeth|noreply@anthropic\.com/i;
const CHAIN_IDS = ['c1', 'c2', 'c3', 'c4', 'c5', 'studio-build'];
// docs/ holds translations of skills, not more skills.
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'vendor', 'third_party', 'docs']);

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const values = {};
  if (!match) return values;
  const lines = match[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const field = lines[i].match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!field) continue;
    let value = field[2].trim();
    if (/^[>|][-+]?$/.test(value)) {
      const parts = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[(i += 1)].trim());
      value = parts.join(' ');
    }
    values[field[1]] = value.replace(/^(["'])(.*)\1$/, '$2');
  }
  return values;
}

/** The frontmatter description, or else the first line of prose after the title. */
function describe(content, fm) {
  if (fm.description) return fm.description;
  const body = content.replace(/^---[\s\S]*?\n---\n/, '');
  const line = body.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('```'));
  return line ? line.trim() : '';
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function readJson(file) {
  const text = readText(file);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function walk(dir, rel, out) {
  let entries;
  try {
    entries = fs.readdirSync(path.join(dir, rel), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) walk(dir, child, out);
    else if (entry.isFile()) out.push(child);
  }
  return out;
}

/** Maps each file path to the author who first added it, from one git log pass. */
function addedBy(repoRoot) {
  const authors = new Map();
  let log = '';
  try {
    log = execFileSync('git', ['log', '--no-renames', '--diff-filter=A', '--name-only', '--format=@%an <%ae>'], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return authors;
  }
  let author = '';
  for (const line of log.split('\n')) {
    if (line.startsWith('@')) author = line.slice(1);
    else if (line) authors.set(line, author); // log runs newest first, so the oldest add wins
  }
  return authors;
}

function groupFor(repo, name) {
  if (/^(c[1-5]|chelp.*|design-gate|studio-build|site-template|static-site-release)$/.test(name)) return 'web chains';
  if (/^(re-|rea-|reverse-engineer)/.test(name) || repo === 'rea') return 'RECC';
  if (['taste-skill', 'ui-ux-pro-max-skill', 'astryx', 'modern-web-guidance'].includes(repo)) return 'design';
  if (/design|astryx|wireframe|hallmark|frontend|ui-|brand/.test(name)) return 'design';
  if (repo === 'agent-browser') return 'browser';
  return 'general';
}

/** Steps of each chain skill, read from the slash commands in its code blocks. */
function chainSteps(repoRoot) {
  const steps = {};
  for (const id of CHAIN_IDS) {
    const text = readText(path.join(repoRoot, 'skills', id, 'SKILL.md')) ?? readText(path.join(repoRoot, 'plugins', 'studio-kit', 'skills', id, 'SKILL.md'));
    if (text === null) continue;
    const blocks = (text.match(/```[\s\S]*?```/g) || []).join('\n');
    steps[id] = [...new Set([...blocks.matchAll(/^\/([a-z][\w-]*)/gm)].map(m => m[1]))];
  }
  return steps;
}

function scanRepo(repo, repoRoot) {
  const authors = addedBy(repoRoot);
  const files = walk(repoRoot, '', []);
  const entries = [];
  const add = (kind, name, description, invoke, relPath, extra = {}) => {
    const author = authors.get(relPath) || '';
    entries.push({
      id: `${repo}:${relPath}${extra.anchor ? `#${extra.anchor}` : ''}`,
      kind,
      name,
      description: (description || '').trim(),
      invoke,
      repo,
      path: relPath,
      origin: OWN_AUTHORS.test(author) ? 'lizzy' : 'upstream',
      group: groupFor(repo, name),
      status: extra.status || 'available',
    });
  };
  const local = path.join('.claude', 'skills');

  for (const rel of files) {
    const base = path.posix.basename(rel);
    if (base === 'SKILL.md' || /^\.claude\/skills\/[^/]+\.md$/.test(rel)) {
      const content = readText(path.join(repoRoot, rel)) || '';
      const fm = parseFrontmatter(content);
      const name = fm.name || (base === 'SKILL.md' ? path.posix.basename(path.posix.dirname(rel)) : base.replace(/\.md$/, ''));
      add('skill', name, describe(content, fm), `/${name}`, rel, { status: rel.startsWith(local) ? 'active' : 'available' });
    } else if (/^(\.claude\/)?commands\/[^/]+\.md$/.test(rel)) {
      const content = readText(path.join(repoRoot, rel)) || '';
      const name = base.replace(/\.md$/, '');
      add('command', name, describe(content, parseFrontmatter(content)), `/${name}`, rel, {
        status: rel.startsWith('.claude/') ? 'active' : 'available',
      });
    } else if (/^agents\/[^/]+\.md$/.test(rel)) {
      const fm = parseFrontmatter(readText(path.join(repoRoot, rel)) || '');
      const name = fm.name || base.replace(/\.md$/, '');
      add('agent', name, fm.description, `@${name}`, rel);
    } else if (/^plugins\/[^/]+\/\.claude-plugin\/plugin\.json$/.test(rel)) {
      const manifest = readJson(path.join(repoRoot, rel)) || {};
      const isMod = fs.existsSync(path.join(repoRoot, path.posix.dirname(path.posix.dirname(rel)), 'hooks', 'hooks.json'));
      const name = manifest.name || rel.split('/')[1];
      add(isMod ? 'mod' : 'plugin', name, manifest.description, `/plugin install ${name}`, rel);
    }
  }

  const hooks = readJson(path.join(repoRoot, 'hooks', 'hooks.json'));
  for (const [event, groups] of Object.entries((hooks && hooks.hooks) || {})) {
    for (const group of groups) {
      if (!group.id) continue;
      add('hook', group.id, group.description, `${event}${group.matcher ? ` ${group.matcher}` : ''}`, 'hooks/hooks.json', { anchor: group.id });
    }
  }

  const active = new Set(Object.keys((readJson(path.join(repoRoot, '.mcp.json')) || {}).mcpServers || {}));
  const disabled = new Set((readJson(path.join(repoRoot, '.claude', 'settings.json')) || {}).disabledMcpjsonServers || []);
  const presets = (readJson(path.join(repoRoot, 'mcp-configs', 'mcp-servers.json')) || {}).mcpServers || {};
  for (const [name, server] of Object.entries(presets)) {
    add('mcp', name, server.description, `mcp__${name}__*`, 'mcp-configs/mcp-servers.json', {
      anchor: name,
      status: active.has(name) && !disabled.has(name) ? 'active' : 'available',
    });
  }

  // Harness mirrors (.agents, .cursor, .kiro, ...) repeat skills found in skills/ or .claude/: keep one.
  const rank = rel => (/^(plugins\/[^/]+\/)?skills\//.test(rel) ? 0 : rel.startsWith('.claude/') ? 1 : 2);
  const best = new Map();
  for (const entry of entries) {
    const key = `${entry.kind}:${entry.name}`;
    const seen = best.get(key);
    if (entry.kind !== 'skill' || !seen || rank(entry.path) < rank(seen.path)) best.set(entry.kind === 'skill' ? key : entry.id, entry);
  }
  entries.length = 0;
  entries.push(...best.values());

  const steps = chainSteps(repoRoot);
  for (const entry of entries) {
    if (entry.kind !== 'skill' && entry.kind !== 'command') continue;
    const chains = CHAIN_IDS.filter(id => id === entry.name || (steps[id] || []).includes(entry.name));
    if (chains.length) entry.chains = chains;
  }
  return entries;
}

function buildCapabilities({ root = ROOT, repos = {}, previous = null } = {}) {
  const scanned = { [SELF]: root, ...repos };
  let entries = [];
  for (const [repo, repoRoot] of Object.entries(scanned)) entries = entries.concat(scanRepo(repo, repoRoot));
  const old = (previous && previous.capabilities) || [];
  // Keep entries of repositories not scanned this run.
  entries = entries.concat(old.filter(entry => !(entry.repo in scanned)).map(entry => {
    const kept = { ...entry };
    for (const field of DESIGN_FIELDS) delete kept[field];
    return kept;
  }));
  const oldById = new Map(old.map(entry => [entry.id, entry]));
  for (const entry of entries) {
    const before = oldById.get(entry.id);
    // Who added a file never changes, and shallow CI clones can't tell, so keep the recorded origin.
    if (before && before.origin) entry.origin = before.origin;
    // Chains read from the chain skills win; a chains list added by hand is kept where they find none.
    if (!entry.chains && before && Array.isArray(before.chains)) entry.chains = before.chains;
    for (const field of DESIGN_FIELDS) {
      if (before && before[field] !== undefined) entry[field] = before[field];
    }
  }
  entries.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { version: 1, generatedBy: 'scripts/ci/build-capabilities.js', capabilities: entries };
}

function parseArgs(argv) {
  const repos = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--repo' && argv[i + 1]) {
      const [name, repoPath] = argv[(i += 1)].split('=');
      if (name && repoPath) repos[name] = path.resolve(repoPath);
    }
  }
  return { repos, write: argv.includes('--write'), check: argv.includes('--check') };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const outFile = path.join(ROOT, OUTPUT);
  const previous = readJson(outFile);
  const text = `${JSON.stringify(buildCapabilities({ repos: args.repos, previous }), null, 2)}\n`;
  if (args.write) {
    fs.writeFileSync(outFile, text);
    console.log(`Wrote ${OUTPUT}`);
    return 0;
  }
  if (readText(outFile) !== text) {
    console.error(`${OUTPUT} is out of date; run npm run capabilities:write`);
    return 1;
  }
  console.log(`${OUTPUT} is up to date.`);
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { buildCapabilities, parseFrontmatter, parseArgs, groupFor };
