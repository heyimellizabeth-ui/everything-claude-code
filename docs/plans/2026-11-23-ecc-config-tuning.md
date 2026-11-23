# ECC config tuning plan

Source: the "Optimise" list in `ECC_Architecture.pdf` (snapshot 2026-11-23, v2.0.0-rc.1).
Each item below was checked against the repo on branch `claude/stoic-newton-92qioc`.
Where the PDF was wrong or incomplete, the correction is noted.

## Execution order

The PDF ranks items by impact. This plan orders them by **dependency and risk**: fix
what dirties the working tree first, then the config-only changes, then the changes
that alter session behaviour.

| Phase | Items | Risk | Size |
|-------|-------|------|------|
| 0 | Baseline | none | 15 min |
| 1 | 03 package manager | low | 30 min |
| 2 | 05 MCP versions · 06 repo skill · 07 commands → skills | low | 1–2 h |
| 3 | 01 install profile · 02 MCP trim · 04 hook profile | medium (changes what loads) | 1–2 h |
| 4 | Verify + PR | — | 30 min |

One PR per phase keeps each change reviewable and revertible.

---

## Phase 0 — Baseline

The PDF only sees repo-level config, so capture the real state first.

1. `node scripts/list-installed.js > /tmp/ecc-before-installed.txt`
2. `node scripts/harness-audit.js > /tmp/ecc-before-audit.txt`
3. `node tests/run-all.js` and record pass/fail counts.
4. Record the current dirty file: `yarn.lock` is modified at session start (see Phase 1).

**Exit criterion:** baseline files saved; the test suite result is known.

---

## Phase 1 — Item 03: package-manager mismatch

**What the PDF missed:** the mismatch is three-way, not two-way.

| Source | Says |
|--------|------|
| `.claude/package-manager.json` | `bun` |
| `package.json` → `packageManager` | `yarn@4.9.2` |
| `.claude/hooks/session-start.sh` | runs `npm install` |
| Lockfiles committed | `package-lock.json` **and** `yarn.lock` |
| CI (`.github/workflows`) | `npm ci` ×11; bun/pnpm/yarn only in the PM matrix |

Side effect: `npm install` rewrites `yarn.lock` in v1 format on every web session,
which is why `yarn.lock` shows up as modified (+1435/−1910 lines) right now.

**Recommendation: npm is canonical** (CI already uses it).

1. `.claude/package-manager.json` → `"packageManager": "npm"`.
2. `session-start.sh`: `npm install` → `npm ci` (no lockfile writes, faster, deterministic).
3. `git checkout yarn.lock` to drop the session-start rewrite.
4. **Decision needed:** `package.json` `packageManager: yarn@4.9.2` and the committed
   `yarn.lock`. Check whether the yarn leg of the CI matrix depends on them before
   removing either. If it does, keep both but make the session hook never touch yarn.

**Verify:** a fresh session leaves `git status` clean; `npm ci && node tests/run-all.js` passes.

---

## Phase 2 — Low-risk config hygiene

### Item 05: unify MCP versions

Confirmed: `.mcp.json` pins versions; `.codex/config.toml` uses unpinned / `@latest`
for github, memory, playwright, sequential-thinking (and context7).

1. Copy the pins from `.mcp.json` into `.codex/config.toml`:
   `server-github@2025.4.8`, `context7-mcp@2.1.4`, `server-memory@2026.1.26`,
   `playwright/mcp@0.0.69`, `server-sequential-thinking@2025.12.18`.
2. Add a test in `tests/` (there are already codex-config tests) that fails when the
   two files disagree on a package version, so they cannot drift again.

### Item 06: regenerate the repo skill

Confirmed: `.claude/skills/everything-claude-code/SKILL.md` was generated 2026-03-20
from `affaan-m/everything-claude-code`, and `.claude/ecc-tools.json` `repo` still
points upstream.

1. Point `ecc-tools.json` `repo` at the fork (`heyimellizabeth-ui/everything-claude-code`).
2. Re-run `/skill-create` against current history.
3. Diff old vs new; keep any hand edits worth preserving.

### Item 07: move project commands to skills

