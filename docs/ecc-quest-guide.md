# ECC Quest Guide

> **INITIALISING ENGINEER PROFILE...**
>
> Tools detected: 60 agents · 75 commands · 180 skills · active hooks
>
> You are a newly initialised AI-Augmented Engineer.
> Your tools are live. Your mission: master them.
>
> Complete each quest to unlock the next. Earn achievements as you go.
> The final title awaits those who reach the BOSS level.

---

## Progression Map

```
╔══════════════════════════════════════════════════════╗
║  TIER: STARTER                                       ║
║  Level 1 ── The Planner         [/plan]              ║
║  Level 2 ── The Keeper          [/save + /resume]    ║
╠══════════════════════════════════════════════════════╣
║  TIER: BUILDER                                       ║
║  Level 3 ── The Test Smith      [/go-test etc.]      ║
║  Level 4 ── The Fixer           [/build-fix]         ║
╠══════════════════════════════════════════════════════╣
║  TIER: GUARDIAN                                      ║
║  Level 5 ── The Sentinel        [/security-scan]     ║
║  Level 6 ── The Reviewer        [/code-review]       ║
╠══════════════════════════════════════════════════════╣
║  TIER: COLLABORATOR                                  ║
║  Level 7 ── The Shipper         [/checkpoint + /pr]  ║
╠══════════════════════════════════════════════════════╣
║  TIER: MASTER                                        ║
║  Level 8 ── The Learner         [/learn + /evolve]   ║
║  BOSS ───── The Orchestrator    [/multi-workflow]    ║
╚══════════════════════════════════════════════════════╝
```

**Rules:**

1. Complete each quest before moving to the next.
2. The RED step in Level 3 is mandatory — skipping it voids the achievement.
3. The BOSS level requires Levels 1–8 complete.

---

## TIER: STARTER

### Level 1 — The Planner

> A reckless engineer ships first and thinks later. You are not that engineer.
> Before a single line is written, you plan. The plan is the contract.
> Break the contract and the codebase breaks with it.

**Objective:** Think of any real task you have — a feature, a bug, a refactor. Run `/plan` on it right now.

**Command:**

```
/plan <your task description>
```

**Victory conditions:**

- [ ] A plan appears with at least one identified risk
- [ ] You either confirmed it, modified it, or rejected it with a reason
- [ ] No code was written before you confirmed

**Achievement unlocked:** `STRATEGIST`

> *"You planned before you coded. The reckless ones are already debugging."*

**Unlocks:** Level 2

---

### Level 2 — The Keeper

> Memory is the difference between a session and a project.
> Without `/save-session`, each conversation starts from zero.
> The Keeper preserves what matters: what worked, what failed, what comes next.

**Objective:** Save your current session, close Claude Code, reopen it, and resume.

**Commands:**

```
/save-session
```

Close Claude Code. Reopen it. Then:

```
/resume-session
```

**Victory conditions:**

- [ ] Session file written to `~/.claude/session-data/`
- [ ] On resume: briefing includes "what not to retry" section
- [ ] You did not have to re-explain context from scratch

**Achievement unlocked:** `ARCHIVIST`

> *"Context preserved across sessions. The work continues."*

**Unlocks:** Level 3

---

## TIER: BUILDER

### Level 3 — The Test Smith

> The weak write code and then wonder why it breaks.
> The Test Smith writes the test first — watches it fail — then makes it pass.
> RED before GREEN. Always. No exceptions.

**Objective:** Pick your language. Write a test for a function that does not exist yet. Watch it fail. Then implement. Then watch it pass.

**Choose your weapon:**

| Language | Command |
|----------|---------|
| Go | `/go-test <feature description>` |
| Rust | `/rust-test <feature description>` |
| Kotlin | `/kotlin-test <feature description>` |
| Flutter/Dart | `/flutter-test <feature description>` |
| C++ | `/cpp-test <feature description>` |

**The cycle:**

