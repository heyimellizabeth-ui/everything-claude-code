// @ts-check
import { defineConfig } from 'astro/config';

// Sockwave deploys to a subpath of the everything-claude-code GitHub Pages site,
// alongside the existing bks26 guide. Keep `site` + `base` in sync with the
// deploy-sockwave.yml workflow (publishes to /sockwave on the gh-pages branch).
export default defineConfig({
  output: 'static',
  site: 'https://heyimellizabeth-ui.github.io',
  base: '/everything-claude-code/sockwave',
  compressHTML: true,
});
