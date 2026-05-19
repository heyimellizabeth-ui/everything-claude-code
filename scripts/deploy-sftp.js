#!/usr/bin/env node
'use strict';

/**
 * Deploy local directory to a remote server via SFTP.
 *
 * Usage: node scripts/deploy-sftp.js <local-dir> [--dry-run]
 *
 * Required env vars:
 *   SFTP_HOST        Remote hostname or IP
 *   SFTP_PORT        Remote port (default 22)
 *   SFTP_USER        SSH/SFTP username
 *   SFTP_PASSWORD    Password (omit if using SFTP_KEY)
 *   SFTP_KEY         Path to private key file (omit if using SFTP_PASSWORD)
 *   SFTP_REMOTE_DIR  Absolute remote path to upload into
 */

const path = require('path');
const fs = require('fs');

const localDir = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!localDir || localDir === '--help' || localDir === '-h') {
  console.log('Usage: node scripts/deploy-sftp.js <local-dir> [--dry-run]');
  console.log('');
  console.log('Env vars: SFTP_HOST, SFTP_PORT, SFTP_USER, SFTP_PASSWORD or SFTP_KEY, SFTP_REMOTE_DIR');
  process.exit(localDir ? 0 : 1);
}

const {
  SFTP_HOST,
  SFTP_PORT = '22',
  SFTP_USER,
  SFTP_PASSWORD,
  SFTP_KEY,
  SFTP_REMOTE_DIR,
} = process.env;

const missing = ['SFTP_HOST', 'SFTP_USER', 'SFTP_REMOTE_DIR'].filter(k => !process.env[k]);
if (missing.length) {
  console.error(`[deploy-sftp] Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}
if (!SFTP_PASSWORD && !SFTP_KEY) {
  console.error('[deploy-sftp] Set SFTP_PASSWORD or SFTP_KEY');
  process.exit(1);
}

const absLocalDir = path.resolve(localDir);
if (!fs.existsSync(absLocalDir)) {
  console.error(`[deploy-sftp] Local directory not found: ${absLocalDir}`);
  process.exit(1);
}

function collectFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...collectFiles(full, base));
    } else {
      files.push({ local: full, relative: path.relative(base, full) });
    }
  }
  return files;
}

async function main() {
  let SftpClient;
  try {
    SftpClient = require('ssh2-sftp-client');
  } catch {
    console.error('[deploy-sftp] ssh2-sftp-client not installed. Run: npm install ssh2-sftp-client');
    process.exit(1);
  }

  const files = collectFiles(absLocalDir);
  if (files.length === 0) {
    console.log('[deploy-sftp] No files found in', absLocalDir);
    process.exit(0);
  }

  console.log(`[deploy-sftp] ${dryRun ? 'DRY RUN — ' : ''}Uploading ${files.length} file(s) to ${SFTP_HOST}:${SFTP_REMOTE_DIR}`);

  if (dryRun) {
    for (const f of files) {
      console.log(`  would upload: ${f.relative}`);
    }
    process.exit(0);
  }

  const connectConfig = {
    host: SFTP_HOST,
    port: parseInt(SFTP_PORT, 10),
    username: SFTP_USER,
  };
  if (SFTP_KEY) {
    connectConfig.privateKey = fs.readFileSync(path.resolve(SFTP_KEY));
  } else {
    connectConfig.password = SFTP_PASSWORD;
  }

  const sftp = new SftpClient();
  try {
    await sftp.connect(connectConfig);
    console.log('[deploy-sftp] Connected');

    for (const f of files) {
      const remotePath = SFTP_REMOTE_DIR.replace(/\/$/, '') + '/' + f.relative.replace(/\\/g, '/');
      const remoteDir = remotePath.substring(0, remotePath.lastIndexOf('/'));
      await sftp.mkdir(remoteDir, true).catch(() => {});
      await sftp.put(f.local, remotePath);
      console.log(`  uploaded: ${f.relative}`);
    }

    console.log(`[deploy-sftp] Done — ${files.length} file(s) uploaded`);
  } finally {
    await sftp.end();
  }
}

main().catch(err => {
  console.error('[deploy-sftp]', err.message || err);
  process.exit(1);
});