```
1. Define the interface (signature only, no body)
2. Write the test cases
3. Run tests → MUST SEE RED (failure for the right reason)
4. Write minimal implementation
5. Run tests → GREEN
6. Refactor → still GREEN
7. Coverage ≥ 80%
```

**Victory conditions:**

- [ ] Tests existed before implementation
- [ ] RED step confirmed (test failed, not errored with "file not found")
- [ ] GREEN step confirmed (all tests pass)
- [ ] Coverage reported at ≥ 80%

**Achievement unlocked:** `TEST SMITH`

> *"You wrote the test first. The implementation was inevitable."*

**Unlocks:** Level 4

---

### Level 4 — The Fixer

> Build errors are not failures. They are directions.
> The Fixer reads each error as an instruction, applies the minimal change, and moves on.
> Never fix two things at once. Never guess. Always verify.

**Objective:** Introduce a deliberate type error into any file, then let `/build-fix` resolve it without touching the file yourself.

**Setup:** Add an intentional type mismatch, e.g.:

```typescript
// In any .ts file
const count: number = "this is not a number";
```

Then:

```
/build-fix
```

**Victory conditions:**

- [ ] `/build-fix` detected the error without you pointing to it
- [ ] Fix was applied with minimal change (not a rewrite)
- [ ] Build passes after fix
- [ ] You did not manually edit the file

**Achievement unlocked:** `WRENCH MASTER`

> *"You let the tool fix what the tool broke. That is efficiency."*

**Unlocks:** Level 5

---

## TIER: GUARDIAN

### Level 5 — The Sentinel

> One committed secret ends careers.
> The Sentinel scans before it ships — every time, no exceptions.
> A clean report is not luck. It is discipline.

**Objective:** Run a security scan on the current repository. Review every finding, even if there are zero.

**Command:**

```
/security-scan
```

Optional — scan with higher sensitivity:

```
/security-scan . --min-severity low
```

**Victory conditions:**

- [ ] Scan completed with a full report
- [ ] You read every finding (not just the count)
- [ ] Any CRITICAL or HIGH findings are either fixed or documented as false positives

**Achievement unlocked:** `SENTINEL`

> *"No secrets shipped on your watch. The pipeline is clean."*

**Unlocks:** Level 6

---

### Level 6 — The Reviewer

> You are not just the author. You are also the first reader.
> The Reviewer catches what the author missed — before it becomes someone else's problem.
> Seven categories. All of them matter.

**Objective:** Stage some changes (any changes) and run a local code review.

**Command:**

```
/code-review
```

For a GitHub PR:

```
/code-review <PR number>
```

**The seven categories checked:**

1. Correctness
2. Type safety
3. Pattern compliance
4. Security
5. Performance
6. Completeness
7. Maintainability

**Victory conditions:**

- [ ] Review output covers all seven categories
- [ ] At least one finding (even LOW) is acknowledged
- [ ] If a PR: review posted to GitHub with approve / request-changes decision

**Achievement unlocked:** `CODE GUARDIAN`

> *"You reviewed before you merged. Future maintainers owe you nothing — you already paid."*

**Unlocks:** Level 7

---

## TIER: COLLABORATOR

### Level 7 — The Shipper

> Unshipped code is a liability. The Shipper moves work from local to live.
> But not carelessly — a checkpoint first, then the push, then the PR.
> The remote is the record. Everything else is drafts.

**Objective:** Create a named checkpoint, then open a pull request.

**Commands:**

```
/checkpoint create pre-ship
```

Then:

```
/pr
```

**Victory conditions:**

- [ ] Checkpoint logged to `.claude/checkpoints.log`
- [ ] Branch pushed to remote
- [ ] PR opened (draft is fine)
- [ ] PR URL returned

**Achievement unlocked:** `SHIPPER`

> *"Your work reached the remote. It exists beyond this machine."*

**Unlocks:** Level 8

---

## TIER: MASTER

### Level 8 — The Learner

