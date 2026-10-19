# Sockwave

An immersive, single-page generative-art experience. Every visual is drawn at
runtime in the browser from a flow field (summed-sine pseudo-noise) — no
images, no API calls. The only external requests are Google Fonts (Syncopate and
Space Mono). Cursor-reactive, scroll-tuned, and reduced-motion aware.

The design language (Exaggerated Minimalism · Syncopate / Space Mono · electric
pink on ink) came from the
[ui-ux-pro-max](https://github.com/heyimellizabeth-ui/ui-ux-pro-max-skill)
design engine.

## Stack

- [Astro](https://astro.build) (static output) — zero runtime framework. This is
  a standalone ESM app with its own `"type": "module"` in `package.json`,
  separate from the repo's CommonJS tooling.
- Plain CSS design tokens (`src/styles/tokens.css`)
- Canvas 2D particle engine in plain JavaScript with JSDoc types
  (`src/scripts/sockwave.mjs`)

## Develop

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output -> dist/
npm run preview    # serve the built site
```

## Deploy

Pushing changes under `projects/sockwave/**` to `main` triggers
`.github/workflows/deploy-sockwave.yml`, which builds the site and replaces only
the `sockwave/` folder on the `gh-pages` branch.

The bks26 guide is published to the `gh-pages` root by
`.github/workflows/deploy-bks26-guide.yml`. That workflow replaces everything
at the root except `sockwave/` and `.nojekyll`, so the two deploys can run in
either order. Both keep a `.nojekyll` file so Pages serves `_astro/` assets
instead of running Jekyll over them.

Live at: https://heyimellizabeth-ui.github.io/everything-claude-code/sockwave/

> The `base` path in `astro.config.mjs` must match the deploy subpath.

## Social preview

`public/og.png` (1200x630) is the image used for link previews. It is rendered
from `public/og.svg`, so re-render the PNG whenever the SVG changes.

## Accessibility

- Respects `prefers-reduced-motion` (swaps the animation for a static poster
  frame) and offers a manual motion toggle.
- Content is visible without JavaScript; the reveal animation only applies when
  JS is running.
- WCAG-AA contrast, visible keyboard focus, skip link, responsive 375–1440px.
