'use strict';

const fs = require('fs');
const path = require('path');

const TEMPLATES_ROOT = path.resolve(__dirname, '../../templates');
const TEMPLATE_DIR = path.join(TEMPLATES_ROOT, 'queer-nightclub');

function usage() {
  console.error('Usage: node scaffold.js --config <brand.config.json> --out <output-dir> [--template <queer-nightclub|portfolio>]');
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config') args.config = argv[++i];
    if (argv[i] === '--out') args.out = argv[++i];
    if (argv[i] === '--template') args.template = argv[++i];
  }
  return args;
}

function sectionFlag(cfg, key) {
  return cfg.sections && cfg.sections[key] === false ? 'display:none' : '';
}

function moduleFlag(cfg, key) {
  return cfg.modules && cfg.modules[key] && cfg.modules[key].enabled ? '' : 'display:none';
}

function googleFontsLink(fonts) {
  if (!fonts || (!fonts.heading && !fonts.body)) return '';
  const families = [];
  if (fonts.heading) families.push(fonts.heading.replace(/ /g, '+') + ':wght@400;700;900');
  if (fonts.body && fonts.body !== fonts.heading) families.push(fonts.body.replace(/ /g, '+') + ':wght@400;700');
  const qs = families.map(f => 'family=' + f).join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?${qs}&display=swap" rel="stylesheet">`;
}

function buildTokenMap(cfg) {
  const social = cfg.social || {};
  const reviews = cfg.reviews || [];
  const images = cfg.images || {};
  const modules = cfg.modules || {};

  return {
    // Site
    '{{SITE_NAME}}': cfg.site.name,
    '{{SITE_SHORT}}': cfg.site.short,
    '{{SITE_DOMAIN}}': cfg.site.domain,
    '{{SITE_TAGLINE}}': cfg.site.tagline,
    '{{SITE_DESCRIPTION}}': cfg.site.description,
    '{{SITE_LANG}}': cfg.site.lang,
    '{{SITE_LOCALE}}': cfg.site.locale,
    '{{SITE_EST}}': cfg.site.estYear,
    '{{SITE_BPM}}': cfg.site.bpm,

    // Colors
    '{{COLOR_VOID}}': cfg.colors.void,
    '{{COLOR_CREAM}}': cfg.colors.cream,
    '{{COLOR_ACCENT}}': cfg.colors.accent,
    '{{COLOR_SURFACE}}': cfg.colors.surface,
    '{{COLOR_MUTED}}': cfg.colors.muted,

    // Venue
    '{{VENUE_NAME}}': cfg.venue.name,
    '{{VENUE_CITY}}': cfg.venue.city,
    '{{VENUE_REGION}}': cfg.venue.region,
    '{{VENUE_COUNTRY}}': cfg.venue.country,

    // Social (original)
    '{{SOCIAL_INSTAGRAM}}': social.instagram || '',
    '{{SOCIAL_RA}}': social.ra || '',
    // Social (extended)
    '{{SOCIAL_FACEBOOK}}': social.facebook || '',
    '{{SOCIAL_TIKTOK}}': social.tiktok || '',
    '{{SOCIAL_SPOTIFY}}': social.spotify || '',
    '{{SOCIAL_YOUTUBE}}': social.youtube || '',

    // Forms
    '{{FORMS_BACKEND}}': cfg.forms.backend,
    '{{FORMSPREE_NEWSLETTER}}': cfg.forms.newsletterKey || '',
    '{{FORMSPREE_CONTACT}}': cfg.forms.contactKey || '',
    '{{FORMS_RECIPIENT_EMAIL}}': cfg.forms.recipientEmail || '',
    '{{TICKET_URL}}': cfg.ticketUrl || '',

    // Fonts
    '{{FONT_HEADING}}': (cfg.fonts && cfg.fonts.heading) || 'system-ui, sans-serif',
    '{{FONT_BODY}}': (cfg.fonts && cfg.fonts.body) || 'system-ui, sans-serif',
    '{{FONT_GOOGLE_LINK}}': googleFontsLink(cfg.fonts),

    // Section visibility (CSS style value)
    '{{SECTION_EVENTS}}': sectionFlag(cfg, 'events'),
    '{{SECTION_ABOUT}}': sectionFlag(cfg, 'about'),
    '{{SECTION_GALLERY}}': sectionFlag(cfg, 'gallery'),
    '{{SECTION_CONTACT}}': sectionFlag(cfg, 'contact'),
    '{{SECTION_HERO}}': sectionFlag(cfg, 'hero'),
    '{{SECTION_NEXT_EVENT}}': sectionFlag(cfg, 'next-event'),
    '{{SECTION_NEWSLETTER}}': sectionFlag(cfg, 'newsletter'),
    '{{SECTION_INSTAGRAM}}': sectionFlag(cfg, 'instagram'),
    '{{SECTION_MANIFESTO}}': sectionFlag(cfg, 'manifesto'),
    '{{FOOTER_SOCIAL}}': sectionFlag(cfg, 'footer-social'),
    '{{FOOTER_NAV}}': sectionFlag(cfg, 'footer-nav'),
    '{{FOOTER_BPM}}': sectionFlag(cfg, 'footer-bpm'),
    // Nav link visibility
    '{{NAV_EVENTS}}': sectionFlag(cfg, 'events'),
    '{{NAV_ABOUT}}': sectionFlag(cfg, 'about'),
    '{{NAV_GALLERY}}': sectionFlag(cfg, 'gallery'),
    '{{NAV_CONTACT}}': sectionFlag(cfg, 'contact'),

    // Reviews (escape </script> to prevent template injection)
    '{{REVIEWS_JSON}}': JSON.stringify(reviews).replace(/<\/script>/gi, '<\\/script>'),

    // Images
    '{{IMAGE_HERO}}': images.hero || '',
    '{{IMAGE_OG}}': images.og || '',
    '{{IMAGE_GALLERY_LIST}}': (images.gallery || []).join(','),

    // Modules
    '{{MODULE_CALENDAR}}': moduleFlag(cfg, 'calendar'),
    '{{MODULE_CALENDAR_TYPE}}': (modules.calendar && modules.calendar.type) || 'ra-embed',
    '{{MODULE_CHECKOUT}}': moduleFlag(cfg, 'checkout'),
    '{{MODULE_CHECKOUT_URL}}': (modules.checkout && modules.checkout.url) || '',
    '{{MODULE_PLANNER}}': moduleFlag(cfg, 'planner'),
    '{{MODULE_GALLERY_TYPE}}': (modules.gallery && modules.gallery.type) || 'flickr',
    '{{MODULE_NEWSLETTER}}': moduleFlag(cfg, 'newsletter') || '', // newsletter defaults on

    // SEO (Phase 13.6)
    '{{SEO_TITLE}}': (cfg.seo && cfg.seo.title) || cfg.site.name,
    '{{SEO_DESCRIPTION}}': (cfg.seo && cfg.seo.description) || cfg.site.description,
    '{{SEO_OG_TITLE}}': (cfg.seo && cfg.seo.ogTitle) || cfg.site.name,
    '{{SEO_KEYWORDS}}': (cfg.seo && cfg.seo.keywords) || '',

    // Layout variants (C2)
    '{{LAYOUT_HERO}}':       (cfg.layout && cfg.layout.hero)      || 'full-bleed',
    '{{LAYOUT_NEXT_EVENT}}': (cfg.layout && cfg.layout.nextEvent) || 'card',
    '{{LAYOUT_FOOTER}}':     (cfg.layout && cfg.layout.footer)    || 'standard',
  };
}

