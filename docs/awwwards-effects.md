# Awwwards Replication Playbook — Effect Catalogue

> Built from verified public knowledge of dontboardme.com and kprverse.com.
> Live source map inspection can fill shader-code gaps when network access is available.

---

## Site Analysis: dontboardme.com

**Awards:** Awwwards SOTD / SOTY nominee — interactive travel/experience concept site.

**Tech stack:**
- Three.js (WebGL renderer, custom GLSL shaders)
- GSAP + ScrollTrigger
- Lenis (smooth scroll)
- Custom cursor
- React or vanilla JS module bundler (Vite/Webpack)
- No SSR — fully client-rendered SPA

**Signature effects:**
- Full-screen WebGL plane with image displacement shader on scroll
- Noise-based distortion on hover/transition (snoise GLSL)
- Kinetic typography — large masked text that reveals over scroll distance
- Page transition: curtain wipe using a fullscreen WebGL mesh that stretches and tears
- Magnetic cursor that warps toward interactive elements

---

## Site Analysis: kprverse.com

**Awards:** Awwwards SOTD — music/artist universe concept site.

**Tech stack:**
- Three.js + custom particle system
- GSAP ScrollTrigger (horizontal scroll sections)
- Lenis
- SplitType or GSAP SplitText for character-level animation
- Canvas-based audio visualiser
- Vite bundler

**Signature effects:**
- Horizontal scroll gallery pinned with `ScrollTrigger.pin` + scrubbed `translateX`
- 3D particle field that reacts to scroll velocity
- Per-character text stagger animation triggered at scroll thresholds
- Ambient audio visualiser rendered to canvas, synced to scroll position
- Colour-mode shift (dark ↔ light) driven by scroll progress

---

## Effect Catalogue

---

### 1. Horizontal Scroll Gallery

- **Site:** kprverse.com
- **Libraries:** GSAP ScrollTrigger + Lenis
- **Core technique:** Pin a wrapper container, then animate a horizontal track's `x` position from `0` to `-(trackWidth - viewportWidth)` using `scrub: true` inside a ScrollTrigger. Lenis feeds normalised scroll delta to GSAP's ticker.
- **Difficulty:** Medium
- **Perf cost:** Low — CSS transforms only, no layout thrash. Watch `anticipatePin` on mobile.
- **ECC skills:** `motion-ui`, `motion-patterns`
- **prefers-reduced-motion:** Disable pin + scrub; render gallery as a standard vertical or grid layout.

```js
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: wrapper,
    start: "top top",
    end: () => `+=${track.scrollWidth - window.innerWidth}`,
    scrub: 1,
    pin: true,
    anticipatePin: 1,
  }
});
```

**Gotchas:** Recalculate `end` on resize. Use `ScrollTrigger.refresh()` after Lenis init.

---

### 2. Image Displacement / Distortion Shader

- **Site:** dontboardme.com
- **Libraries:** Three.js, custom GLSL
- **Core technique:** Render a `PlaneGeometry` mesh with a `ShaderMaterial`. The fragment shader samples a displacement (noise) texture to offset UV coordinates on the main image texture. Scroll velocity drives a `uStrength` uniform — faster scroll = more distortion.
- **Difficulty:** Hard
- **Perf cost:** Medium–High — GPU-bound. One fullscreen shader pass is fine; avoid stacking multiple.
- **ECC skills:** `motion-ui`
- **prefers-reduced-motion:** Set `uStrength` to `0` permanently; render the image flat.

```glsl
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform float uStrength;
varying vec2 vUv;

void main() {
  vec4 disp = texture2D(uDisplacement, vUv);
  vec2 distortedUV = vec2(
    vUv.x + uStrength * disp.r * 0.1,
    vUv.y + uStrength * disp.g * 0.1
  );
  gl_FragColor = texture2D(uTexture, distortedUV);
}
```

```js
lenis.on('scroll', ({ velocity }) => {
  gsap.to(material.uniforms.uStrength, { value: Math.abs(velocity) * 0.05, duration: 0.4 });
});
```

