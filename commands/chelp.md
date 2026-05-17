---
description: List all web design command chains (c1–c5) with descriptions and when to use each
---

# chelp — Web Design Chain Reference

Reference guide for the five web design command chains. Each chain is a curated sequence of
everything-claude-code commands tuned for a specific phase of web development.

## Chains at a Glance

| Command | Name | Best For |
|---------|------|----------|
| `/c1` | Full Web Project | Greenfield sites, design systems, major launches |
| `/c2` | Component or Page Feature | Adding pages/components to an existing project |
| `/c3` | Design Iteration Sprint | Polishing UI, animations, responsive fixes |
| `/c4` | Production-Ready Shipping | Hardening, security audit, PR creation |
| `/c5` | Maintenance and Cleanup | Dead code removal, doc sync, codebase health |

---

## /c1 — Full Web Project from Scratch

**Chain:** `/prp-prd` → `/prp-plan` → `/update-codemaps` → `/gan-design` → `/multi-frontend` → `/quality-gate` → `/santa-loop`

Start here for greenfield work. Writes a spec first, then iterates on design, then executes and ships
through a dual-reviewer gate.

---

## /c2 — Component or Page Feature

**Chain:** `/plan` → `/feature-dev` → `/gan-design` → `/code-review` → `/test-coverage` → `/checkpoint`

Adds a single page or component to an existing project. Grounds the work in existing codebase patterns
before designing.

---

## /c3 — Design Iteration Sprint

**Chain:** `/model-route` → `/gan-design` → `/gan-build` → `/quality-gate` → `/code-review`

Pure design polish. Skips heavy planning and runs score-gated generate/evaluate/refine cycles. Good
for animations, responsive work, and visual refinement.

---

## /c4 — Production-Ready Shipping

**Standard chain:** `/multi-plan` → `/multi-execute` → `/security-scan` → `/test-coverage` → `/santa-loop` → `/prp-pr`

**Gemini-augmented chain:** `/multi-frontend` → `/security-scan` → `/test-coverage` → `/santa-loop` → `/prp-pr`

Full hardening before merge. Use the standard chain (Claude-only) or replace the plan/execute steps
with `/multi-frontend` when Gemini CLI is available. Runs security audit, coverage checks, dual-reviewer
approval, and automated PR creation.

---

## /c5 — Maintenance and Cleanup

**Chain:** `/refactor-clean` → `/update-codemaps` → `/update-docs` → `/quality-gate` → `/checkpoint`

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
```
