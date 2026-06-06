'use strict';

const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node validate.js --dir <output-dir> [--config <brand.config.json>]');
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') args.dir = argv[++i];
    if (argv[i] === '--config') args.config = argv[++i];
  }
  return args;
}

const TEXT_EXTENSIONS = new Set(['.html', '.css', '.js', '.xml', '.txt', '.md', '.json', '.py', '.htaccess', '.php']);

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '') {
    // e.g. .htaccess
    return path.basename(filePath).startsWith('.');
  }
  return TEXT_EXTENSIONS.has(ext);
}

function walkFiles(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, base, acc);
    } else {
      acc.push(path.relative(base, full));
    }
  }
  return acc;
}

function validate(outDir, configPath) {
  if (!fs.existsSync(outDir)) {
    console.error(`[validate] Output dir not found: ${outDir}`);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];
  const files = walkFiles(outDir);

  for (const rel of files) {
    const full = path.join(outDir, rel);
    if (!isTextFile(rel)) continue;

    const lines = fs.readFileSync(full, 'utf8').split('\n');
    lines.forEach((line, i) => {
      // Check for unsubstituted tokens
      const tokenMatch = line.match(/\{\{[A-Z_]+\}\}/g);
      if (tokenMatch) {
        for (const token of tokenMatch) {
          errors.push(`${rel}:${i + 1} — unsubstituted token: ${token}`);
        }
      }
    });
  }

  // If a config was provided, also warn about any source brand strings still in output
  if (configPath && fs.existsSync(configPath)) {
    let cfg;
    try {
      cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (_) {
      cfg = null;
    }

    if (cfg) {
      // Build a list of source brand values to warn on (skip generic ones like colors)
      const sourceStrings = [
        { value: cfg.site.domain, label: 'source domain' },
        { value: cfg.site.name, label: 'source site name' },
        { value: cfg.site.short, label: 'source short name' },
      ].filter(s => s.value && s.value.length > 3);

      const templateConfigPath = path.join(outDir, 'brand.config.json');
      let outputCfg = null;
      if (fs.existsSync(templateConfigPath)) {
        try { outputCfg = JSON.parse(fs.readFileSync(templateConfigPath, 'utf8')); } catch (_) {}
      }

      // Only warn if the output brand differs from the source (i.e. user actually renamed)
      if (outputCfg && outputCfg.site && outputCfg.site.domain !== cfg.site.domain) {
        for (const { value, label } of sourceStrings) {
          for (const rel of files) {
            if (rel === 'brand.config.json') continue;
            const full = path.join(outDir, rel);
            if (!isTextFile(rel)) continue;
            const content = fs.readFileSync(full, 'utf8');
            if (content.includes(value)) {
              warnings.push(`${rel} — still contains ${label}: "${value}"`);
            }
          }
        }
      }
    }
  }

  if (warnings.length) {
    console.warn('[validate] Warnings:');
    warnings.forEach(w => console.warn(`  WARNING: ${w}`));
  }

  if (errors.length) {
    console.error('[validate] Errors:');
    errors.forEach(e => console.error(`  ✗  ${e}`));
    process.exit(1);
  }

  console.log(`[validate] ✓ ${files.length} files checked — no unsubstituted tokens`);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dir) usage();
  validate(path.resolve(args.dir), args.config ? path.resolve(args.config) : null);
}

module.exports = { validate };
