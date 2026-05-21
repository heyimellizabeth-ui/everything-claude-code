# Plan: Analyse Awwwards Sites & Build Replication Playbook

## Goal (done-criteria — explicit)

Deconstruct 2 SOTY-level sites, produce a structured effect catalogue, then
replicate **3–5 chosen effects** end-to-end into **one named target site**,
each passing the `/gan-design` evaluator at **≥7.5** and verified live via
`/gan-build --eval-mode playwright`. Done = effects shipped into the site,
not a plan to ship them.

> **Target site must be named before Phase 3 begins.** Replication has no
> meaning without a destination. If unnamed, stop and resolve.

---

## Known environment constraints (from ECC audit — do not rediscover mid-build)

- **`deep-research` runs degraded** — `firecrawl` MCP is not in `.mcp.json`.
  Research falls back to **exa-only**. Acceptable, but expect thinner crawl
  coverage. Supplement with `context7` for library-specific docs (GSAP,
  Three.js, Lenis APIs).
- **`motion-foundations` is missing** — `motion-patterns` imports tokens from
  it. Before any `/c3` run that touches `motion-patterns`, define a local
  tokens file (durations, easings, distances) or the motion skills will
  reference a non-existent dependency. **Resolve this first.**
- **`/multi-*` and `/santa-loop` degrade to Claude-only** — no Gemini/Codex
  peers configured. Not used in this plan's critical path, but if `/c4` is
  invoked for shipping, `/santa-loop`'s dual-review guarantee is lost.
- **Playwright + exa + context7 + github + memory** — all connected. ✅

---

## Model Routing

> **`/model-route` decides at runtime — this table is the brief you hand it,
> not a hard rule.** The ECC audit confirms `/model-route` output is advisory
> only, with no automated handoff to the recommended tier. Where a chain
> command spawns sub-agents (`/gan-design`, `/gan-build`, `/santa-loop`,
> `/multi-*`), the *evaluator* and the *generator* can and should run on
> different tiers — see notes.