> Tools can be installed. Mastery cannot.
> The Learner extracts signal from every session — errors resolved, patterns repeated, conventions discovered.
> These become instincts. Instincts become skills. Skills compound.

**Objective:** At the end of a real working session, run `/learn`. Then inspect what was captured. Then evolve it.

**Commands — in order:**

```
/learn
```

Review the extracted pattern. Confirm if it is worth saving.

```
/instinct-status
```

See all instincts — project-scoped and global.

```
/evolve
```

Cluster related instincts into candidate skills or commands.

**Victory conditions:**

- [ ] At least one instinct saved (confidence ≥ 0.5)
- [ ] `/instinct-status` shows it in the list with scope (project or global)
- [ ] `/evolve` produces at least one cluster or promotion suggestion

**Achievement unlocked:** `PATTERN SEEKER`

> *"You taught yourself something new. The next session starts smarter."*

**Unlocks:** BOSS LEVEL

---

## BOSS LEVEL — The Orchestrator

> Nine levels. Nine tools. One more remains.
> The Orchestrator runs the full gauntlet — six phases, one task, every model working together.
> Research. Ideation. Plan. Execute. Optimise. Review.
> This is not a command. This is a workflow.

**Prerequisite:** Levels 1–8 complete.

**Objective:** Pick a real feature you want to build — something meaningful, not a toy. Run the full multi-model workflow on it.

**Command:**

```
/multi-workflow <your feature description>
```

**The six phases:**

```
Phase 1: Research    — gather context, score requirement completeness (0–10)
Phase 2: Ideation    — parallel model analysis (backend + frontend perspectives)
Phase 3: Plan        — detailed implementation plan, saved to .claude/plans/
Phase 4: Execute     — implement following the plan
Phase 5: Optimise    — parallel security + performance + accessibility review
Phase 6: Review      — final verification, ready-to-ship check
```

**Victory conditions:**

- [ ] All 6 phases complete without aborting
- [ ] Plan artifact saved under `.claude/plans/`
- [ ] Implementation passes at least build + type check
- [ ] Final review phase produces a ship/no-ship decision

**Final achievement unlocked:** `ORCHESTRATOR`

> *"You ran the full gauntlet. Research to review. Idea to implementation."*

**Title awarded:** `AI-AUGMENTED ENGINEER`

> *Your profile is complete. Your tools are no longer new — they are yours.*

---

## Achievement Registry

| Achievement | Level | Earned |
|-------------|-------|--------|
| `STRATEGIST` | 1 | [ ] |
| `ARCHIVIST` | 2 | [ ] |
| `TEST SMITH` | 3 | [ ] |
| `WRENCH MASTER` | 4 | [ ] |
| `SENTINEL` | 5 | [ ] |
| `CODE GUARDIAN` | 6 | [ ] |
| `SHIPPER` | 7 | [ ] |
| `PATTERN SEEKER` | 8 | [ ] |
| `ORCHESTRATOR` | BOSS | [ ] |
| `AI-AUGMENTED ENGINEER` | ALL | [ ] |

Mark each `[ ]` as `[x]` when earned.

---

## Quick Reference

| Level | Command | One-liner |
|-------|---------|-----------|
| 1 | `/plan <task>` | Plan before touching code |
| 2 | `/save-session` · `/resume-session` | Preserve context across sessions |
| 3 | `/go-test` · `/rust-test` · `/kotlin-test` | RED then GREEN — no shortcuts |
| 4 | `/build-fix` | Fix errors one at a time, minimally |
| 5 | `/security-scan` | Scan before every ship |
| 6 | `/code-review` · `/code-review <PR#>` | Seven categories, every time |
| 7 | `/checkpoint create <name>` · `/pr` | Snapshot then ship |
| 8 | `/learn` · `/instinct-status` · `/evolve` | Extract, inspect, evolve |
| BOSS | `/multi-workflow <feature>` | Six phases, one workflow |
