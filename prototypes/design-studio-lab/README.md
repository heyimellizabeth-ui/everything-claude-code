# Design Studio Lab (sandbox prototype)

A sandboxed rebuild of the Unified Design Studio artifact in React, to see what a
component-based UI would do for it. Nothing here is wired into the plugin, the test runner, or the live
artifact. Delete this folder to remove it.

Published prototype: <https://claude.ai/artifact/1HBSuUjqqrJ3rM1oBaWUQU>
Live studio (unchanged): <https://claude.ai/artifact/EskH6HuvdeS3qtKcMZ2mGH>

## What is here

| Path | What it is |
|---|---|
| `engine/data.js` | Presets, kinds, fonts and sample copy, copied unchanged from the live studio |
| `engine/color.js` | Colour engine: contrast, mix, fix-accent, accent wheel |
| `engine/studio.js` | Pure studio logic (tokens, review gate, prompt, MASTER.md, CSS). No DOM |
| `engine/engine.test.js` | Unit tests for the engine and studio outputs |
| `react/src/` | React components: Controls, Preview, ReviewGate, AccentWheel, Output, Compare |
| `react/build.js` | Bundles everything into one self-contained HTML file |
| `out/studio-lab.html` | The built page that is published as the artifact |

## Build and test

```bash
node --test prototypes/design-studio-lab/engine/engine.test.js
node prototypes/design-studio-lab/react/build.js
```

## Findings

| | Live studio | React |
|---|---|---|
| Size | 34.9 KB, no libraries | 32 KB of our code + React from CDN (~45 KB gzipped) |
| Changing it | One `render()` mixes logic and DOM, no tests | One component per feature, engine unit-tested |
| Speed | Fine | Fine, redraws only what changed |
| New features | Hard to add | Fix-accent and accent wheel in ~60 lines |
| Cost | Grows with every feature | esbuild step (< 1 s) |

Bugs in the live studio found while porting:

1. The default Soft accent `#c2577a` scores 4.4:1 under a button label and 4.1:1 as a
   link, so the studio's own review gate shows two Checks by default. The Brutalist
   orange fails as a link at 2.9:1. Fix-accent suggests `#bd4a70` for Soft.
2. The Copy button and the preview's hero text share the `.copy` class, so the hero
   text block is painted in the accent colour and its paragraph is hard to read.

## Recommendation

Move the studio to React. A Rust engine was tried and removed: it was slower than
JavaScript in the browser and added a second toolchain.

## Studio theme (from the Astryx spike)

The lab's own page uses the Studio theme values in `react/template.html`: purple accent (`#7c3aed`
light, `#a78bfa` dark), 16px base type, 44px controls on touch screens (36px otherwise), and
150/300/500 ms motion as `--dur-fast/-medium/-slow`. The pane in `plugins/design-studio` draws with
terminal elements, so it has no type size, control height or motion to set; it is unchanged.
