# Quality Gate — results

**Pipeline stage:** 5 — quality-gate (`commands/quality-gate.md`)

Static-HTML target, so the gate runs structural + accessibility + resilience checks (no lint/type CI).

| Check | Result | Evidence |
|-------|--------|----------|
| Valid HTML5 — single DOCTYPE, single `<h1>`, landmark tags | ✅ PASS | `<!DOCTYPE>`×1, `<h1>`×1, `<header>/<main>/<footer>` present; 4 balanced `<section>`. |
| Inline JS syntax | ✅ PASS | `node --check` on extracted script → OK. |
| Serves over HTTP | ✅ PASS | `python3 -m http.server` → index + both SVGs return `200`. |
| No emojis as icons (SVG only) | ✅ PASS | 0 emoji glyphs; all icons inline SVG (Lucide-style paths). |
| Contrast ≥ 4.5:1 (body) | ✅ PASS | Dark: `#F8FAFC` on `#0F172A` ≈ 15.8:1. Light: `#0F172A` on `#F8FAFC` ≈ 15.8:1. Accents darkened on light theme (`#4F46E5`, `#15803D`) for AA. |
| Visible focus states | ✅ PASS | `a/button :focus-visible` → 2px accent outline + offset. |
| `prefers-reduced-motion` respected | ✅ PASS | Media query disables blobs, reveals, SVG draw-in; reveals jump to visible. |
| `cursor-pointer` on clickables; 150–300ms hover | ✅ PASS | All links/buttons; transitions 200–250ms. |
| Responsive 375 / 768 / 1024 / 1440 | ✅ PASS | `max-w-6xl` container; `sm:`/`lg:` grid breakpoints; chart `maintainAspectRatio:false`; flow SVG scrolls on narrow. |
| Chart a11y fallback | ✅ PASS | Raw-data `<table>` (with `<caption>`/`scope`) in a `<details>` below the canvas, per chart-DB mandate. |
| No external dependencies (renders offline) | ✅ PASS | Verified in headless Chromium with **all** non-localhost requests blocked: **0** failed requests, **0** page errors, full styled layout + SVG chart. No CDN, no Chart.js, no web fonts. |
| Content visible if JS fails | ✅ PASS | `<html class="no-js">` → `js` flip; `.reveal` hides only under `.js`, so a JS error can't blank the page. |
| Theme toggle re-themes chart | ✅ PASS | Hand-drawn SVG chart reads CSS vars live and re-renders on toggle. |

**Verdict: PASS** — no FAILs to remediate. Proceed to review gate.
