---
name: c1
description: Web chain 1 — full web project from scratch (spec → design → build → ship)
argument-hint: "[project description]"
origin: ECC
---

# C1 — Full Web Project from Scratch

Use this chain when starting a greenfield site, new design system, or major feature launch. It runs
the full lifecycle: interactive spec writing, codebase analysis, iterative UI design, frontend execution,
quality checks, and a dual-reviewer gate before merge.

## Chain

Run each command in sequence. Each step hands context forward to the next.

```
/prp-prd         Interactive PRD — nail down audience, layout goals, component scope
/prp-plan        Deep codebase analysis → full implementation blueprint
/chelp-advisor   Pre-build review of the plan: which gate command, which theme, what has never been run
/update-codemaps Architecture snapshot so AI context stays accurate
/hallmark        Build the design: one round of questions, a dealt theme (or the project's own system), hero reviewed first, fresh-context finish review
/gan-design      Optional: extra originality inside the system Hallmark chose
/multi-frontend  Research → Ideation → Execute → Optimize → Review (Gemini-led): wiring, data and routing, not the look
/quality-gate    Lint, type check, format check — mirrors CI
/design-gate     Hallmark Floor on the source and the running page: blocks on any FAIL
/chelp-advisor   Pre-ship review: every gate line quoted as printed, claims run as written
/santa-loop      Two independent reviewers must both PASS before merge
```

## When to Use

- New website or web app with no existing code
- Launching a new design system
- Major feature with significant UI surface area

## Prerequisites

- **Design gate:** Hallmark is needed for `/hallmark` and `/design-gate`.
  Install with `npx skills add nutlope/hallmark -g`. Without it `/design-gate` prints SKIPPED and no design check runs.
- **Browser checks** for `--render` and `--require-render`: `npm i -g puppeteer-core` and Chrome. Playwright alone is not enough.
- **React projects:** install Astryx and run `npx astryx init --agent claude` after `/prp-plan`. App screens start from `npx astryx build`; see the `astryx-components` skill.
- **Gemini CLI** must be installed for `/multi-frontend` (it orchestrates a Gemini-led execution pass).
- **Codex or Gemini CLI** required for `/santa-loop`'s second reviewer; falls back to a context-isolated Claude Opus agent if neither is available.

## Tips

- `/prp-prd` will ask you questions — answer them thoroughly; that spec drives everything downstream.
- `/chelp-advisor pre-build c1` after `/prp-plan` and `/chelp-advisor pre-ship c1` after `/design-gate` (see the `chelp-advisor` skill).
- Paste your `/prp-prd` answers (audience, the one action, tone, real material) into `/hallmark`; they are what it asks for in its one round of questions.
- `/gan-design` is optional here. It defaults to 10 iterations with a 7.5/10 pass threshold; it never overrides Hallmark's Floor.
- Static sites: `/design-gate <folder> --render`. Framework apps: `/design-gate src --url http://localhost:3000/ --require-render`.
- In an Astryx project, name the Astryx theme in the `/hallmark` prompt (see the `astryx-components` skill).
- `/santa-loop` requires two external model CLIs (Codex or Gemini). If unavailable it falls back to two context-isolated Claude Opus agents.

## Usage

```
/c1 A portfolio site for a photographer with a dark theme and full-bleed image galleries
```
