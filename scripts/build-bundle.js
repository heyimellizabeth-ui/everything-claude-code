'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FILES = [
  // Test Fixes
  { name: 'detect-project-worktree.test.js', group: 'Test Fixes', path: 'tests/hooks/detect-project-worktree.test.js' },
  { name: 'observe-subdirectory-detection.test.js', group: 'Test Fixes', path: 'tests/hooks/observe-subdirectory-detection.test.js' },
  { name: 'hooks.test.js', group: 'Test Fixes', path: 'tests/hooks/hooks.test.js' },
  { name: 'session-aliases.test.js', group: 'Test Fixes', path: 'tests/lib/session-aliases.test.js' },
  { name: 'session-manager.test.js', group: 'Test Fixes', path: 'tests/lib/session-manager.test.js' },
  // Studio App
  { name: 'design-studio/index.html', group: 'Studio App', path: 'projects/design-studio/index.html' },
  { name: 'design-studio/USAGE.md', group: 'Studio App', path: 'projects/design-studio/USAGE.md' },
  { name: 'scaffold.js', group: 'Studio App', path: 'scripts/site-template/scaffold.js' },
  { name: 'validate.js', group: 'Studio App', path: 'scripts/site-template/validate.js' },
  { name: 'scaffold.test.js', group: 'Studio App', path: 'tests/site-template/scaffold.test.js' },
  { name: 'validate.test.js', group: 'Studio App', path: 'tests/site-template/validate.test.js' },
  { name: 'brand.config.json', group: 'Studio App', path: 'templates/queer-nightclub/brand.config.json' },
  // Template
  { name: 'template/index.html', group: 'Template', path: 'templates/queer-nightclub/index.html' },
  { name: 'template/about.html', group: 'Template', path: 'templates/queer-nightclub/about.html' },
  { name: 'template/events.html', group: 'Template', path: 'templates/queer-nightclub/events.html' },
  { name: 'template/contact.html', group: 'Template', path: 'templates/queer-nightclub/contact.html' },
  { name: 'template/gallery.html', group: 'Template', path: 'templates/queer-nightclub/gallery.html' },
  { name: 'template/404.html', group: 'Template', path: 'templates/queer-nightclub/404.html' },
  { name: 'template/.htaccess', group: 'Template', path: 'templates/queer-nightclub/.htaccess' },
  { name: 'template/form-handler.php', group: 'Template', path: 'templates/queer-nightclub/form-handler.php' },
  { name: 'template/generate-assets.py', group: 'Template', path: 'templates/queer-nightclub/generate-assets.py' },
  { name: 'template/robots.txt', group: 'Template', path: 'templates/queer-nightclub/robots.txt' },
  { name: 'template/sitemap.xml', group: 'Template', path: 'templates/queer-nightclub/sitemap.xml' },
  { name: 'template/og-image.svg', group: 'Template', path: 'templates/queer-nightclub/og-image.svg' },
  // Commands & Skills
  { name: 'studio-build.md', group: 'Commands & Skills', path: 'commands/studio-build.md' },
  { name: 'site-init.md', group: 'Commands & Skills', path: 'commands/site-init.md' },
  { name: 'site-template.md', group: 'Commands & Skills', path: 'skills/site-template.md' },
];

const manifest = FILES.map(f => {
  const absPath = path.join(ROOT, f.path);
  const content = fs.existsSync(absPath) ? fs.readFileSync(absPath, 'utf8') : `(file not found: ${f.path})`;
  return { name: f.name, group: f.group, path: f.path, content };
});

const injection = `const BUNDLE_FILES = ${JSON.stringify(manifest, null, 2)};`;

const targetPath = path.join(ROOT, 'projects/design-studio/index.html');
let src = fs.readFileSync(targetPath, 'utf8');

if (!src.includes('// BUNDLE_FILES_PLACEHOLDER')) {
  console.error('Error: placeholder comment not found in design-studio/index.html');
  process.exit(1);
}

src = src.replace('// BUNDLE_FILES_PLACEHOLDER', injection);
fs.writeFileSync(targetPath, src, 'utf8');

const kb = Math.round(Buffer.byteLength(src, 'utf8') / 1024);
console.log(`Bundle injected: ${manifest.length} files into projects/design-studio/index.html (${kb} KB total)`);