function buildPortfolioTokenMap(cfg) {
  const social = cfg.social || {};
  const light = (cfg.colors && cfg.colors.light) || {};
  const dark = (cfg.colors && cfg.colors.dark) || {};
  const nav = cfg.nav || {};
  const owner = cfg.owner || {};
  const forms = cfg.forms || {};

  return {
    // Site
    '{{SITE_NAME}}': cfg.site.name,
    '{{SITE_DOMAIN}}': cfg.site.domain,
    '{{SITE_TAGLINE}}': cfg.site.tagline || '',
    '{{SITE_DESCRIPTION}}': cfg.site.description || '',
    '{{SITE_LANG}}': cfg.site.lang || 'en',
    '{{SITE_LOCALE}}': cfg.site.locale || 'en_US',

    // Owner
    '{{OWNER_NAME}}': owner.name,
    '{{OWNER_FIRST}}': owner.first || (owner.name || '').split(' ')[0],
    '{{OWNER_ROLE}}': owner.role || '',
    '{{OWNER_CITY}}': owner.city || '',
    '{{OWNER_COUNTRY}}': owner.country || '',
    '{{OWNER_EMAIL}}': owner.email || '',
    '{{AVAILABILITY}}': owner.availability || '',

    // Colors — light + dark are separate token sets (dark is tonal, not inverted)
    '{{COLOR_PAPER}}': light.paper,
    '{{COLOR_INK}}': light.ink,
    '{{COLOR_SURFACE}}': light.surface,
    '{{COLOR_MUTED}}': light.muted,
    '{{COLOR_ACCENT}}': light.accent,
    '{{COLOR_PAPER_DARK}}': dark.paper,
    '{{COLOR_INK_DARK}}': dark.ink,
    '{{COLOR_SURFACE_DARK}}': dark.surface,
    '{{COLOR_MUTED_DARK}}': dark.muted,
    '{{COLOR_ACCENT_DARK}}': dark.accent,

    // Fonts — config may carry the exact <link> markup; fall back to the generated one
    '{{FONT_HEADING}}': (cfg.fonts && cfg.fonts.heading) || 'Georgia',
    '{{FONT_BODY}}': (cfg.fonts && cfg.fonts.body) || 'system-ui',
    '{{FONT_GOOGLE_LINK}}': (cfg.fonts && cfg.fonts.googleLink) || googleFontsLink(cfg.fonts),

    // Nav labels
    '{{NAV_WORK}}': nav.work || 'Work',
    '{{NAV_ABOUT}}': nav.about || 'About',
    '{{NAV_CONTACT}}': nav.contact || 'Contact',

    // Social
    '{{SOCIAL_INSTAGRAM}}': social.instagram || '',
    '{{SOCIAL_LINKEDIN}}': social.linkedin || '',
    '{{SOCIAL_GITHUB}}': social.github || '',
    '{{SOCIAL_DRIBBBLE}}': social.dribbble || '',

    // Forms
    '{{FORMS_BACKEND}}': forms.backend || 'formspree',
    '{{FORMSPREE_CONTACT}}': forms.contactKey || '',
    '{{FORMS_RECIPIENT_EMAIL}}': forms.recipientEmail || '',
  };
}

