# ECC User Guide

Everything Claude Code (ECC) is a plugin that adds 60 agents, 75 commands, 180 skills, and automated hooks to your Claude Code session. This guide covers the highest-value workflows and how to use them effectively.

**Installed:** `--profile full` · 731 files · `/root/.claude/`

---

## Core Workflows

### 1. Feature Development

The standard path from idea to merged PR:

```
/plan <description>          # Design, identify risks, wait for your approval
/go-test (or /rust-test etc) # Write failing tests first (RED)
                              # Implement until tests pass (GREEN)
                              # Refactor while green
/checkpoint create done       # Snapshot before review
/code-review                  # Local review of staged changes
/pr                           # Push and open GitHub PR
```

**Rule:** `/plan` never touches code until you confirm. `/go-test` / `/rust-test` / `/kotlin-test` / `/flutter-test` enforce RED → GREEN → REFACTOR — do not skip the failing step.

---

### 2. Session Continuity

Working across sessions without losing context:

```
# End of session
/save-session                 # Writes ~/.claude/session-data/YYYY-MM-DD-<id>-session.tmp
                              # Captures: what worked, what failed, exact next step

# Start of next session
/resume-session               # Loads most recent session file
                              # Reads briefing, WAITS — does not auto-start work
```

The saved file records what **not** to retry (failed approaches, library conflicts) — this is the most valuable part.

---

### 3. Code Quality Gate

Run before any PR, after any refactor:

```
/build-fix                    # Fix build/type errors incrementally (one at a time)
/security-scan                # Detect secrets, broad permissions, unsafe MCPs
/code-review                  # Full review: correctness, security, performance, maintainability
```

`/code-review <PR number>` reviews a GitHub PR and posts the result directly as a GitHub review with approve/request-changes/block.

---

### 4. Continuous Learning

ECC learns from your sessions and builds up reusable instincts:

```
/learn                        # Extract patterns from this session → save as skill
/instinct-status              # Show all learned instincts (project + global)
/evolve                       # Cluster related instincts into skills/commands/agents
/promote [id]                 # Promote project instinct to global (seen in 2+ projects)
/projects                     # List all known projects and instinct counts
```

Instincts are scoped per project by default — they won't bleed across unrelated codebases.

---

## Command Reference

| Command | What it does | Key options |
|---------|-------------|-------------|
| `/plan <description>` | Design implementation, wait for approval | Accepts free text or `.prd.md` path |
| `/code-review` | Review local changes across 7 categories | `/code-review <PR#>` for GitHub PR mode |
| `/security-scan` | Detect secrets, risky permissions, unsafe hooks | `--min-severity high`, `--fix` |
| `/multi-workflow <task>` | 6-phase Research → Plan → Execute → Review cycle | Use for large, cross-cutting features |
| `/save-session` | Snapshot session context to file | None — run at end of every session |
| `/resume-session` | Load last session, brief you, wait | Optionally pass date or file path |
| `/checkpoint create <name>` | Git snapshot with name for rollback | `verify <name>` to diff against it |
| `/learn` | Extract reusable pattern from session | Asks before saving |
| `/build-fix` | Fix build/type errors one at a time | Auto-detects build tool |
| `/pr` | Push branch and open GitHub PR | `--draft` for draft PR |
| `/go-test` | TDD workflow for Go (table-driven tests) | Feature description as argument |
| `/rust-test` | TDD workflow for Rust (cargo-llvm-cov) | Feature description as argument |
| `/kotlin-test` | TDD workflow for Kotlin (Kotest + Kover) | Feature description as argument |
| `/flutter-test` | TDD workflow for Flutter/Dart | Feature description as argument |
| `/instinct-status` | Show all learned instincts | Lists project + global with confidence scores |

---

## Skills Reference

Skills are background knowledge activated automatically based on context. The most important ones:

