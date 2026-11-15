---
description: List all web design command chains (c1–c5) with descriptions and when to use each
---

# chelp — Web Design Chain Reference

Reference guide for the five web design command chains. Each chain is a curated sequence of
everything-claude-code commands tuned for a specific phase of web development.

## Chains at a Glance

| Command | Name | Best For | Design step | Design gate |
|---------|------|----------|-------------|-------------|
| `/c1` | Full Web Project | Greenfield sites, design systems, major launches | `/hallmark` | `/design-gate` |
| `/c2` | Component or Page Feature | Adding pages/components to an existing project | `/hallmark` (new pages) | `/design-gate` |
| `/c3` | Design Iteration Sprint | Polishing UI, animations, responsive fixes | `/hallmark redesign` | `/design-gate --kept --tier floor` |
| `/c4` | Production-Ready Shipping | Hardening, security audit, PR creation | none | `/design-gate --require-render` |
| `/c5` | Maintenance and Cleanup | Dead code removal, doc sync, codebase health | `/hallmark audit` | `/design-gate` |

## Design Quality: Hallmark

The chains use the [Hallmark](https://github.com/nutlope/hallmark) design skill. It builds pages that do
not look generated and checks them with a linter, `sloplint`. `/design-gate` runs that linter. A hard
Floor (contrast, focus rings, reduced motion, colour tokens, phone layout) blocks on any FAIL; Reflex
findings are fixed or waived in the page's stamp with a real reason.

- `/hallmark <brief>` builds a new page. It only touches an existing design when it is named: `/hallmark redesign <path>` or `/hallmark audit <path>`.
- `/design-gate [path] [--url <url>] [--require-render]` checks source and the running page. A URL alone checks only the running page.
- `/design-gate` blocks only on a project Hallmark built or polished (a stamp, `.hallmark/` or `design.md`). On any other project it reports and exits 0; add `--enforce` to block.
- Without Hallmark installed, `/design-gate` prints SKIPPED and exits 0. In `/c4`, add `--require-hallmark` so a missing install blocks.

## Advisor: Opus

`/chelp-advisor` consults an Opus advisor at two checkpoints in each chain: `pre-build` (after the plan)
and `pre-ship` (after the design gate). The advisor reads the real files, runs the real commands and
quotes the printed gate line, then answers with a verdict, at most three blocking items with evidence,
and what to tell the user. Its habits are in `skills/chelp-advisor/SKILL.md`, written by Fable 5.2 for
Opus 5.5, and each consultation is logged to `.chelp/advisor-log.md` so the playbook keeps improving.

- Set it once with Claude Code's `/advisor opus`, read the skill, then call the advisor tool, or run `/chelp-advisor`.
- The advisor does not replace `/code-review` or `/santa-loop`. It checks that the chain's own claims are true.

## Prerequisites

- **Hallmark:** `npx skills add nutlope/hallmark -g` (checked with version 2.0.0). Node 18 or later.
- **Browser checks** (`--render`, `--require-render`): `npm i -g puppeteer-core` and Chrome or Chromium. Playwright alone is not enough.
- **Studio sites** from `/studio-build`: use `/design-gate <folder> --tier floor`.

---

## Component Directory: Astryx

For React work, the chains use the Astryx design system as the component directory. Before a chain
writes UI code, look the component up instead of writing raw HTML and CSS:

```
npx astryx build "<what you are building>"   the page template to start from
npx astryx component <Name> --dense          props and usage for one component
npx astryx search <query>                    components, hooks, docs, templates, themes
```

Hallmark's Floor stays the design gate (`/design-gate`). The `astryx-components` skill has the setup,
the rules, how Astryx and Hallmark divide the work, and the known Floor gaps to close. Static HTML
sites from `/studio-build` do not use Astryx.

---

## /c1 — Full Web Project from Scratch

**Chain:** `/prp-prd` → `/prp-plan` → `/update-codemaps` → `/hallmark` → `/gan-design` (optional) → `/multi-frontend` → `/quality-gate` → `/design-gate` → `/santa-loop`

Start here for greenfield work. Writes a spec first, then iterates on design, then executes and ships
through a dual-reviewer gate.

---

## /c2 — Component or Page Feature

**Chain:** `/plan` → `/feature-dev` → `/hallmark` (new pages) → `/gan-design` (optional) → `/code-review` → `/test-coverage` → `/design-gate` → `/checkpoint`

Adds a single page or component to an existing project. Grounds the work in existing codebase patterns
before designing.

---

## /c3 — Design Iteration Sprint

**Chain:** `/model-route` → `/hallmark redesign <path> polish` → `/gan-build` (behaviour only) → `/quality-gate` → `/design-gate --kept --tier floor` → `/code-review`

Pure design polish. Skips heavy planning: Hallmark records the page, fixes only what its gates name and
checks that no link, field or test hook was dropped. Good for animations, responsive work, and visual
refinement. Say "keep the layout" for a restyle, or nothing for a full redesign.

---

## /c4 — Production-Ready Shipping

**Standard chain:** `/multi-plan` → `/multi-execute` → `/security-scan` → `/test-coverage` → `/design-gate` → `/santa-loop` → `/prp-pr`

**Gemini-augmented chain:** `/multi-frontend` → `/security-scan` → `/test-coverage` → `/design-gate` → `/santa-loop` → `/prp-pr`

Full hardening before merge. Use the standard chain (Claude-only) or replace the plan/execute steps
with `/multi-frontend` when Gemini CLI is available. Runs security audit, coverage checks, the design
gate with browser checks required, dual-reviewer approval, and automated PR creation.

---

## /c5 — Maintenance and Cleanup

**Chain:** `/refactor-clean` → `/update-codemaps` → `/update-docs` → `/hallmark audit` → `/quality-gate` → `/design-gate` → `/checkpoint`

Post-launch or pre-sprint cleanup. Removes dead CSS/JS, refreshes architecture maps, syncs docs, and
snapshots the clean state.

---

## Picking a Chain

```
Starting from zero?          → /c1
Adding to an existing app?   → /c2
Polishing visuals?           → /c3
Ready to ship?               → /c4
Cleaning up after launch?    → /c5
Existing UI looks generated? → /hallmark audit <path>, then /c3
Studio site (from /studio-build)? → /design-gate <folder> --tier floor
```