// Per-template scaffolding contract. Adding a template = one entry here
// plus its buildTokenMap; everything else (walk, copy, validate) is shared.
const TEMPLATE_DEFS = {
  'queer-nightclub': {
    dir: TEMPLATE_DIR,
    buildTokenMap,
    requiredFields: ['site.name', 'site.domain', 'colors.accent', 'venue.city', 'forms.backend'],
    pageSectionMap: {
      'events.html': 'events',
      'about.html': 'about',
      'gallery.html': 'gallery',
      'contact.html': 'contact',
    },
    skipFiles: ['brand.config.json'],
  },
  portfolio: {
    dir: path.join(TEMPLATES_ROOT, 'portfolio'),
    buildTokenMap: buildPortfolioTokenMap,
    requiredFields: ['site.name', 'site.domain', 'owner.name', 'owner.email'],
    pageSectionMap: {},
    // README.md documents the template itself — not a deployable site file
    skipFiles: ['brand.config.json', 'README.md'],
  },
};

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

const BINARY_EXTENSIONS = new Set(['.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.svg']);

function isBinary(filePath) {
  return BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function validateConfig(cfg, required) {
  const missing = required.filter(p => {
    const [a, b] = p.split('.');
    return !cfg[a] || !cfg[a][b];
  });
  if (missing.length) {
    console.error(`[scaffold] Config missing required fields: ${missing.join(', ')}`);
    process.exit(1);
  }
}

function scaffold(configPath, outDir, templateName = 'queer-nightclub') {
  const def = TEMPLATE_DEFS[templateName];
  if (!def) {
    console.error(`[scaffold] Unknown template "${templateName}". Available: ${Object.keys(TEMPLATE_DEFS).join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(configPath)) {
    console.error('[scaffold] Config file not found');
    process.exit(1);
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error(`[scaffold] Invalid JSON in config: ${e.message}`);
    process.exit(1);
  }

  validateConfig(cfg, def.requiredFields);
  const tokenMap = def.buildTokenMap(cfg);

  fs.mkdirSync(outDir, { recursive: true });

  const files = walkFiles(def.dir);
  let count = 0;

  for (const rel of files) {
    // Skip template-internal files (user provides their own brand.config.json)
    if (def.skipFiles.includes(rel)) continue;

    // Skip disabled pages
    const sectionKey = def.pageSectionMap[rel];
    if (sectionKey && cfg.sections && cfg.sections[sectionKey] === false) continue;

    const src = path.join(def.dir, rel);
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
  scaffold(path.resolve(args.config), path.resolve(args.out), args.template || 'queer-nightclub');
}

module.exports = { scaffold, buildTokenMap, buildPortfolioTokenMap, applyTokens };
