# Design Studio Lab (sandbox prototype)

A sandboxed rebuild of the Unified Design Studio artifact, to see what React and Rust
would do for it. Nothing here is wired into the plugin, the test runner, or the live
artifact. Delete this folder to remove it.

Published prototype: <https://claude.ai/artifact/1HBSuUjqqrJ3rM1oBaWUQU>
Live studio (unchanged): <https://claude.ai/artifact/EskH6HuvdeS3qtKcMZ2mGH>

## What is here

| Path | What it is |
|---|---|
| `engine/data.js` | Presets, kinds, fonts and sample copy, copied unchanged from the live studio |
| `engine/color.js` | JavaScript colour engine: contrast, mix, fix-accent, accent wheel |
| `engine/studio.js` | Pure studio logic (tokens, review gate, prompt, MASTER.md, CSS). No DOM |
| `engine/wasm.js` | Loads the Rust engine and gives it the same shape as the JS engine |
| `engine/engine.test.js` | Unit tests plus a JS and Rust parity test |
| `engine/bench.js` | Node speed comparison of the two engines |
| `rust-engine/` | Standalone Rust crate (no dependencies) compiled to a 7 KB `.wasm` |
| `react/src/` | React components: Controls, Preview, ReviewGate, AccentWheel, Output, Compare |
| `react/build.js` | Bundles everything into one self-contained HTML file |
| `out/studio-lab.html` | The built page that is published as the artifact |

## Build and test

```bash
# Rust engine
cd prototypes/design-studio-lab/rust-engine
rustup target add wasm32-unknown-unknown
cargo test
cargo build --release --target wasm32-unknown-unknown

# Engine tests (includes the Rust parity test once the wasm is built)
cd ../../..
node --test prototypes/design-studio-lab/engine/engine.test.js
node prototypes/design-studio-lab/engine/bench.js

# Page
node prototypes/design-studio-lab/react/build.js
```

## Findings

| | Live studio | React | React + Rust engine |
|---|---|---|---|
| Size | 34.9 KB, no libraries | 32 KB of our code + React from CDN (~45 KB gzipped) | + 7.3 KB WASM |
| Changing it | One `render()` mixes logic and DOM, no tests | One component per feature, engine unit-tested | Two languages, kept honest by a parity test |
| Speed | Fine | Fine | Node: 1.4x faster. Chromium: 1.3 to 2x slower |
| New features | Hard to add | Fix-accent and accent wheel in ~60 lines | Shared engine with the ecc2 Rust control plane |
| Cost | Grows with every feature | esbuild step (< 1 s) | Rust toolchain, wasm target, build step |

Speed, best of 9 runs on the build machine:

| Task | JS (Node) | Rust (Node) | JS (Chromium) | Rust (Chromium) |
|---|---|---|---|---|
| Review-gate pass, 6 contrast checks | 7 µs | 3 µs | 1 µs | 2 µs |
| Accent wheel, 36 hues | 0.54 ms | 0.38 ms | 0.29 ms | 0.39 ms |
| Accent wheel, 3,600 hues | 56 ms | 39 ms | 29 ms | 39 ms |

Bugs in the live studio found while porting:

1. The default Soft accent `#c2577a` scores 4.4:1 under a button label and 4.1:1 as a
   link, so the studio's own review gate shows two Checks by default. The Brutalist
   orange fails as a link at 2.9:1. Fix-accent suggests `#bd4a70` for Soft.
2. The Copy button and the preview's hero text share the `.copy` class, so the hero
   text block is painted in the accent colour and its paragraph is hard to read.

A full Rust UI (Leptos or Dioxus) was not built. It would be a complete rewrite with
a larger download (200 KB+ of WASM) and slower iteration, for no visible gain here.

## Recommendation

Move the studio to React with the JavaScript engine. Keep the Rust engine for when
ecc2 needs the same colour checks natively, where it can share one crate with the web.
