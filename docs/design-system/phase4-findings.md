# Phase 4 findings: the unified design system on two real projects

Run on 2026-11-25 against `projects/club-kudt` (static HTML) and `projects/sockwave` (Astro).
Hallmark is not installed in this environment, so this is the checklist-only path.

## What the system did

| Step | club-kudt | sockwave |
|---|---|---|
| `/chelp-pipeline --no-smoke` | `READY (checklist gate only)` | same |
| MASTER.md | written by `write-master.js` from the `:root` tokens | written from `src/styles/tokens.css`, copy edited by hand |
| `/design-gate` | finds MASTER.md, enforced, `SKIPPED` (no Hallmark), exit 0 | same (static only) |
| Running-page check (`references/visual-check.md`) | 360px and 1280px, with and without reduced motion, Playwright | not run: needs `npm install` and an Astro build |

## Review checklist results

### club-kudt

- **Must, contrast:** 30 text elements below 4.5:1. The main one is cream `#F5F0E8` on the red accent `#E8415A` (3.47:1), which affects the ticket CTA and every ticker item. Fix: dark text `#0D0D0D` on red (4.94:1), now recorded in MASTER.md as `--color-accent-ink`.
- **Must, reduced motion:** the page has no `prefers-reduced-motion` rule. Two animations keep running when reduced motion is on (the ticker loop), which also breaks Decision 5 (loops only for live state).
- **Must, touch targets:** 9 links are under 24px tall at 360px (the nav and footer links are 12px), and 15 at 1280px. Decision 3 asks for 44px on touch.
- **Pass:** no horizontal overflow at 360px or 1280px; the first Tab stop shows a focus outline.
- **Note:** `gsap is not defined` at load. The sandbox may have blocked the CDN, so check it on the live site before treating it as a bug.

### sockwave (static token check)

- **Must, contrast:** `--fg-dim` `#71717a` on `--bg` `#0a0a0b` is 4.09:1, below 4.5 for body text. Fixed: `--muted` is now `#8a8a93` (5.8:1), recorded in MASTER.md.
- **Pass:** accent on background 5.61:1, text on accent 5.61:1, body text 18.96:1, a 2px `:focus-visible` outline, and a reduced-motion rule in `global.css`.
- **Should:** the border token `#27272a` is 1.33:1 on the background. That's fine for a decorative divider, but not for a field outline (3:1).

## Fixes to the system from this run

1. `scripts/design-gate.js --json` now reports `skipped: true` when Hallmark is missing. Before, it printed `pass: false, enforced: true` on a MASTER.md project even though the gate exits 0, which a script reading the JSON would treat as a block.
2. `write-master.js` writes venue wording ("venue and events site", "queer-nightclub") because it was built for `/studio-build`. For non-studio projects the copy had to be edited by hand. Next step: take the design read from an argument, or leave it to unified-design-system step 2.

## Site fixes applied

- **club-kudt:** dark text `#0D0D0D` on every red fill (CTA, ticker, newsletter button), a `prefers-reduced-motion` rule that stops the ticker loop, and nav and footer links padded to 24px (44px+ on touch screens). Rerun: 0 low-contrast elements (was 30), 0 running animations under reduced motion (was 2), no overflow. The 2-3 small targets left are inline text links inside paragraphs, which WCAG 2.5.8 exempts.
- **sockwave:** `--muted` lightened from `#71717a` to `#8a8a93` (5.8:1 on the background, 5.2:1 on surface).

## Phase 4 extras

- Done. The sync check came with `docs/capabilities.json` (`npm run capabilities:check`), the health view is in Design Studio, and the guide is `GUIDE.md`.
