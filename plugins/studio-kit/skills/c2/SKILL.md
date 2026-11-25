---
name: c2
description: Web chain 2 — add a component or page feature to an existing project
argument-hint: "[feature description]"
origin: ECC
---

# C2 — Component or Page Feature

Use this chain when adding a new page, UI component, or isolated feature to an existing web project.
It grounds the work in your codebase before designing, then verifies with review and coverage checks.

## Chain

```
/plan          Risk assessment + step-by-step plan — MUST confirm before code is touched
/chelp-advisor Pre-build review of the plan, before any code is touched
/unified-design-system  Step 1: read MASTER.md, pages/<page>.md and PREFERENCES.md  [skip for non-visual work]
/feature-dev   Guided discovery → architecture → implement → quality review
/hallmark      New page, or a project that already uses Hallmark (a design.md or a Hallmark stamp): build it inside MASTER.md's system, no dealt theme  [skip for non-visual work]
/gan-design    Score-gated visual loop to iterate on layout and style  [optional — skip for non-visual work]
/code-review   Security, quality, and best-practices sweep on all local changes
/test-coverage Gap analysis → generates missing tests toward 80%+ threshold
/design-gate   Review checklist plus Hallmark Floor on the changed files: blocks on any FAIL  [skip for non-visual work]
/chelp-advisor Pre-ship review: gate lines quoted as printed, doc recipes run as written
/checkpoint    Snapshot the clean state so you can verify or roll back
```

## When to Use

- Adding a new page (landing page, dashboard, settings)
- Building a reusable component (modal, data table, form)
- Wiring up a new UI flow to an existing backend

## Prerequisites

- **Hallmark** (design skill and gate): `npx skills add nutlope/hallmark -g`. Optional: without it `/design-gate` prints SKIPPED and the review checklist (unified-design-system step 6) is the gate.
- **Browser checks** for `--render` and `--require-render`: `npm i -g puppeteer-core` and Chrome. Playwright alone is not enough.

## Tips

- In an Astryx project, run `npx astryx build "<feature>"` and `npx astryx component <Name> --dense` before `/feature-dev` writes code (`astryx-components` skill).
- `/chelp-advisor pre-build c2` after `/plan` and `/chelp-advisor pre-ship c2` after `/design-gate` (see the `chelp-advisor` skill).
- `/plan` stops and waits for your explicit CONFIRM — review the plan carefully before proceeding.
- `/gan-design` is optional if the component is purely functional; skip it for non-visual work.
- Changing UI that Hallmark did not build: skip `/hallmark`, because it only touches an existing design when it is named. Build in the project's own system, which is `design-system/MASTER.md` when it exists. `/design-gate <path>` blocks when MASTER.md exists; otherwise it reports without blocking, and `--enforce` makes it block.
- Single element (a button, a modal, a card): `/hallmark` runs in component scope. Pass the element in the prompt.
- Framework apps: `/design-gate src --url http://localhost:3000/<route> --require-render`. Add `--scope app` only for app screens (dashboards, settings, forms), not marketing pages.
- `/checkpoint` lets you run `/checkpoint verify` later to confirm nothing regressed.

- When the user accepts, rejects or corrects a design choice, log it in `design-system/PREFERENCES.md` (unified-design-system step 7). The next run reads it in step 1.

## Usage

```
/c2 Add a responsive pricing table component with three tiers and a toggle for monthly/annual billing
```
