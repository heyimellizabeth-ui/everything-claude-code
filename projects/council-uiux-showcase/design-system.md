# Design System — Council × UI-UX Pro Max Showcase

**Pipeline stage:** 3 — Design intelligence (ui-ux-pro-max)
**Source:** `ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py` (live output, recorded verbatim)

All tokens below are pulled directly from the ui-ux-pro-max databases — not invented.

## Style

- **Primary:** Dark Mode (OLED) — `--design-system` recommendation for "AI developer tool dark".
  WCAG AAA, ⚡ Excellent performance, dark-only.
- **Layered with:** Modern Dark (Cinema Mobile) — cinematic, ambient light blobs, glassmorphism,
  indigo accent, deep blacks. Best for developer tools / AI tool interfaces.
- **Key effects:** minimal text glow (`text-shadow: 0 0 10px`), animated ambient blobs
  (slow translate oscillation, `blur 30–60px`, opacity 0.08–0.12), hairline borders
  `rgba(255,255,255,0.08)`, 16px radius, accent glow behind primary button.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (Expo.out).
- **Avoid:** pure `#000000` (OLED smear), light-mode default.

## Colors — "Developer Tool / IDE" palette ("Code dark + run green")

| Role | Hex |
|------|-----|
| Background | `#0F172A` |
| Foreground | `#F8FAFC` |
| Primary | `#1E293B` |
| Secondary | `#334155` |
| Accent / CTA ("run green") | `#22C55E` |
| Card | `#1B2336` |
| Muted | `#272F42` |
| Muted foreground | `#94A3B8` |
| Border | `#475569` |
| Destructive | `#EF4444` |
| Indigo accent (cinema layer) | `#5E6AD2` |
| Accent glow | `rgba(94,106,210,0.2)` |

Contrast check: `#F8FAFC` on `#0F172A` ≈ 15.8:1 → passes WCAG AAA for body text.

## Typography

- **Inter** (headings + body) — mood: "dark, cinematic, technical, precision, clean, premium,
  developer". Best for developer tools / AI dashboards.
- CSS import: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`
- Tailwind: `fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }`
- Fallback stack (offline): `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`.

## Landing pattern

- **Funnel (3-Step Conversion)** — section order: Hero → Step 1 (problem) → Step 2 (solution) →
  Step 3 (action) → CTA progression. Maps cleanly onto our How-It-Works 3-stage flow.
- CTA above the fold; progressive disclosure with step indicators.

## Chart selection

- **Primary: Bar Chart** — Accessibility AAA. "Always sort descending by value", value labels always
  visible. Library: Chart.js. Use for the council aggregate ranking (lower avg rank = better).
- **Toggle: Radar / Spider Chart** — Accessibility B; multi-variable comparison across the 4
  gan-design rubric axes (Design Quality, Originality, Craft, Functionality). 30% fill, distinct hues.
  **Mandatory a11y fallback:** grouped-bar alternative + raw data table (baked in below the chart).

## Pre-delivery checklist (from ui-ux-pro-max)

- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with 150–300ms transitions
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
