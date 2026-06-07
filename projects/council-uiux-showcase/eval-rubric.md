# Eval Rubric & Scores — gan-design loop

**Pipeline stage:** 4 — Generate → evaluate → refine (`commands/gan-design.md`)

## Rubric (weights from gan-design.md)

| Dimension | Weight |
|-----------|--------|
| Design Quality | 0.35 |
| Originality | 0.30 |
| Craft | 0.25 |
| Functionality | 0.10 |

Pass threshold: **7.5 / 10** weighted.

## Pass 1 (generator) → evaluator notes

| Dimension | Score | Notes |
|-----------|-------|-------|
| Design Quality | 8.0 | Cinema-dark hero + glow reads premium; chart well integrated. |
| Originality | 7.5 | Theme toggle as a "demo of the product" is a genuine idea (council reframe). |
| Craft | 7.0 | Some hover/contrast polish missing; chart not yet fully themed per active theme. |
| Functionality | 9.0 | All sections work; chart toggles; table fallback present. |
| **Weighted** | **7.78** | Above threshold, but craft refinements identified. |

### Refinements applied (pass 2)

- Chart re-themes on light/dark toggle (reads CSS vars live) — the council's flagged highest-risk item.
- Themed Chart.js explicitly: gridline color, Inter font, dark/light tooltip, indigo/green datasets.
- H1-only text-glow (avoid body contrast degradation, per Critic).
- Capped to 2 ambient blobs; all motion gated behind `prefers-reduced-motion`.
- Winner bar highlighted in green; runner-up comparison in radar at 30% fill.

## Pass 2 (final) → evaluator notes

| Dimension | Score | Notes |
|-----------|-------|-------|
| Design Quality | 8.6 | Cohesive in both themes; chart no longer the weak point. |
| Originality | 8.4 | Toggle + live-retheming chart distinguishes it from generic dark SaaS pages. |
| Craft | 8.4 | Consistent radius/borders, focus states, underline-slide, draw-in SVG. |
| Functionality | 9.0 | Bar/radar toggle, theme persistence, a11y table, graceful CDN fallback. |
| **Weighted** | **8.59** | **PASS** — proceed to quality gate. |