Three commands in `.claude/commands/`: `add-language-rules`, `database-migration`,
`feature-development`.

1. Create `.claude/skills/<name>/SKILL.md` for each with the required sections
   (When to Use, How It Works, Examples) per CONTRIBUTING.md.
2. Delete the command files once the skills load (check with `/` completion).
3. Also update the "Detected Workflows" list in
   `.claude/rules/everything-claude-code-guardrails.md` if it references them.

**Verify:** `npx markdownlint-cli '**/*.md' --ignore node_modules`; tests pass.

---

## Phase 3 — Changes to what loads each session

These change behaviour, so do them after Phase 0's baseline and compare.

### Item 01: downsize the install profile

Confirmed: `ecc-tools.json` is `full` / `enterprise` with `team-config-sync` and
`enterprise-controls`. Both are thin: `.claude/enterprise/controls.md` is 10 lines,
`.claude/team/everything-claude-code-team-config.json` is 411 bytes.

1. Set requested/effective profile to `developer` (exists in `manifests/install-profiles.json`).
2. Drop `team-config-sync` and `enterprise-controls` from the package lists;
   drop `team-rollout` and `governance-controls` components if they only map to those.
3. Run the installer in plan mode first (`scripts/install-plan.js`) and review the diff
   before applying.
4. Decide whether `.claude/enterprise/` and `.claude/team/` are deleted or left as dormant files.

### Item 02: trim always-on MCP servers

Six servers load tool schemas every session. Keep `github` + `context7` in `.mcp.json`.
Move `memory`, `sequential-thinking`, `playwright`, `exa` to opt-in.

- Opt-in mechanism: keep their definitions in `mcp-configs/mcp-servers.json`
  (already the preset catalog) and enable per task with `claude mcp add` or a
  per-project `.mcp.json` override.
- Mirror the same split in `.codex/config.toml` (comment out, like supabase/firecrawl already are).

**Trade-off:** the `/plan` and web chains (`c1`–`c5`) may call playwright or
sequential-thinking. Grep `skills/` and `commands/` for `mcp__playwright` /
`sequential` before removing, and document how to enable them for those flows.

### Item 04: hook profile

**Correction to the PDF:** `ECC_DISABLED_HOOKS` only *disables* hooks
(`scripts/lib/hook-flags.js`); there is no opt-in list. And under `minimal`, almost
everything is off: of the profile-gated hooks in `hooks/hooks.json` only
`post:ecc-metrics-bridge` declares `minimal`. So "minimal + opt in" cannot work as written.

Two workable options:

- **A (recommended):** stay on `standard` and subtract noise via
  `ECC_DISABLED_HOOKS` — candidates: `pre:observe`, `post:observe`,
  `pre:governance-capture`, `post:governance-capture`, `post:ecc-context-monitor`,
  `post:edit:design-quality-check`, `pre:edit-write:suggest-compact`.
- **B:** add `minimal` to the `profiles` of the hooks you want
  (block-no-verify, git-push-reminder, post-edit-format, which live behind the
  Bash dispatchers) and set `ECC_HOOK_PROFILE=minimal`. This is a code change to
  `hooks/hooks.json` and the dispatchers, and needs tests in `tests/hooks/`.

Note: `hooks/hooks.json` only fires if the ECC plugin is installed
(`CLAUDE_PLUGIN_ROOT`). Confirm from Phase 0's `list-installed` output that it is,
otherwise this item has no effect.

**Verify:** compare session start time and tool schema count before/after; re-run
`harness-audit.js` and diff against the baseline.

---

## Phase 4 — Verify and ship

1. `node tests/run-all.js` passes.
2. `npx markdownlint-cli '**/*.md' --ignore node_modules` passes.
3. `harness-audit.js` diff shows only intended changes.
4. Fresh web session leaves `git status` clean.
5. Draft PR per phase with conventional-commit titles
   (`chore: unify package manager on npm`, `chore: pin codex MCP versions`, …).

## Open decisions

1. Keep or remove `yarn.lock` and the `packageManager: yarn` field (depends on the CI matrix).
2. Hook option A or B.
3. Delete or keep the `.claude/enterprise/` and `.claude/team/` scaffolds.
