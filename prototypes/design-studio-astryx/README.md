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

The build imports only `@astryxdesign/core/Button` and keeps only the CSS rules whose class names
appear in the bundle (postcss, in `build.js`).

| Part | Before trim | After trim |
| --- | --- | --- |
| React 19 + react-dom | 178 KB | 178 KB |
| Astryx JS, one Button (+ 32 KB i18n parser) | 191 KB | 191 KB |
| Astryx CSS | 307 KB | 74 KB |
| Page | 686 KB (171 KB gzipped) | 452 KB (135 KB gzipped) |

The current React Lab is 40 KB, with React loaded from a CDN. Leaving React out of both, the
Astryx page is about 265 KB for one button, about 6.6 times the whole lab.

## Recommendation

Keep only the Astryx theme. One Button already costs about 6.6 times the whole current lab, and
the full studio would use 10 or more components, so the plan's limit of about 3 times cannot be
met. Bring the Studio theme values (purple accent, 16px type, 44px touch targets, 150/300/500 ms
motion) into the React Lab and the mod pane as tokens, and drop the component rebuild.

On desktop the Button is 32px, Astryx's default; 44px is set only on touch screens.