### `tdd-workflow`
Enforces the full TDD cycle on any language:
1. Write user journeys first ("As a user, I want to...")
2. Generate comprehensive test cases
3. Run → **must fail** (RED gate — stop if it doesn't fail for the right reason)
4. Write minimal implementation → **must pass** (GREEN gate)
5. Refactor with tests staying green
6. Verify ≥80% coverage
7. Git checkpoint after each stage

Test what the user sees, not implementation internals:
```typescript
// Good
expect(screen.getByText('Saved')).toBeVisible()
// Avoid
expect(component.state.saved).toBe(true)
```

### `continuous-learning-v2`
Instinct lifecycle:
- **Observe** — hooks capture every tool call + outcome (100% deterministic, not sampled)
- **Detect** — background agent identifies patterns → creates atomic instincts with confidence 0.3–0.9
- **Store** — project-scoped by default
- **Evolve** — `/evolve` clusters instincts into skills/commands
- **Promote** — `/promote` moves project instinct to global when useful across projects

### `verification-loop`
6-phase gate before any PR:
1. Build (`npm run build` / `cargo build`)
2. Type check (tsc / pyright)
3. Lint (eslint / ruff)
4. Tests with coverage target (80%+)
5. Security grep (secrets, `console.log`, etc.)
6. Diff review (`git diff --stat` + per-file review)

### `harness-audit`
Audits your Claude Code config for: hardcoded secrets, overly broad permissions, executable hooks, MCP server risk, missing agent prompt defenses. Run periodically or after changing `settings.json`.

---

## Hook Automations

These run automatically — you don't invoke them:

| Hook | Trigger | What it does |
|------|---------|-------------|
| `pre:bash:dispatcher` | Every Bash call | Quality checks, tmux awareness, push safety, GateGuard |
| `pre:write:doc-file-warning` | Write to non-standard doc file | Warns before creating unexpected docs |
| `pre:observe:continuous-learning` | Every tool call | Captures prompt + outcome for instinct extraction (async, 10s) |
| `stop-hook-git-check` | Session end | Checks for uncommitted changes, prompts to commit + push |

**Control hooks at runtime:**
```bash
# Run with minimal hooks (no quality gates)
ECC_HOOK_PROFILE=minimal claude

# Disable specific hooks
ECC_DISABLED_HOOKS=pre:bash:dispatcher claude

# Profiles: minimal | standard (default) | strict
```

**GateGuard** is the most important hook: it requires you (or Claude) to read a file before the first edit to it. This prevents blind writes based on assumptions.

---

## Quick-Start Cheatsheet

| I want to… | Use this |
|-----------|---------|
| Start a new feature | `/plan <description>` |
| Write tests first | `/go-test` / `/rust-test` / `/kotlin-test` / `/flutter-test` |
| Fix a build error | `/build-fix` |
| Review my changes | `/code-review` |
| Review a GitHub PR | `/code-review <PR number>` |
| Find security issues | `/security-scan` |
| Open a PR | `/pr` |
| Save work before closing | `/save-session` |
| Pick up where I left off | `/resume-session` |
| Mark a milestone | `/checkpoint create <name>` |
| Roll back to a milestone | `/checkpoint verify <name>` |
| Save a pattern I discovered | `/learn` |
| See what I've learned | `/instinct-status` |
| Evolve instincts into skills | `/evolve` |
| Run a big multi-model task | `/multi-workflow <description>` |
| Check Claude config health | `/harness-audit` |

---

## Tips

- **Always `/plan` first** for anything that touches more than 2 files. The risk identification alone is worth it.
- **`/save-session` every session.** The "what not to retry" section saves hours.
- **Let hooks run.** The `pre:observe` hook is what feeds the learning system — don't disable it unless you have a performance reason.
- **Use `/checkpoint` liberally.** Before risky refactors, before merging a dependency upgrade, before any "one big change."
- **`/security-scan` before every PR**, not after review comments — it's faster to fix before than respond to review threads.
