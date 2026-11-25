# Design Studio on Astryx: sandbox plan

Status: plan only, nothing built. Live doc: <https://claude.ai/artifact/T5WKXgXyokU2ET3xwCU1ec>

## Summary

Build a second lab, `prototypes/design-studio-astryx/`, that keeps the React Lab's tested engine and
swaps its hand-made UI for Astryx components under a purple Studio theme. It ships as its own private
artifact with a Compare view against the current lab, in a draft PR. The live studio, the mod pane and
draft PR 69 are not touched. At the end: adopt it, keep only the theme, or drop it.

## Where things stand

- **React Lab** (PR 64, merged): `prototypes/design-studio-lab/`. Pure `engine/` with unit tests, React
  components in `react/src/`, 40 KB built page with React from a CDN.
- **Mod pane** (PR 65, merged): `plugins/design-studio/`. Its README says the lab was ported to the mod's
  own elements, not React, so Astryx components most likely cannot run in the pane (not yet confirmed).
- **Editable studio**: draft PR 69. Left alone.
- **Astryx**: React plus StyleX, core/lab/theme packages built with pnpm. Step 4 of the unified design
  system, with a MASTER.md-to-theme recipe.

## Sandbox setup

- **Where:** new folder `prototypes/design-studio-astryx/`, own branch and draft PR. Delete the folder to remove it.
- **Engine:** imported from `design-studio-lab/engine/` unchanged, so both labs give the same outputs.
- **UI:** the same six panels (Controls, Preview, Review gate, Accent wheel, Output, Compare) from Astryx components.
- **Theme:** one Studio theme from MASTER.md with the purple accent. Astryx fixes live in this theme.
- **Build:** esbuild into one self-contained HTML file with Astryx's prebuilt CSS inlined.
- **Compare:** toggle showing the current lab and the Astryx lab side by side, plus a size and checks table.

## Build phases

1. **Spike:** one Astryx Button with the Studio theme in a single HTML file. Check: renders offline, bundle size known. Stop if it fails.
2. **Theme:** Studio theme with fixed defaults. Check: every text/control pair passes 4.5:1, purple kept.
3. **Panels:** swap one at a time. Check: engine tests pass, outputs match the current lab.
4. **Compare and publish:** Compare view, private artifact, draft PR. Check: works at 390 px, light and dark.
5. **Owner call:** adopt, theme only, or drop.

## Astryx fixes, applied in the Studio theme

| Issue | Fix in the sandbox |
| --- | --- |
| Stock themes fail contrast (stone, neutral, butter, matcha, chocolate, gothic) | Not used; Studio theme checked against 4.5:1 |
| Base type 14px | 16px |
| Control height | 44px on touch |
| Motion | 150, 300 and 500 ms |
| CLI fails, `commander` missing | Skipped; packages imported directly |

Fixing these upstream in Astryx is a separate, later job.

## How we judge it

| Measure | Current lab | Astryx lab passes if |
| --- | --- | --- |
| Page size | 40 KB plus React | Under about 3x the current size |
| Review gate on defaults | Two warnings | No warnings |
| Owner decisions in the design rules | Followed | All followed |
| Phone width and keyboard use | Works | Works, with visible focus |
| Look | Baseline | Preferred side by side |

If it wins, a later job brings the Astryx look into the mod pane, as a theme at least.

## Risks and open questions

- **Cost:** the full build (phases 2 to 4) needs more credit than is available now.
- **Mod pane:** if the pane cannot run React, Astryx there means its theme only.
- **Size:** StyleX CSS plus components could make the page much larger; the spike shows this early.
- **Open:** compare against the React Lab (proposed) or the older live studio?
