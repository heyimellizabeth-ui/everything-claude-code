'use strict';

const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.resolve(__dirname, '../../templates/queer-nightclub');

function usage() {
  console.error('Usage: node scaffold.js --config <brand.config.json> --out <output-dir>');
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config') args.config = argv[++i];
    if (argv[i] === '--out') args.out = argv[++i];
  }
  return args;
}

function buildTokenMap(cfg) {
  return {
    '{{SITE_NAME}}': cfg.site.name,
    '{{SITE_SHORT}}': cfg.site.short,
    '{{SITE_DOMAIN}}': cfg.site.domain,
    '{{SITE_TAGLINE}}': cfg.site.tagline,
    '{{SITE_DESCRIPTION}}': cfg.site.description,
    '{{SITE_LANG}}': cfg.site.lang,
    '{{SITE_LOCALE}}': cfg.site.locale,
    '{{SITE_EST}}': cfg.site.estYear,
    '{{SITE_BPM}}': cfg.site.bpm,
    '{{COLOR_VOID}}': cfg.colors.void,
    '{{COLOR_CREAM}}': cfg.colors.cream,
    '{{COLOR_ACCENT}}': cfg.colors.accent,
    '{{COLOR_SURFACE}}': cfg.colors.surface,
    '{{COLOR_MUTED}}': cfg.colors.muted,
    '{{VENUE_NAME}}': cfg.venue.name,
    '{{VENUE_CITY}}': cfg.venue.city,
    '{{VENUE_REGION}}': cfg.venue.region,
    '{{VENUE_COUNTRY}}': cfg.venue.country,
    '{{SOCIAL_INSTAGRAM}}': cfg.social.instagram,
    '{{SOCIAL_RA}}': cfg.social.ra,
    '{{FORMS_BACKEND}}': cfg.forms.backend,
    '{{FORMSPREE_NEWSLETTER}}': cfg.forms.newsletterKey || '',
    '{{FORMSPREE_CONTACT}}': cfg.forms.contactKey || '',
    '{{FORMS_RECIPIENT_EMAIL}}': cfg.forms.recipientEmail || '',
    '{{TICKET_URL}}': cfg.ticketUrl,
  };
}

function applyTokens(content, tokenMap) {
  let result = content;
  for (const [token, value] of Object.entries(tokenMap)) {
    result = result.split(token).join(value);
  }
  return result;
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

const BINARY_EXTENSIONS = new Set(['.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2', '.ttf', '.eot']);

function isBinary(filePath) {
  return BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function scaffold(configPath, outDir) {
  if (!fs.existsSync(configPath)) {
    console.error(`[scaffold] Config not found: ${configPath}`);
    process.exit(1);
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error(`[scaffold] Invalid JSON in config: ${e.message}`);
    process.exit(1);
  }

  const tokenMap = buildTokenMap(cfg);

  fs.mkdirSync(outDir, { recursive: true });

  const files = walkFiles(TEMPLATE_DIR);
  let count = 0;

  for (const rel of files) {
    // Skip brand.config.json itself — user provides their own
    if (rel === 'brand.config.json') continue;

    const src = path.join(TEMPLATE_DIR, rel);
    const dest = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    if (isBinary(rel)) {
      fs.copyFileSync(src, dest);
    } else {
      const raw = fs.readFileSync(src, 'utf8');
      fs.writeFileSync(dest, applyTokens(raw, tokenMap), 'utf8');
    }
    count++;
  }

  // Copy brand.config.json into output so the site remembers its config
  fs.copyFileSync(configPath, path.join(outDir, 'brand.config.json'));

  console.log(`[scaffold] ${count} files written to ${outDir}`);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config || !args.out) usage();
  scaffold(path.resolve(args.config), path.resolve(args.out));
}

module.exports = { scaffold, buildTokenMap, applyTokens };