| Task | Tier | Why |
|------|------|-----|
| **1a–1d Playwright inspection** (navigate, snapshot, network, evaluate) | **Haiku** | Mechanical tool-calling and DOM/network extraction. No reasoning depth needed — route cheap, run fast. |
| **1c scroll-frame diffing** (deciding what's scrubbing) | **Sonnet** | Light visual reasoning over frame deltas. Haiku will miss subtle transform-vs-canvas distinctions. |
| **1d source-map triage** | **Haiku** | Fetch + status-check + grep. Pure mechanics. |
| **Phase 2 — writing the effect catalogue** | **Opus** | Synthesis across sites, technique inference, perf-cost judgement. This is the analytical core — don't cheap out. Wrong here and every downstream replication inherits the error. |
| **3a `frontend-design-direction`** (Purpose/Audience/Tone gate) | **Opus** | Strategic judgement — which effects serve the brief vs. which are cargo-culted. The highest-leverage decision in the plan. |
| **3b `motion-foundations` token file** | **Sonnet** | Bounded, well-specified authoring. Opus is overkill; Haiku may produce inconsistent scales. |
| **3d `/gan-design` — GENERATOR** | **Opus** | Generating award-bar visual design is the creative ceiling. Generator quality caps the whole loop. |
| **3d `/gan-design` — EVALUATOR** | **Opus** (distinct instance) | The "would this win an award?" judge must be at least as capable as the generator, or it rubber-stamps weak output. Separate context, same tier. |
| **3d `/gan-build` — GENERATOR** | **Sonnet** | Implementation from a settled spec. Strong coder tier; reserve Opus budget for the design loop, not the build loop. |
| **3d `/gan-build` — EVALUATOR** (`--eval-mode playwright`) | **Sonnet** | Verifying "does it render/behave" is checkable, not subjective. Sonnet + Playwright ground-truth suffices. |
| **`/c3` → `/model-route`** | **Haiku** | It only emits a recommendation. Cheap. |
| **`/c3` → `/quality-gate`, `/code-review`** | **Sonnet** | Lint/type/standards review is pattern-matching against known rules. Sonnet is the sweet spot. |
| **`/c3` → `design-system` audit** (AI-slop detection) | **Opus** | Detecting generic/derivative design needs taste, not rules. Tier up. |
| **(opt) `/c4` → `/security-scan`** | **Sonnet** | AgentShield does the scanning; the model interprets output. Sonnet handles it. |
| **(opt) `/c4` → `/santa-loop`** | **Opus** ×2 | Adversarial dual-review — both reviewers must be top-tier or the "convergence" is meaningless. ⚠️ degraded to Claude-only here (no Gemini/Codex peer), so both seats are Claude; make them both Opus to partially compensate for the lost model diversity. |

**Routing principles for this plan:**
- **Spend Opus where judgement compounds:** catalogue synthesis (2), design
  direction (3a), and the `gan-design` generator+evaluator (3d). Errors there
  propagate everywhere downstream.
- **Spend Sonnet on bounded build/review:** token files, `gan-build`,
  quality-gate, code-review. Known-good patterns, checkable output.
- **Spend Haiku on mechanics:** browser tool-calling, source-map fetches,
  the advisory `/model-route` call itself.
- **Generator/evaluator asymmetry rule:** an evaluator must never be a weaker
  tier than the generator it judges — a weaker judge approves slop. For
  `gan-design`, both Opus. For `gan-build`, both Sonnet.

> If your fork pins a specific generation (Opus 4.6 vs 4.7, Sonnet 4.6), the
> tier mapping above still holds — route to the **newest** model at each tier,
> since the design-judgement tasks (2, 3a, 3d-eval) benefit most from
> latest-gen reasoning.

---

## Phase 1 — Observe: Deep Analysis of Target Sites

### 1a. Live Visual Inspection (Playwright MCP)

Per site (`https://dontboardme.com/`, `https://kprverse.com/`):

- `browser_navigate` to the site
- `browser_network_requests` **first** — capture every loaded bundle, font,
  and asset. This is the primary signal for library *presence*.
- `browser_snapshot` for DOM structure
- `browser_take_screenshot` (full page) for the static baseline

### 1b. Tech Stack Fingerprinting (`browser_evaluate`)

Library *presence* comes from network requests (1a). Use `browser_evaluate`
only for *config* and runtime state:

```js
({
  next: !!window.__NEXT_DATA__,
  gsap: window.gsap?.version ?? null,
  gsapPlugins: window.gsap ? Object.keys(window.gsap.plugins ?? {}) : [],
  three: window.THREE?.REVISION ?? null,
  canvasCount: document.querySelectorAll('canvas').length,
  // Lenis/Locomotive rarely attach to window — detect by DOM signature:
  lenis: !!document.querySelector('html.lenis, [data-lenis]'),
  locomotive: !!document.querySelector('[data-scroll-container]'),
  fonts: [...document.fonts].map(f => f.family).filter((v,i,a)=>a.indexOf(v)===i)
})
```

> Do **not** rely on `window.Lenis` / `window.locomotive` — both are usually
> module-scoped. DOM signature + the network request for the lib is the
> reliable tell.

### 1c. Scroll-linked Capture (deterministic, not key-press loop)

Replace arbitrary key-press scrolling with fixed-interval capture so frames
are reproducible and diffable:

```js
// run via browser_evaluate, then screenshot after each step
const max = document.body.scrollHeight - window.innerHeight;
const steps = 12;
// caller drives: for i in 0..steps -> evaluate(scrollTo) -> screenshot
window.scrollTo(0, Math.round((STEP/steps) * max));
```

Diff consecutive frames to isolate what's scrubbing (transform, opacity,
canvas redraw) vs. what's static.

### 1d. Source Inspection (best-effort, expect failure)

SOTY sites usually strip or hide source maps. Don't fetch a guessed
`main.js.map`. Instead:

1. From `browser_network_requests`, grab the actual loaded JS bundle URLs.
2. For each, check the foot of the file for `//# sourceMappingURL=`.
3. Fetch only those referenced map URLs. **Most will 404 — that's expected.**
   This step informs, never blocks.

---

## Phase 2 — Synthesise: Effect Catalogue

Write `docs/awwwards-effects.md`. Entry schema:

```
## <Effect name>
- Site: <source>
- Libraries: <from network + fingerprint>
- Core technique: <one-line mechanism>
- Difficulty: low | medium | high
- Perf cost: <Lighthouse/CLS/main-thread impact — honest>
- ECC skills: motion-ui | motion-patterns | make-interfaces-feel-better
- prefers-reduced-motion: <how the effect degrades>
- Replication snippet: <inline or link>
```

