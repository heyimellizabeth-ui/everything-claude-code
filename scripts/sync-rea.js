#!/usr/bin/env node
/**
 * Sync RECC with a pinned rea-agents release.
 *
 * Usage:
 *   node scripts/sync-rea.js --version 6.7.0 --from /path/to/rea-or-extracted-package
 *   node scripts/sync-rea.js --version 6.7.0 --no-catalog --from ../rea
 *   node scripts/sync-rea.js --dry-run
 *
 * Steps:
 *   1. Pin `rea` in mcp-configs/mcp-servers.json to rea-agents@<version>
 *   2. Vendor REA's reverse-engineer-anything skill from --from (if given)
 *   3. Snapshot REA's MCP tool/prompt catalog by launching the pinned server
 *      over stdio and calling tools/list + prompts/list
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const {
  REA_PACKAGE,
  REA_SKILL_NAME,
  buildCatalogSnapshot,
  copySkillDir,
  findReaSkillDir,
  getReaPin,
  parseArgs,
  setReaPinInText
} = require('./lib/rea-sync');

const ROOT = path.resolve(__dirname, '..');
const MCP_CONFIG_PATH = path.join(ROOT, 'mcp-configs', 'mcp-servers.json');
const CATALOG_PATH = path.join(ROOT, 'mcp-configs', 'rea-tool-catalog.json');
const SKILL_DEST = path.join(ROOT, 'skills', REA_SKILL_NAME);
const CATALOG_TIMEOUT_MS = 240000;

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function fetchCatalog(version) {
  return new Promise((resolve, reject) => {
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(npx, ['-y', `${REA_PACKAGE}@${version}`, 'mcp'], {
      stdio: ['pipe', 'pipe', 'inherit']
    });
    const result = { tools: null, prompts: null };
    let buffer = '';
    const send = message => child.stdin.write(`${JSON.stringify(message)}\n`);
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Timed out after ${CATALOG_TIMEOUT_MS}ms waiting for REA catalog`));
    }, CATALOG_TIMEOUT_MS);

    child.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
    child.stdout.on('data', chunk => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        let message;
        try { message = JSON.parse(line); } catch { continue; }
        if (message.error) {
          clearTimeout(timer);
          child.kill();
          reject(new Error(`REA MCP error: ${message.error.message}`));
          return;
        }
        if (message.id === 1) {
          send({ jsonrpc: '2.0', method: 'notifications/initialized' });
          send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
          send({ jsonrpc: '2.0', id: 3, method: 'prompts/list' });
        } else if (message.id === 2) {
          result.tools = message.result.tools.map(tool => tool.name);
        } else if (message.id === 3) {
          result.prompts = message.result.prompts.map(prompt => prompt.name);
        }
        if (result.tools && result.prompts) {
          clearTimeout(timer);
          child.kill();
          resolve(result);
          return;
        }
      }
    });

    send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'recc-sync', version: '0' } }
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const mcpConfigText = fs.readFileSync(MCP_CONFIG_PATH, 'utf8');
  const currentPin = getReaPin(JSON.parse(mcpConfigText));
  const version = options.version || currentPin;

  if (!version) {
    throw new Error('No rea-agents pin found; pass --version <x.y.z>');
  }

  console.log(`[sync-rea] current pin: ${currentPin || '(none)'} -> target: ${version}`);
  if (options.dryRun) {
    console.log(`[sync-rea] dry run: would update ${path.relative(ROOT, MCP_CONFIG_PATH)}`);
    if (options.from) console.log(`[sync-rea] dry run: would vendor skill from ${options.from}`);
    if (options.catalog) console.log(`[sync-rea] dry run: would refresh ${path.relative(ROOT, CATALOG_PATH)}`);
    return;
  }

  fs.writeFileSync(MCP_CONFIG_PATH, setReaPinInText(mcpConfigText, version));
  console.log(`[sync-rea] pinned ${REA_PACKAGE}@${version}`);

  if (options.from) {
    const sourceDir = findReaSkillDir(path.resolve(options.from));
    if (!sourceDir) {
      throw new Error(`No ${REA_SKILL_NAME}/SKILL.md found under ${options.from}`);
    }
    copySkillDir(sourceDir, SKILL_DEST, version);
    console.log(`[sync-rea] vendored skill from ${sourceDir}`);
  }

  if (options.catalog) {
    const { tools, prompts } = await fetchCatalog(version);
    writeJson(CATALOG_PATH, buildCatalogSnapshot({ version, tools, prompts }));
    console.log(`[sync-rea] catalog: ${tools.length} tools, ${prompts.length} prompts`);
  }
}

main().catch(err => {
  console.error(`[sync-rea] ${err.message}`);
  process.exit(1);
});
