# Anime.js Capability Audit + CodePen Pattern Mining → General Animation Toolkit

> Reusable reference for choosing, weighting, and implementing Anime.js (V4) animations.
> Target stack: **Vite + TypeScript + optional React / React-Three-Fiber**.
> All code sketches are typed (no `any`) and use the **V4 modular API** (`import { animate, ... } from 'animejs'`).

**Scope note / honesty disclaimer:** The official docs at `animejs.com/documentation/` block automated fetching (HTTP 403), and CodePen's search does not expose live like-counts to tooling (pen pages also 403). Phase 1 is reconstructed from the V4 API surface (cross-checked against the V4 release notes, the v3→v4 migration wiki, and a community GSAP→Anime mapping). Phase 2 pens are real and were selected by **technique value**; like-counts are labelled *approx/unverified* — treat them as "this technique is worth stealing," not as a leaderboard. Several top search hits are V3 + ScrollMagic + jQuery (which your constraints exclude); I kept the *technique* and rewrote the sketch in V4-native TS.

---

## Phase 1 — Anime.js V4 API Audit

V4 is a modular, tree-shakeable rewrite. You import only what you use, which changes the bundle-cost calculus versus GSAP (see deltas per row). Legend: **[PARITY]** GSAP has a direct equivalent · **[ADVANTAGE]** Anime.js lighter/simpler · **[GSAP ONLY]** GSAP wins.

