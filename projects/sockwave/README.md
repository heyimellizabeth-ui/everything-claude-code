# Sockwave

An immersive, single-page generative-art experience. Every visual is drawn at
runtime in the browser from a flow field (summed-sine pseudo-noise) — no images,
no external assets, no API calls. Cursor-reactive, scroll-tuned, and
reduced-motion aware.

The design language (Exaggerated Minimalism · Syncopate / Space Mono · electric
pink on ink) came directly from the `ui-ux-pro-max` design engine:

```bash
python3 src/ui-ux-pro-max/scripts/search.py "immersive interactive generative art" --design-system
```

## Stack

- [Astro](https://astro.build) (static output) — zero runtime framework
- Plain CSS design tokens (`src/styles/tokens.css`)
- Canvas 2D particle engine in TypeScript (`src/scripts/sockwave.ts`)

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output -> dist/
npm run preview    # serve the built site
```

## Deploy

Pushing changes under `projects/sockwave/**` to `main` triggers
`.github/workflows/deploy-sockwave.yml`, which builds the site and publishes it
to the `gh-pages` branch under `/sockwave` (alongside the bks26 guide, via
`keep_files`).

Live at: https://heyimellizabeth-ui.github.io/everything-claude-code/sockwave/

> The `base` path in `astro.config.mjs` must match the deploy subpath.

## Accessibility

- Respects `prefers-reduced-motion` (swaps the animation for a static poster
  frame) and offers a manual motion toggle.
- WCAG-AA contrast, visible keyboard focus, skip link, responsive 375–1440px.
