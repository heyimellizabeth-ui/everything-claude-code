# Council Verdict — Visual Direction

**Pipeline stage:** 2 — Council deliberation (`skills/council/SKILL.md`, 4-voice, no API key)

**Question:** For a single-page showcase landing aimed at developers/AI engineers, use
(A) cinematic OLED-dark with ambient glow, or (B) clean minimal-documentation light/neutral?

The three external voices (Skeptic, Pragmatist, Critic) were launched as fresh, context-isolated
subagents given only the question + the Stage-3 design tokens — never this conversation
(anti-anchoring per the SKILL).

---

**Architect:** Lean A (dark cinematic). The retrieved tokens and the dev-tool audience's mental
model (Linear/Vercel/Raycast) both point dark; the chart pops on deep black.

**Skeptic:** Ship B, but steal a dark chart panel + indigo/green accents. The DB matched "dark"
because the *query* said "dark" — confirmation bias. The rankings chart is the real hero; a dark
chart on a light page gets more focus than one lost in an all-dark, blob-animated page.

**Pragmatist:** Ship A. The tokens are a copy-paste head start and dark *is* the sub-30s
credibility signal. But cap animation (2 blobs, H1-only glow) and budget explicit time to theme
Chart.js — an un-themed canvas torpedoes the whole impression.

**Critic:** Ship B as default, demote A to an opt-in theme. `#5E6AD2` on `#0F172A` is ~4.6:1
(borderline for body); text-glow degrades edge contrast; blurred blobs cost GPU even when
`prefers-reduced-motion` kills the motion. **Surprise:** this is itself a UI-UX *product* demo, so
the visual direction is the demo — shipping a live theme toggle (cheap with Tailwind `dark:`/CSS
vars) proves the system does both AAA-dark *and* clean-light, which is stronger than either alone.

### Verdict

- **Consensus:** all four agree the **Chart.js styling is the real make-or-break** element — theme
  gridlines, font, tooltip, and datasets explicitly. Accent palette is indigo `#5E6AD2` + green
  `#22C55E` regardless of direction.
- **Strongest dissent:** Skeptic/Critic warn pure-dark reads as a generic template and risks body
  contrast; Pragmatist warns light reads as "docs, not product."
- **Premise check:** Yes — the Skeptic and Critic both challenged the question itself. The decision
  isn't dark-vs-light; it's "the toggle is the feature." That reframing won.
- **Recommendation (adopted, changed from the Architect's initial lean):**
  **Default to dark cinematic (A)** — honoring the retrieved tokens and audience — **but ship a
  light/dark theme toggle** so the page demonstrates the design system's full range (Critic's
  reframe, which also absorbs the Skeptic's concern). Constraints baked in from the consensus:
  - Cap ambient motion to 2 low-opacity blobs; gate all motion behind `prefers-reduced-motion`.
  - Text-glow on the H1 only; keep body copy flat at ≥4.5:1 in **both** themes.
  - Theme Chart.js explicitly per active theme (gridlines, font family, dark/light tooltip,
    indigo/green datasets) — the agreed highest-risk item.