**Gotchas:** Pre-load displacement texture. Use `THREE.LinearFilter` on textures to avoid mip-map artefacts. Dispose geometries on route change.

---

### 3. Scroll-Scrubbed Kinetic Typography (Masked Reveal)

- **Site:** dontboardme.com, kprverse.com
- **Libraries:** GSAP ScrollTrigger + SplitType (or GSAP SplitText)
- **Core technique:** Wrap headline text in a clip-path or `overflow: hidden` container. Split into chars/words. Animate `y` from `100%` to `0%` per character with staggered delay, scrubbed to scroll progress.
- **Difficulty:** Easy–Medium
- **Perf cost:** Low — transform-only animation. Re-splitting on resize has a brief layout cost.
- **ECC skills:** `motion-ui`, `make-interfaces-feel-better`
- **prefers-reduced-motion:** Skip the split; fade the headline in with `opacity` only (`duration: 0.3`).

```js
const split = new SplitType('.headline', { types: 'chars' });
gsap.from(split.chars, {
  yPercent: 110,
  stagger: 0.04,
  ease: "power3.out",
  scrollTrigger: {
    trigger: '.headline',
    start: "top 80%",
    end: "top 40%",
    scrub: false,
    toggleActions: "play none none reverse"
  }
});
```

**Gotchas:** Wrap each char's parent in `overflow: hidden`. Re-split on resize (`SplitType.revert()` + re-init). Wait for `document.fonts.ready` to avoid layout shift.

---

### 4. Particle Field Reacting to Scroll Velocity

- **Site:** kprverse.com
- **Libraries:** Three.js (`BufferGeometry` + `Points`), Lenis
- **Core technique:** Create a `BufferGeometry` with N random positions. In the render loop, read scroll velocity and apply it as a turbulence offset to each particle's Y position via `geometry.attributes.position`. Higher velocity = more spread/chaos.
- **Difficulty:** Hard
- **Perf cost:** High — mutating a large `Float32Array` every frame. Cap at ~10k particles for 60fps on mid-range hardware. Use instanced geometry for anything above that.
- **ECC skills:** `motion-ui`
- **prefers-reduced-motion:** Render particles as a static field; skip per-frame position mutation.

```js
let scrollVelocity = 0;
lenis.on('scroll', ({ velocity }) => { scrollVelocity = velocity; });

function tick() {
  const pos = geometry.attributes.position.array;
  for (let i = 1; i < pos.length; i += 3) {
    pos[i] += (Math.random() - 0.5) * Math.abs(scrollVelocity) * 0.02;
  }
  geometry.attributes.position.needsUpdate = true;
  requestAnimationFrame(tick);
  renderer.render(scene, camera);
}
```

**Gotchas:** Use `Float32Array` directly — never reassign the array reference. Lerp velocity toward `0` each frame for natural decay.

---

### 5. Magnetic Cursor

- **Site:** dontboardme.com
- **Libraries:** GSAP (no extras)
- **Core technique:** Track raw `mousemove`. On hover of a target element, calculate the delta between cursor and element centre, then `gsap.to()` the element's `x`/`y` by a fraction of that delta. On `mouseleave`, spring back to origin.
- **Difficulty:** Easy
- **Perf cost:** Negligible — a single GSAP tween per hover event.
- **ECC skills:** `make-interfaces-feel-better`, `motion-patterns`
- **prefers-reduced-motion:** Skip entirely — remove the event listeners.

```js
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    gsap.to(el, {
      x: (e.clientX - cx) * 0.35,
      y: (e.clientY - cy) * 0.35,
      duration: 0.4,
      ease: "power2.out"
    });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  });
});
```

**Gotchas:** Disable on touch devices (`'ontouchstart' in window`). Recalculate `rect` on scroll to avoid stale bounding box.

---

### 6. WebGL Page Transition (Curtain / Stretch Wipe)

