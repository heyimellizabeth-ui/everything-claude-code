---
name: c4
description: Web chain 4 — production-ready shipping with multi-model execution, security audit, and PR
argument-hint: "[feature or task description]"
origin: ECC
---

# C4 — Production-Ready Shipping

Use this chain when a feature is built and you need to harden, audit, and ship it. It runs a multi-model
frontend execution pass, security and coverage gates, dual-reviewer approval, and automated PR creation.

## Chain

**Standard path (Claude-only):**

```
/unified-design-system  Step 1: read MASTER.md and PREFERENCES.md so the build and the gate use the same rules
/multi-plan    Multi-model collaborative plan — no code changes, just the blueprint
/multi-execute  Execute the plan with Claude as sole filesystem writer
/security-scan  AgentShield audit: secrets, permissions, MCP surfaces, agent prompts
/test-coverage  Ensure 80%+ coverage — generates missing tests automatically
/design-gate    Review checklist plus Hallmark Floor on the source and the running page, browser checks required: blocks on any FAIL or open REFLEX
/chelp-advisor  Pre-ship review: the summary line is from HEAD, render ran, nothing was passed off as a ship pass
/santa-loop     Two independent reviewers must both PASS before merge
/prp-pr         Create PR with full change analysis and template discovery; paste the /design-gate summary line into the description
```

**Gemini-augmented path** (replace `/multi-plan` + `/multi-execute` with `/multi-frontend` when Gemini CLI is available):

```
/multi-frontend Research → Ideation → Execute → Optimize → Review (Gemini-led), told to build in the MASTER.md system
/security-scan  AgentShield audit: secrets, permissions, MCP surfaces, agent prompts
/test-coverage  Ensure 80%+ coverage — generates missing tests automatically
/design-gate    Review checklist plus Hallmark Floor on the source and the running page, browser checks required: blocks on any FAIL or open REFLEX
/chelp-advisor  Pre-ship review: the summary line is from HEAD, render ran, nothing was passed off as a ship pass
/santa-loop     Two independent reviewers must both PASS before merge
/prp-pr         Create PR with full change analysis and template discovery; paste the /design-gate summary line into the description
```

## When to Use

- Shipping a mature feature to production
- Features that touch authentication, payments, or sensitive data
- Work that will go through a formal code review process
- High-traffic pages where correctness matters most

## Prerequisites

- **Gemini CLI** required for the Gemini-augmented path (`/multi-frontend`).
- **Codex or Gemini CLI** required for `/santa-loop`'s second reviewer; falls back to a context-isolated Claude Opus agent if neither is available.
- **Hallmark** (design skill and gate): `npx skills add nutlope/hallmark -g`. Without it `/design-gate` prints SKIPPED. Shipping requires it: run `/design-gate ... --require-hallmark`.
- **Browser checks:** `npm i -g puppeteer-core` and Chrome. `--require-render` refuses a pass when they did not run.

## Tips

- In an Astryx project, run `npx astryx doctor` next to the other checks (`astryx-components` skill).
- `/multi-plan` saves the plan to `.claude/plan/`. Note the file path it outputs — pass it explicitly to `/multi-execute`.
- `/security-scan --fix` will attempt automated remediation on findings before you review them.
- `/santa-loop` requires two external model CLIs (Codex or Gemini). Falls back to two context-isolated Claude Opus agents if unavailable.
- `/prp-pr` discovers PR templates automatically — no manual template selection needed.
- `/chelp-advisor pre-ship c4` after `/design-gate` and before `/santa-loop` (see the `chelp-advisor` skill).
- The gate command for a framework app: `/design-gate src --url http://localhost:3000/<route> --require-render --require-hallmark`. Add `--scope app` only for app screens, not marketing pages. For a static site, `/design-gate <folder> --render --require-render --require-hallmark`.
- The gate blocks only on a project with `design-system/MASTER.md` or one Hallmark built or polished (a stamp, `.hallmark/` or `design.md`). On any other project it reports and exits 0. To make it block regardless, add `--enforce`, and expect a long first list: run `/hallmark audit <path>` and a `/c3` pass first.
- A static-only pass is not a ship pass. If the summary says `render: NOT RUN`, fix the setup and run it again.
- Fix every FAIL. Fix every REFLEX, or waive it in the page's Hallmark stamp with a real reason. Never edit the linter or a test to get a pass.
- Studio sites from `/studio-build`: use `--tier floor`; the full tier still reports Reflex findings you may waive.

- When the user accepts, rejects or corrects a design choice, log it in `design-system/PREFERENCES.md` (unified-design-system step 7). The next run reads it in step 1.

## Usage

```
/c4 Ship the checkout flow redesign — it touches the cart, payment form, and confirmation page
```