Categories: scroll-linked (parallax, scrub, pin) · WebGL/canvas (displacement,
noise, particles) · typography (split, kinetic, SVG path) · cursor (magnetic,
trailing, morph) · page transitions (FLIP, shared-element, curtain) ·
micro-interactions (hover, click, idle).

**Two required columns the original plan omitted:**
- **Perf cost** — these effects tank Lighthouse. Decide a perf floor now or
  you'll catalogue things you can't ship.
- **prefers-reduced-motion** — non-negotiable per replication, not an
  afterthought. Every snippet ships with a reduced-motion path.

---

## Phase 3 — Replicate

### 3a. Design direction gate (`frontend-design-direction` skill)

Run **before** picking effects. Define Purpose / Audience / Tone / Memorable
Detail / Constraints for the named target site. Not every Awwwards effect
survives contact with the brief — this gate decides which 3–5 do. Effects
that don't serve Purpose get cut here, not after they're built.

### 3b. Resolve `motion-foundations` (blocking)

Define the missing tokens file before any motion work. Minimum:
durations (150/250/400ms), easings (spring + standard), stagger (30–50ms),
travel distances. Otherwise `motion-patterns` references a dead dependency.

### 3c. Chain — use `/c3`, not `/c2 → /c3`

For effect replication on an existing site:

| Stage | Chain | Why |
|-------|-------|-----|
| Replicate effects into existing site | **`/c3 [brief]`** | Only chain with both `/gan-design` AND `/gan-build` — the generate→evaluate loop this whole plan is built on |
| Greenfield (if target site is new) | `/c1 [desc]` | Full spec→ship |
| Production hardening (optional) | `/c4` | ⚠️ `/santa-loop` dual-review degraded — Claude-only |

`/c3` internally runs: `/model-route` → `/gan-design` → `/gan-build` →
`/quality-gate` → `/code-review`. That covers iteration, build, and review in
one chain. Running `/c2` first double-runs `gan-design` and `code-review` for
what is a pure design task — drop it.

### 3d. Per-effect loop

For each chosen effect, feed `/gan-design` a brief derived from its catalogue
entry:

```
/gan-design "<effect> for <target site> — <technique>, must respect
prefers-reduced-motion, perf floor <X>" --pass-threshold 7.5
```

Then `/gan-build "<same effect>" --eval-mode playwright` to verify the built
effect renders and behaves in-browser.

### 3e. Skills the `/c3` chain will pull

| Effect type | Skill |
|-------------|-------|
| Scroll/animation | `motion-ui`, `motion-patterns` (after 3b) |
| UI polish | `make-interfaces-feel-better` |
| Visual direction | `frontend-design-direction` |
| Design-system audit | `design-system` (context-activated via `/code-review`) |
| Research | `deep-research` (exa-only — degraded), `exa-search`, `context7` |

---

## Execution Order

1. **Resolve blockers** — define `motion-foundations` tokens; confirm target
   site name. (Do not skip — both block Phase 3.)
2. **Playwright analysis** — network-first, then fingerprint, then
   deterministic scroll capture, both sites.
3. **Research** — exa + context7 for library teardowns and API docs
   (firecrawl unavailable).
4. **Write `docs/awwwards-effects.md`** — with perf-cost + reduced-motion cols.
5. **`frontend-design-direction`** — gate which 3–5 effects fit the brief.
6. **Per effect:** `/gan-design ... --pass-threshold 7.5` →
   `/gan-build ... --eval-mode playwright`.
7. **`/c3 [brief]`** — run the full design-iteration chain to land effects in
   the site.
8. *(Optional)* **`/c4`** to harden + PR — noting `/santa-loop` is Claude-only.

---

## Verification

- Network capture + screenshots confirm visual capture per Playwright step
- Effect catalogue reviewed before any implementation begins
- Each replicated effect: `/gan-design` ≥7.5 AND `/gan-build` playwright eval green
- Every effect ships a `prefers-reduced-motion` path
- Perf floor met (defined in Phase 2, enforced in `/quality-gate`)
- `/quality-gate` clean before `/checkpoint`