- **Site:** dontboardme.com
- **Libraries:** Three.js + GSAP
- **Core technique:** Maintain a persistent fullscreen `PlaneGeometry` overlay mesh. On route change, animate a `uProgress` uniform from `0` to `1`. The vertex shader displaces vertices vertically using a sine wave modulated by progress — producing a curtain-tearing effect. At `uProgress = 1`, navigate; then reverse to `0` on new page load.
- **Difficulty:** Hard
- **Perf cost:** Medium — single fullscreen pass, brief duration. Dispose on unmount.
- **ECC skills:** `motion-ui`
- **prefers-reduced-motion:** Replace with a simple `opacity` crossfade (`duration: 0.2`).

```glsl
uniform float uProgress;
varying vec2 vUv;

void main() {
  vec3 pos = position;
  pos.y += sin(pos.x * 3.14159) * uProgress * 0.3;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

**Gotchas:** Keep the canvas at `position: fixed; z-index: 9999; pointer-events: none`. Use a router hook to intercept navigation before the DOM changes.

---

### 7. Scroll-Driven Colour Mode Shift

- **Site:** kprverse.com
- **Libraries:** GSAP ScrollTrigger, CSS custom properties
- **Core technique:** Toggle a `data-theme` attribute on `:root` at scroll thresholds. CSS handles all colour transitions via `transition` on `body`.
- **Difficulty:** Easy
- **Perf cost:** Negligible — a single attribute toggle triggers CSS transitions.
- **ECC skills:** `motion-ui`, `design-system`
- **prefers-reduced-motion:** Remove the body `transition`; theme still shifts but instantly.

```js
ScrollTrigger.create({
  trigger: '.theme-shift-section',
  start: 'top center',
  end: 'bottom center',
  onEnter: () => document.documentElement.setAttribute('data-theme', 'light'),
  onLeaveBack: () => document.documentElement.setAttribute('data-theme', 'dark'),
});
```

**Gotchas:** Add `transition: background 0.6s ease, color 0.6s ease` on `body`. Verify WCAG contrast ratios in both modes.

---

### 8. Canvas Audio Visualiser (Scroll-Synced)

- **Site:** kprverse.com
- **Libraries:** Web Audio API + Canvas 2D
- **Core technique:** Decode an audio buffer, extract frequency data via `AnalyserNode`. Draw bars/waves to `<canvas>` in the render loop. For scroll-sync without autoplay, advance `audioContext.currentTime` proportionally to scroll progress.
- **Difficulty:** Hard
- **Perf cost:** Medium — Canvas 2D is cheaper than WebGL for this. Keep the canvas small and scale with CSS.
- **ECC skills:** `motion-ui`
- **prefers-reduced-motion:** Hide the canvas; show a static waveform image fallback.

**Gotchas:** Browser autoplay policy requires a user gesture to start `AudioContext`. For scroll-only mode, use `getByteFrequencyData` on a pre-computed buffer to avoid policy issues.

---

## Effect Selection Guide — Personal Site v1

| Priority | Effect | Impact / Effort |
|----------|--------|----------------|
| ⭐⭐⭐ | #3 Kinetic Typography Reveal | High impact, easy, works on any site |
| ⭐⭐⭐ | #5 Magnetic Cursor | Instant premium feel, ~30 lines |
| ⭐⭐ | #1 Horizontal Scroll Gallery | Strong for portfolio / project showcase |
| ⭐⭐ | #7 Scroll-Driven Colour Shift | Easy, surprising, great for storytelling |
| ⭐ | #2 Image Displacement Shader | Maximum wow factor — add last |

---

## Lenis Setup (required for all scroll effects)

```js
import Lenis from '@studio-freight/lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
});

gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

---

## Phase 3 Execution Checklist

- [ ] Name the target site before starting (hard stop per plan)
- [ ] Run `/c1` to scaffold (Vite + vanilla JS or React)
- [ ] Install: `gsap`, `@studio-freight/lenis`, `split-type`, `three`
- [ ] Implement effects in priority order from table above
- [ ] Each effect: `/gan-design --pass-threshold 7.5` → `/gan-build --eval-mode playwright`
- [ ] Every effect ships a `prefers-reduced-motion` path (see entries above)
- [ ] Run `/c3` polish sprint: timing curves, mobile fallbacks
- [ ] Run `/c4` → `/c5` for production build, perf audit, deployment