| Category | What it does | Key V4 API | GSAP delta | Bundle delta |
|---|---|---|---|---|
| **Targets** | Selects what to animate: CSS selector, DOM node, NodeList, array, or **plain JS object** (drives Three.js/R3F values). | `animate(targets, params)`, `utils.$(selector)` | **[PARITY]** GSAP accepts the same range incl. JS objects. | ~0 — both trivial. |
| **Properties / tween values** | CSS transforms (`translateX/Y/Z`, `rotate`, `scale`, `skew`), arbitrary CSS props, SVG attributes, object props. Values support from-to arrays `[from,to]`, relative `'+=100'`, units, and **function-based values** `(el,i,len)=>…`. | `animate(el,{ x:100, opacity:[0,1], rotate:'1turn' })` | **[PARITY]**. Anime auto-detects transform shorthand (`x`→`translateX`). | ~0. |
| **Keyframes** | Per-property keyframe arrays *and* tween-level keyframe sequences with per-step duration/easing; percentage-based keyframes too. | `{ translateX:[{to:100},{to:0}] }` / `keyframes:[…]` | **[PARITY]**. GSAP uses `keyframes`/timelines; equivalent power. | ~0. |
| **Staggering** | Distributes delay/value across many targets; supports `from`, `start`, `ease`, **grid `[cols,rows]`**, `axis`, `reversed`, `modifier`. Usable for delay *or any value*, and as timeline positions. | `stagger(100,{ from:'center', grid:[14,5], axis:'x' })` | **[ADVANTAGE]**. Same expressiveness, but it's a first-class util usable anywhere; GSAP's is config-bound. | Anime wins — grid stagger is free in core. |
| **Timeline** | Sequenced multi-target orchestration with labels, absolute/relative/stagger positions, per-add overrides, nested sync. | `createTimeline({defaults}).add(t,p,pos).sync().label().call().set()` | **[PARITY]**. Both excellent. GSAP timelines are marginally richer for nested-timeline reuse. | Comparable. |
| **Playback controls** | Full transport: play/pause/restart/reverse/alternate/resume/complete/cancel/**revert**/seek/stretch/refresh; `.then()` Promise. | `anim.pause()`, `anim.seek(t)`, `anim.progress=0.5`, `await anim` | **[PARITY]**. `revert()` maps to GSAP `revert()`; `cancel()` maps to `kill()`. | ~0. |
| **Callbacks** | Lifecycle hooks. | `onBegin,onUpdate,onComplete,onLoop,onPause,onRender,onBeforeUpdate` + `then()` | **[PARITY]**. Renamed (`onStart`→`onBegin`, `onRepeat`→`onLoop`). | ~0. |
| **Easing** | Power eases (Quad…Bounce, in/out/inOut), `cubicBezier`, `steps`, `irregular`, **`createSpring({stiffness,damping,mass,velocity})`**, and custom `(t)=>number`. | `ease:'outExpo'`, `ease:createSpring({stiffness:120})` | **[PARITY]** / mild **[ADVANTAGE]** — spring + irregular built in (GSAP springs need CustomEase/plugins). | Anime wins — no plugin for spring. |
| **SVG** | Line drawing (`createDrawable`), shape morph (`morphTo`), motion path (`createMotionPath` → `{translateX,translateY,rotate}`). | `svg.createDrawable('.p')`, `svg.morphTo('#to')`, `svg.createMotionPath('#path')` | **[PARITY for the common 80%]**. GSAP MorphSVG handles disparate point counts more gracefully (see Section C). | **[ADVANTAGE]** — these are free; GSAP DrawSVG/MorphSVG are paid Club plugins. |
| **Motion path** | Move + auto-rotate an element along an SVG path. | `const {translateX,translateY,rotate}=svg.createMotionPath('#p'); animate(el,{translateX,translateY,rotate})` | **[PARITY]**. GSAP MotionPathPlugin adds `align`/`start`/`end` convenience. | **[ADVANTAGE]** — core in Anime. |
| **Scroll** | ScrollObserver: trigger or **scrub** (`sync`) Timer/Animation/Timeline on scroll, with `enter`/`leave` thresholds, container/axis, debug overlay, callbacks. | `onScroll({ sync:1, enter:'bottom top', leave:'top bottom' })` passed as a value | **[Partial PARITY]**. Covers reveal + scrub + thresholds. **[GSAP ONLY]** for pin/snap/horizontal-section orchestration + ScrollSmoother. | **[ADVANTAGE]** — in-core vs GSAP ScrollTrigger (~+11kb plugin). |
| **Timer** | Standalone rAF-driven timer/clock independent of any property, with same controls. | `createTimer({ duration, loop, onUpdate })` | **[ADVANTAGE]**. GSAP uses `delayedCall`/empty tween; Anime's `createTimer` is cleaner for game loops/clocks. | Anime wins. |
| **Animatable** | Pre-resolved, imperatively settable values for high-frequency input (cursor follow, audio) — no GC churn per frame. | `const a=createAnimatable(el,{x:0,y:0}); a.x(mx)` | **[ADVANTAGE]**. GSAP's `gsap.quickTo()` is the analog; Anime's API is more ergonomic for multi-prop. | Comparable. |
| **Draggable** | Drag DOM with inertia/physics, axis constraints, containers, snapping, release spring, callbacks. | `createDraggable(el,{ container, snap, releaseStiffness })` | **[Partial PARITY]**. GSAP Draggable + InertiaPlugin is the paid equivalent. | **[ADVANTAGE]** — free vs Club plugin. |
| **Scope** | Component-scoped animations: media-query reactivity, shared defaults, custom root, and **batch `.revert()`** — the React/Web-Component cleanup primitive. | `const s=createScope({root,mediaQueries}); …; s.revert()` | **[ADVANTAGE]**. Analogous to `gsap.context()`/`useGSAP`, but media-query reactivity is built in. | Comparable. |
| **Utils** | Selector + math/animation helpers: `set,get,remove,random,randomPick,snap,clamp,mapRange,round,lerp,wrap,degToRad,$`. | `utils.mapRange(x,0,1,0,100)`, `utils.snap(v,5)` | **[ADVANTAGE]**. GSAP exposes `gsap.utils.*` similarly; rough parity, Anime's are tree-shakeable. | Comparable. |
| **WAAPI hybrid** | `waapi.animate()` runs on the native Web Animations API for hardware-accelerated, off-main-thread CSS animations at minimal JS cost. | `import { waapi } from 'animejs'; waapi.animate(el,{…})` | **[ADVANTAGE]** — no GSAP equivalent; great for cheap, compositor-driven transitions. | **[ADVANTAGE]** — smallest possible footprint. |
| **Engine** | Global config: `timeUnit:'s'|'ms'`, master `speed`, `pauseOnDocumentHidden`, precision. | `engine.timeUnit='s'`, `engine.speed=2` | **[PARITY]**. `engine.timeUnit='s'` eases GSAP muscle-memory (GSAP defaults to seconds). | ~0. |

### Bundle-cost reality check
The "17kb vs 23kb" framing undersells V4's main lever: **tree-shaking**. With GSAP you ship core (~23kb min+gz) *plus each plugin* (ScrollTrigger ≈ +11kb, others +3–11kb each), and the heavy hitters (MorphSVG, DrawSVG, SplitText, Inertia) are **Club-licensed**. With Anime.js V4 you import only the functions you touch — an `animate`-only micro-interaction bundle is a few kb; a full kit (animate + timeline + svg + scroll + draggable) lands roughly in that ~15–17kb min+gz neighborhood, **with SVG-draw/morph/motion-path, scroll-scrub, draggable, and spring all included and MIT-licensed**. Net: for SVG-heavy or scroll-reveal UI, Anime.js is both lighter *and* cheaper (no Club). For pinned, scrubbed, snapping scroll storytelling, GSAP's plugin weight buys capability Anime can't match (Section C).

