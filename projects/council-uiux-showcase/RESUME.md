# Council × UI-UX Pro Max — Site Resume

**Built:** June 2026 · **Pipeline:** C1 (greenfield) via `/chelp`, adapted to local tools
**Type:** Single-page showcase landing · **Stack:** static HTML + Tailwind (CDN) + Chart.js (CDN)

---

## What Was Built

A showcase landing page that both **explains** and **is an output of** the connected toolchain:
the everything-claude-code **chelp** pipeline drove the build, a four-voice **council** decided the
visual direction, and **ui-ux-pro-max** supplied the real design tokens (palette, type, chart).

This is the "test website with visuals" deliverable — it opens directly in a browser, no build step.

### Pages (1)

| File | Route | Purpose |
|------|-------|---------|
| `index.html` | `/` | Hero · How-It-Works (3-stage) · Features · Rankings chart · Footer |

### Sections

1. **Hero** — cinema-dark gradient, 2 animated ambient blobs, H1 glow, green CTA with accent glow.
2. **How It Works** — 3-node inline-SVG flow that draws in on scroll + three stage cards.
3. **Features** — bento grid of six cards with hover lift + indigo border tint.
4. **Rankings** — Chart.js with a **Bar↔Radar toggle**, themed per active theme, plus a raw-data
   `<table>` a11y fallback.
5. **Footer** — repo links, underline-slide hover, "built via /chelp C1" credit.

Plus a **light/dark theme toggle** (the council's reframe: the toggle demonstrates the design
system's range, so the site is itself a UI-UX product demo).

---

## How It Was Built — adapted C1 pipeline

Each stage left an auditable artifact in this folder.

| Stage | chelp C1 step | Adapted to | Artifact |
|-------|---------------|-----------|----------|
| 1 | `/prp-prd` | Hand-written PRD | `SPEC.md` |
| 2 | (council) | ECC `/council` skill — 4 subagent voices, no API key | `council-verdict.md` |
| 3 | design inputs | `ui-ux-pro-max` `search.py` (real tokens) | `design-system.md` |
| 4 | `/gan-design` | Generate → evaluate → refine (2 passes, 8.59/10) | `eval-rubric.md` |
| 5 | `/quality-gate` | Structural + a11y + resilience checks | `quality-gate.md` |
| 6 | `/santa-loop` | Two context-isolated Claude reviewers (fallback) | `review-verdict.md` |

> The live `llm-council` backend was *not* used — it needs an `OPENROUTER_API_KEY` and spends
> tokens. The ECC council skill (local subagents) produced the deliberation instead.

---

## Design Tokens (from ui-ux-pro-max)

- **Palette:** Developer Tool / IDE — bg `#0F172A`, fg `#F8FAFC`, card `#1B2336`, CTA green
  `#22C55E`, cinema indigo `#5E6AD2`. Small text uses higher-contrast `--accent-text`
  (`#A5B4FC` dark / `#4338CA` light) for WCAG AA.
- **Typography:** Inter (with a system-font fallback stack so the page renders offline).
- **Style:** Dark Mode (OLED) + Modern Dark (Cinema) — ambient blobs, hairline borders, 16px radius.
- **Chart:** Bar (AAA, sorted by score) default + Radar (rubric axes, 30% fill) toggle.

---

## Running It

```bash
# From this folder:
python3 -m http.server 8000
# then open http://localhost:8000
```

Or open `index.html` directly (`file://`). Tailwind, Chart.js, and Inter load from CDN; if blocked,
the page falls back to system fonts and remains readable, and the chart's data table still renders.

## Self-Contained Notes

- No bundler, no `npm install`. One HTML file + two SVG assets.
- All icons are inline SVG (no emoji). Animations gated behind `prefers-reduced-motion`.
- Theme choice persists in `localStorage` (`cuxpm-theme`).

## Known Placeholders / TODOs

- The rankings chart uses **illustrative** council scores (labelled as such in the UI).
- Repo links in the footer point to in-page anchors + this resume; wire to real repo URLs if published.
