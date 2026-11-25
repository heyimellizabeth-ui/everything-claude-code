# Design Studio on Astryx: spike (phase 1)

Phase 1 of `docs/design/astryx-studio-sandbox-plan.md`: one Astryx Button with the Studio theme,
bundled into one self-contained HTML file. Nothing here is wired into the plugin, the tests or the
live studio. Delete this folder to remove it.

## Build

```bash
cd prototypes/design-studio-astryx
npm install
node build.js   # writes out/spike.html
```

Uses the published `@astryxdesign/core@0.7.17` and its prebuilt `astryx.css`, so the Astryx CLI
(the `commander` failure) and a pnpm build of the Astryx repo are not needed.

## Result

It works. The page renders offline in Chromium with no errors. The primary Button shows the
purple accent `#7c3aed` with white text (5.7:1) and 16px type. The theme overrides go in the
`astryx-theme` layer in `theme.css`, so no Astryx source is changed.

| Part | Size |
| --- | --- |
| JS (React 19 + Astryx, minified) | 378 KB |
| Astryx CSS (whole library) | 307 KB |
| Page | 686 KB, 171 KB gzipped |
| Current React Lab, for comparison | 40 KB plus React from a CDN (about 45 KB gzipped) |

## What this means for the plan

- The page is far over the plan's "about 3x" size limit, mostly because esbuild cannot drop the
  unused parts of the full `astryx.css`, and the JS bundle includes React.
- Phase 2 should first try importing only the components it uses and trimming the CSS to their
  rules. If the page stays above about 150 KB gzipped, keep the Astryx theme only.
- Control height of 44px is set only on touch screens (`pointer: coarse`); on desktop the Button is
  32px, Astryx's default.