---

## Phase 2 — CodePen Pattern Mining

Selected by technique value across the seven query themes. `Stack-fit` = replicable on Vite + TS (+ optional React). `Impact` = subjective visual punch 1–5. Pens marked *(V3/legacy)* were rewritten to V4-native TS in Section B.

| # | Pen (source) | Technique | Core methods | Stack-fit | Est. effort | Impact |
|---|---|---|---|---|---|---|
| 1 | [Advanced staggering — juliangarnier/MZXQNV](https://codepen.io/juliangarnier/pen/MZXQNV) *(official, ~very high)* | Grid-based stagger ripple from a point | `stagger(v,{grid,from})` | Yes (direct) | quick | 5 |
| 2 | [Seamless infinite loop — juliangarnier/rGjMyW](https://codepen.io/juliangarnier/pen/rGjMyW) *(official)* | Looping timeline w/ alternating eases | `createTimeline`, `loop`, `alternate` | Yes (direct) | quick | 4 |
| 3 | [Fireworks canvas — juliangarnier/gmOwJX](https://codepen.io/juliangarnier/pen/gmOwJX) *(official, ~very high)* | Anime drives **canvas** particle props per-frame | `animate` on JS objects, `onRender` | Yes (direct) | half-day | 5 |
| 4 | [Scroll-controlled — equinusocio/GeBxJz](https://codepen.io/equinusocio/pen/GeBxJz) *(V3/legacy)* | Scrubbed progress tied to scroll | V4: `onScroll({sync})` | Yes (rewrite) | quick | 4 |
| 5 | [Text effect — SitePoint/NQYpNr](https://codepen.io/SitePoint/pen/NQYpNr) *(V3/legacy)* | Per-letter split + staggered transform | split + `stagger`, `animate` | Yes (rewrite) | quick | 4 |
| 6 | [Multi-line text — andrewmillen/rZjVKZ](https://codepen.io/andrewmillen/pen/rZjVKZ) *(V3/legacy)* | Line-masked reveal `translateY 100%→0` | `animate`, `stagger`, overflow mask | Yes (rewrite) | quick | 4 |
| 7 | [SVG path morph — spz/vbbQmM](https://codepen.io/spz/pen/vbbQmM) *(V3/legacy)* | Shape `d`-attribute morphing | V4: `svg.morphTo` | Yes (rewrite) | half-day | 5 |
| 8 | [SVG line/timeline — brianacamp/QBmzja](https://codepen.io/brianacamp/pen/QBmzja) *(V3/legacy)* | Stroke line-drawing reveal | V4: `svg.createDrawable` | Yes (rewrite) | quick | 4 |
| 9 | [Timeline orchestration — Shokeen/KqzmvV](https://codepen.io/Shokeen/pen/KqzmvV) | Labeled multi-target timeline + seek | `createTimeline`, labels, `seek` | Yes (direct) | quick | 3 |
| 10 | [Particles three.js+anime — keel/bYxOWZ](https://codepen.io/keel/pen/bYxOWZ) | Anime tweens **R3F/Three** object values | `animate` on `{x,y,z}` objects | Yes (direct) | day | 5 |
| 11 | [Morphing shapes — Shokeen/VWjzLL](https://codepen.io/Shokeen/pen/VWjzLL) | Looping multi-state morph | `svg.morphTo`, timeline | Yes (rewrite) | half-day | 4 |

*(Constraint compliance: every jQuery/ScrollMagic dependency was dropped; legacy `anime.stagger`/`anime.timeline` calls map to V4 `stagger`/`createTimeline`.)*

---

## Phase 3 — Synthesis Report

### Section A — When to use Anime.js over GSAP

Decision criteria by capability/weight, not taste:

1. **Bundle-budget-constrained micro-interactions** → Anime.js. Import only `animate` (or `waapi.animate`) and ship a few kb. GSAP makes you carry ~23kb core for one button hover.
2. **SVG line-draw / morph / motion-path is the core need** → Anime.js. These are MIT-licensed core; GSAP's DrawSVG/MorphSVG/MotionPath are Club-only. (Exception: morphing between paths with *very different point counts* — GSAP MorphSVG is more forgiving; see C.)
3. **Spring physics without a plugin** → Anime.js `createSpring()` is in-core.
4. **Driving non-DOM values** (Three.js/R3F objects, canvas particles, audio params) → either works (both animate plain JS objects); pick Anime to keep one lightweight engine if you're not already on GSAP.
5. **Component-scoped, media-query-reactive, auto-cleanup animations** → Anime.js `createScope()` is purpose-built and reverts in one call.
6. **MIT licensing / no Club membership** → Anime.js for the full feature set. (GSAP core is now free under a standard license, but the marquee plugins historically gated value behind Club.)
7. **Reach for GSAP instead when:** you need **ScrollTrigger pinning/snapping/horizontal-section storytelling**, **ScrollSmoother**, **FLIP layout transitions (Flip plugin)**, **SplitText's robust line/word/char splitting with masking**, **Inertia/Physics2D**, or a deep ecosystem of battle-tested scroll demos. These are capability gaps, not weight gaps.

**One-line heuristic:** *Lightweight UI motion, SVG, springs, scoped component animation, and simple-to-scrubbed scroll reveals → Anime.js. Pinned/snapped scroll narratives, FLIP, and heavy physics → GSAP.*

### Section B — Top 10 patterns worth adding to the toolkit

Ranked by **visual impact × ease of implementation**. Each ≈20-line typed TS sketch, V4 API.

```ts
// Shared setup (Vite + TS)
import {
  animate, createTimeline, stagger, svg, utils, onScroll,
  createScope, createDraggable, createSpring, createTimer,
} from 'animejs';
```

**1. Grid stagger ripple** *(MZXQNV — impact 5, quick)*
```ts
// A wave that radiates from the center of a tile grid.
const COLS = 14, ROWS = 5;
const grid = document.querySelector<HTMLElement>('.grid')!;
grid.style.cssText = `display:grid;grid-template-columns:repeat(${COLS},1fr)`;
grid.replaceChildren(
  ...Array.from({ length: COLS * ROWS }, () => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    return cell;
  }),
);
animate('.cell', {
  scale: [{ to: 0.2 }, { to: 1 }],
  backgroundColor: ['#2563eb', '#22d3ee'],
  delay: stagger(80, { grid: [COLS, ROWS], from: 'center' }),
  loop: true,
  alternate: true,
  ease: 'inOutQuad',
});
```

**2. Per-letter headline reveal (line-masked)** *(NQYpNr / rZjVKZ — impact 4, quick)*
```ts
// Split a heading into letters and stagger them up behind an overflow mask.
const h = document.querySelector<HTMLHeadingElement>('h1.reveal')!;
const letters: string = (h.textContent ?? '')
  .split('')
  .map((c) => `<span class="ltr" style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span>`)
  .join('');
h.style.overflow = 'hidden';
h.innerHTML = letters;
animate('.ltr', {
  translateY: ['1.1em', '0em'],
  opacity: [0, 1],
  rotate: [8, 0],
  duration: 700,
  delay: stagger(35, { from: 'first' }),
  ease: 'outExpo',
});
```

**3. SVG path morph loop** *(vbbQmM / VWjzLL — impact 5, half-day)*
```ts
// Morph one path through a set of shapes. morphTo interpolates the `d` attr.
const shapes: readonly string[] = ['#blob', '#star', '#hex'];
const tl = createTimeline({ loop: true });
shapes.forEach((sel) => {
  const target = document.querySelector<SVGPathElement>(sel)!;
  tl.add('#morph', { d: svg.morphTo(target), duration: 900, ease: 'inOutQuad' }, '+=300');
});
// Keep source & destination point counts equal for clean interpolation.
```

**4. SVG line-drawing reveal** *(QBmzja — impact 4, quick)*
```ts
// Animate stroke-dashoffset to "draw" outlines in. createDrawable proxies it.
const drawables = svg.createDrawable('.stroke-path'); // selects all matching paths
animate(drawables, {
  draw: ['0 0', '0 1'], // from "nothing drawn" to "fully drawn"
  duration: 1500,
  delay: stagger(120),
  ease: 'inOutSine',
});
```

**5. Scroll-scrubbed progress** *(GeBxJz — impact 4, quick)*
```ts
// Tie an animation's playhead to scroll position (native, no ScrollMagic).
animate('.panel', {
  translateX: ['-5%', '5%'],
  opacity: [0.4, 1],
  ease: 'linear',
  autoplay: onScroll({
    target: document.querySelector<HTMLElement>('.panel')!,
    enter: 'bottom top',  // start when element bottom hits viewport top
    leave: 'top bottom',
    sync: 1,              // scrub: progress follows scroll (1 = eased catch-up)
    // debug: true,       // overlay thresholds while building
  }),
});
```

**6. Scroll-reveal (trigger once)** *(impact 4, quick)*
```ts
// One-shot reveal as sections enter the viewport.
utils.$('.reveal-up').forEach((el: Element) => {
  animate(el as HTMLElement, {
    translateY: [40, 0],
    opacity: [0, 1],
    duration: 800,
    ease: 'outCubic',
    autoplay: onScroll({ target: el as HTMLElement, enter: 'bottom-=100 top', once: true }),
  });
});
```

**7. Canvas / particle field driven by Anime** *(gmOwJX — impact 5, half-day)*
```ts
// Anime owns the numbers; you paint them. Works for fireworks, confetti, fields.
interface Particle { x: number; y: number; r: number; a: number; }
const ctx = document.querySelector<HTMLCanvasElement>('#fx')!.getContext('2d')!;
const parts: Particle[] = Array.from({ length: 120 }, () => ({ x: 200, y: 200, r: 2, a: 1 }));
parts.forEach((p) => {
  animate(p, {
    x: utils.random(0, 400), y: utils.random(0, 400),
    r: [2, 6], a: [1, 0], duration: utils.random(800, 1600),
    loop: true, ease: 'outQuad',
  });
});
createTimer({
  onUpdate: () => {
    ctx.clearRect(0, 0, 400, 400);
    parts.forEach((p) => { ctx.globalAlpha = p.a; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
  },
});
```

**8. Drive a Three.js / R3F object** *(bYxOWZ — impact 5, day)*
```ts
// Anime animates plain {x,y,z} — perfect for non-DOM 3D values in R3F.
import type { Mesh } from 'three';
export function pulse(mesh: Mesh): void {
  animate(mesh.position, { y: 1.5, duration: 1200, loop: true, alternate: true, ease: createSpring({ stiffness: 90 }) });
  animate(mesh.rotation, { y: Math.PI * 2, duration: 4000, loop: true, ease: 'linear' });
  // In R3F, run inside useEffect; mesh.* mutates each frame, useFrame renders.
}
```

**9. Labeled timeline orchestration** *(KqzmvV — impact 3, quick)*
```ts
// Named positions make complex sequences readable and re-seekable.
const tl = createTimeline({ defaults: { duration: 600, ease: 'outQuad' } })
  .label('intro', 0)
  .add('.logo', { scale: [0, 1], opacity: [0, 1] }, 'intro')
  .add('.nav-item', { translateY: [-20, 0], opacity: [0, 1], delay: stagger(60) }, 'intro+=200')
  .label('outro')
  .add('.hero', { opacity: [0, 1], translateY: [30, 0] }, 'outro-=100');
document.querySelector('#skip')?.addEventListener('click', () => tl.seek(tl.duration));
```

**10. Physics drag with snap + release spring** *(impact 4, half-day)*
```ts
// Free-license draggable with inertia and snapping — GSAP Draggable+Inertia equivalent.
createDraggable('.card', {
  container: document.querySelector<HTMLElement>('.board')!,
  snap: 40,                       // snap to a 40px grid on release
  releaseStiffness: 120,          // springy settle
  onGrab: () => document.body.classList.add('dragging'),
  onRelease: () => document.body.classList.remove('dragging'),
});
```

**Bonus — React/R3F cleanup pattern** (use everywhere in components):
```tsx
import { useEffect, useRef } from 'react';
import { createScope, animate, stagger, type Scope } from 'animejs';

export function Reveal(): JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scope: Scope = createScope({ root }).add(() => {
      animate('.item', { opacity: [0, 1], translateY: [20, 0], delay: stagger(80) });
    });
    return () => scope.revert(); // one-call teardown on unmount
  }, []);
  return <div ref={root}>{/* .item children */}</div>;
}
```

### Section C — Gaps & risks (what Anime.js can't do, or does worse)

- **ScrollTrigger parity is partial.** `onScroll` gives you enter/leave thresholds, scrub (`sync`), containers, and callbacks — enough for reveals and scrubbed progress. It does **not** give you GSAP ScrollTrigger's **pinning**, **snap-to-section**, **horizontal section translation tied to vertical scroll**, or **ScrollSmoother**. Long scroll-storytelling sites still want GSAP.
- **SVG morph is less forgiving.** `svg.morphTo` interpolates the `d` attribute; for clean results source and destination should have **matching point counts/structure**. GSAP MorphSVG auto-resamples disparate paths and offers `shapeIndex`/`origin` tuning. Mismatched paths in Anime = visible wobble.
- **No FLIP/layout-transition primitive.** GSAP's Flip plugin (animate between two DOM layout states) has no Anime equivalent — you'd hand-roll `getBoundingClientRect` deltas.
- **Text splitting is DIY.** There's no robust, stable, official `SplitText` analog covering lines/words/chars with masking and resize re-splitting. You split manually (sketch #2) or pull a small helper. *(A community guide references a `createTextSplitter`; I could not verify it in the stable V4 surface — don't depend on it without checking the installed version's exports.)*
- **3D is value-level only.** Anime has no WebGL/3D renderer. It *can* drive Three.js/R3F object props beautifully (Section B #8), but there's no camera/scene/3D-transform convenience layer like a dedicated 3D engine — and no `rotationX/Y/Z` perspective helpers beyond CSS `rotateX/Y/Z`.
- **React integration caveats.** No official `useGSAP`-style hook. The correct pattern is `createScope({ root })` inside `useEffect` with `scope.revert()` cleanup (Bonus sketch). Forgetting `revert()` leaks animations across remounts/StrictMode double-invokes. Pass a `root` ref so selectors are scoped to the component, not the document.
- **Smaller demo ecosystem.** GSAP has a far larger corpus of copy-paste scroll/FLIP demos. Anime's V4 examples are growing but thinner, and **many top search results are V3** (`anime.timeline()`, `anime.stagger()`, ScrollMagic, jQuery) — don't paste them blind; the API moved.
- **Inertia/Physics breadth.** `createDraggable` covers drag inertia/snap/release-spring, but GSAP's InertiaPlugin/Physics2D/PhysicsProps cover throw-velocity tracking and richer physics props that Anime doesn't.

### Section D — Migration / coexistence note

**Can Anime.js and GSAP coexist in one project?** **Yes.** They're independent engines with separate global namespaces and their own rAF loops — importing both causes no runtime conflict, and tree-shaking keeps you from paying for unused parts. The only real hazard is **two engines animating the same property on the same element simultaneously** (they'll fight over the value each frame) — partition ownership by element/property, not by mixing on one target.

**Sensible split when both are present:**
- **GSAP** → ScrollTrigger-pinned/snapped scroll narratives, ScrollSmoother, Flip layout transitions, SplitText-heavy typography, Inertia/throw physics.
- **Anime.js** → lightweight UI micro-interactions, SVG draw/morph/motion-path, spring-eased component animation, `createScope` component lifecycles, canvas/R3F value driving, standalone timers.

**Migrating GSAP → Anime.js** (when dropping GSAP to cut weight):
- `gsap.to` → `animate`; `gsap.timeline` → `createTimeline`; `gsap.set` → `utils.set`; `gsap.fromTo` → array values `{ x: [0, 100] }`.
- Callbacks: `onStart→onBegin`, `onRepeat→onLoop` (others unchanged). `kill()→cancel()`, `revert()→revert()`.
- Props: `rotation→rotate`, `rotationX/Y/Z→rotateX/Y/Z`, `xPercent→translateX:'100%'`, `autoAlpha→opacity`+`visibility`.
- Loops: `repeat:-1→loop:true`, `yoyo:true→alternate:true`.
- **Time units:** GSAP is seconds, Anime is **milliseconds** by default. Set `engine.timeUnit = 's'` to keep existing numbers, or multiply by 1000.
- ScrollTrigger → `onScroll` **only for reveal/scrub cases**; pinning/snapping has no 1:1 and must be re-architected or kept in GSAP.

**Recommended default:** start new work on Anime.js V4 for weight + license; pull GSAP in *surgically* only when you hit a Section-C gap (pinned scroll, FLIP, robust SplitText, throw physics). Don't ship both engines just to use one GSAP feature you could approximate.

---

*Sources: Anime.js V4 API surface & release notes; v3→v4 migration wiki; community GSAP→Anime.js mapping (Makio64/animejs-v4-ai-guidelines); CodePen technique search across the seven query themes. Like-counts approximate/unverified per disclaimer above.*
