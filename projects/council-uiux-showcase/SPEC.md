# SPEC — Council × UI-UX Pro Max Showcase

**Pipeline stage:** 1 — Spec (`/prp-prd` equivalent)
**Chain:** `/chelp` C1 (greenfield web project)

## Problem / Why

We need a tangible artifact that proves the connected toolchain works end to end: the
everything-claude-code **chelp** web pipeline, a **council** design decision, and the **ui-ux-pro-max**
design-intelligence skill. A showcase landing page is the most legible "test website with visuals" —
it both *explains* the pipeline and *is* an output of it.

## Audience

Developers and AI engineers evaluating the LLM-Council × UI-UX Pro Max pipeline. They skim. The page
must land its message in under ~30 seconds of scrolling.

## Goal

1. Explain the 3-stage council deliberation (collect → anonymized rank → synthesize) at a glance.
2. Visually demonstrate the design quality the pipeline produces (the page itself is the proof).
3. Show a concrete visualization of council aggregate rankings.

## Sections (locked)

| # | Section | Purpose |
|---|---------|---------|
| 1 | Hero | Name the toolkit, one-line value prop, primary CTA |
| 2 | How It Works | 3-stage council flow as an SVG diagram |
| 3 | Features | What the combined pipeline gives you (bento cards) |
| 4 | Rankings | Chart.js visualization of illustrative aggregate rankings |
| 5 | Footer | Repo links + "built via /chelp C1" credit |

## Non-goals

- No backend, no API calls, no forms.
- No multi-page navigation (single scrolling page).
- No build step / bundler — must open as a static file.

## Success criteria

- Opens directly in a browser (and via `python3 -m http.server`).
- All visuals render: hero gradient + ambient glow, 3-stage SVG diagram, feature cards, the chart.
- Passes the Stage 5 quality gate (HTML validity, responsive 375/768/1024/1440, contrast ≥4.5:1,
  visible focus, `prefers-reduced-motion`, no emoji icons).
- Degrades gracefully if a CDN is blocked (system-font fallback, readable without JS).
