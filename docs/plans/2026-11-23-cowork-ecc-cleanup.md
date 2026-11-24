# Cowork plan: ECC setup cleanup

A task list for Claude Cowork to carry out on the owner's Mac. It follows from the
ECC architecture review and `docs/plans/2026-11-23-ecc-config-tuning.md`.

## How to use this plan

- Work through the parts in order. Each task says **where** it runs, **what** to change,
  **how to check** it, and **how to undo** it.
- **Back up before every delete or edit outside the repo.** Use the backup folder below.
- **Stop and ask the owner** at every step marked **ASK**. Do not guess those.
- Do not push to `main`, merge anything, or delete branches. Repo work goes on a branch
  and into a pull request for the owner to review.
- If a step fails, stop that part, report what failed with the exact error, and move on
  to the next part only if it does not depend on the failed one.

Backup folder for this run:

```bash
mkdir -p ~/ecc-cleanup-backup-2026-11-23
```

## Already done (do not repeat)

- These 10 plugins are turned off in `~/.claude/settings.json` on the Mac:
  bio-research, legal, human-resources, marketing, product-management,
  product-tracking-skills, operations, data, cowork-plugin-management, academy-guide.
- `sales@synced` was turned off and then turned back on by the owner. Leave it on.

---

## Part A — Mac config (no repo needed)

These change the owner's own Claude setup. They need access to `~/.claude/`.
If Cowork cannot reach `~/.claude/` (it is a hidden folder), stop and give the owner
the exact commands from each task to run in Terminal instead.

### A1. Remove duplicate rule files

**Why:** `~/.claude/rules/ecc/zh/` is a Chinese copy of `~/.claude/rules/ecc/common/`,
so the same rules load twice in every session. `~/.claude/rules/ecc/README.md` is install
instructions, not rules, but it also loads every session.

1. Back up:
   `cp -R ~/.claude/rules/ecc/zh ~/.claude/rules/ecc/README.md ~/ecc-cleanup-backup-2026-11-23/`
2. Delete:
   `rm -r ~/.claude/rules/ecc/zh ~/.claude/rules/ecc/README.md`

**Check:** `ls ~/.claude/rules/ecc` no longer lists `zh` or `README.md`; `common` and `web` are still there.
**Undo:** copy both back from the backup folder.

### A2. Fix outdated model advice in the installed rules

**Why:** `~/.claude/rules/ecc/common/performance.md` recommends Haiku 4.5, Sonnet 4.6
and Opus 4.5. Those are out of date, and the file loads every session.

1. Back up `~/.claude/rules/ecc/common/performance.md`.
2. In the "Model Selection Strategy" section, replace the three model headings:
   - `Haiku 4.5` → `Haiku 5.5`
   - `Sonnet 4.6` → `Sonnet 5.5`
   - `Opus 4.5` → `Opus 5.5`
3. Keep the bullet points under each heading as they are. Remove the
   "(90% of Sonnet capability, 3x cost savings)" claim, since it was written for the
   older models and is no longer verified.

This is a stopgap. The lasting fix is in the repo (task B6); a reinstall would
otherwise overwrite this file with the old text.

**Check:** `grep -n 'Haiku\|Sonnet\|Opus' ~/.claude/rules/ecc/common/performance.md` shows only 5.5 names.
**Undo:** restore from backup.

### A3. Quiet the noisiest ECC hooks

**Why:** the `ecc` plugin is on (`"ecc@ecc": true`), so its hooks run on every tool call.
Several of them only record telemetry. `ECC_DISABLED_HOOKS` turns individual hooks off;
it cannot turn hooks on.

**ASK** the owner before this step: "Turn off these 7 telemetry/advisory hooks?
pre:observe, post:observe, pre:governance-capture, post:governance-capture,
post:ecc-context-monitor, post:edit:design-quality-check, pre:edit-write:suggest-compact.
Security and git-safety hooks stay on." Use the owner's edited list if they change it.

1. Back up `~/.claude/settings.json`.
2. Add (or merge into an existing `env` block) at the top level of `~/.claude/settings.json`:

   ```json
   "env": {
     "ECC_DISABLED_HOOKS": "pre:observe,post:observe,pre:governance-capture,post:governance-capture,post:ecc-context-monitor,post:edit:design-quality-check,pre:edit-write:suggest-compact"
   }
   ```

3. Keep every other key in the file exactly as it was, including `enabledPlugins`.
4. Check that the file is still valid JSON:
   `python3 -m json.tool ~/.claude/settings.json > /dev/null && echo OK`

**Check:** a new Claude Code session starts without errors.
**Undo:** restore `~/.claude/settings.json` from backup.

---

## Part B — Repo changes

These run in a local clone of `heyimellizabeth-ui/everything-claude-code`.
They need a terminal with `git`, Node 18+ and `npm`.

**Setup:**

1. **ASK** the owner where the clone is. If there isn't one:
   `git clone https://github.com/heyimellizabeth-ui/everything-claude-code.git ~/everything-claude-code`
2. `cd` into it, then `git fetch origin && git checkout claude/stoic-newton-92qioc && git pull`.
   This branch holds the open draft PR #57 with the planning docs.
3. `npm ci`
4. Baseline: `node tests/run-all.js` and write down the pass/fail counts. Tests that
   already fail before any change are not caused by this work; list them in the report.

**Rule for every task in Part B:** after each task, run `node tests/run-all.js`, then
make one commit with a conventional-commit message (given per task). If tests that
passed in the baseline now fail, fix that before moving on, or undo the task with
`git checkout -- <files>` and report it.

### B1. Fix the package-manager mismatch

**Why:** `.claude/package-manager.json` says bun, `package.json` says yarn, and the
web session hook runs `npm install`, which rewrites `yarn.lock` every session. CI mostly
uses `npm ci`, so npm becomes the standard.

1. `.claude/package-manager.json`: set `"packageManager": "npm"`.
2. `.claude/hooks/session-start.sh`: change `npm install` to `npm ci`, and the echo
   line above it to say `npm ci`.
3. **ASK** the owner about `yarn.lock` and the `packageManager: yarn@4.9.2` field in
   `package.json`. First check `.github/workflows/` for a job that runs `yarn install`;
   tell the owner whether one exists. Only remove either if the owner says so.

Commit: `chore: standardize session setup on npm`

### B2. Pin Codex MCP server versions

**Why:** `.mcp.json` pins versions; `.codex/config.toml` does not, so the two drift.

In `.codex/config.toml`, change the package names to match `.mcp.json` exactly:

| Server | Pinned package |
|--------|----------------|
| github | `@modelcontextprotocol/server-github@2025.4.8` |
| context7 | `@upstash/context7-mcp@2.1.4` |
| memory | `@modelcontextprotocol/server-memory@2026.1.26` |
| playwright | `@playwright/mcp@0.0.69` |
| sequential-thinking | `@modelcontextprotocol/server-sequential-thinking@2025.12.18` |

Leave the commented-out servers alone.
Then search `tests/` for an existing Codex config test (`grep -rl codex tests`). If
one exists, add a case there that fails when a package in `.mcp.json` and
`.codex/config.toml` has different versions. If none exists, create
`tests/scripts/mcp-version-parity.test.js` following the style of nearby tests.

Commit: `chore: pin codex MCP server versions to match .mcp.json`

### B3. Point ECC tooling at the fork and match the real profile

**Why:** `.claude/ecc-tools.json` still names the upstream repo and claims a
`full` / `enterprise` profile, while the owner's actual install is `developer`.

1. Set `"repo"` to `https://github.com/heyimellizabeth-ui/everything-claude-code`.
2. **ASK** the owner before changing the profile fields. If yes: set the
   requested/recommended/effective profile fields to `developer`, and remove
   `team-config-sync` and `enterprise-controls` from every package list in the file.
   Validate with `python3 -m json.tool .claude/ecc-tools.json > /dev/null`.
3. Do not delete `.claude/enterprise/` or `.claude/team/`; list them in the report
   for the owner to decide.

Commit: `chore: point ecc-tools at fork and developer profile`

### B4. Turn off unrelated plugins for this repo

**Why:** the Mac change in "Already done" doesn't reach cloud sessions. Writing it into
the repo's `.claude/settings.json` does, and leaves the owner's other projects alone.

From the repo root:

```bash
for p in sales bio-research legal human-resources marketing product-management product-tracking-skills operations data cowork-plugin-management academy-guide; do claude plugin disable "$p@synced" --scope project; done
```

**Important:** run this from the repo root, not from `~`. From `~` it writes to the
user settings file instead.

**Check:** `git diff .claude/settings.json` shows an `enabledPlugins` block with those
11 set to `false`, and the existing `SessionStart` hook is unchanged. If the `claude`
CLI isn't available, add the block by hand instead.

Commit: `chore: disable unrelated plugins for this repo`

### B5. Convert the 3 project commands to skills

**Why:** repo policy treats `commands/` as legacy.

For each of `add-language-rules`, `database-migration`, `feature-development` in
`.claude/commands/`:

1. Create `.claude/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`)
   and the sections **When to Use**, **How It Works**, **Examples**, moving the content
   over from the command file.
2. Delete the command file.
3. Update any reference to these commands in `.claude/rules/everything-claude-code-guardrails.md`.

Run `npx markdownlint-cli '.claude/**/*.md'` and fix any errors.

Commit: `refactor: move project commands to skills`

### B6. Fix outdated model advice at the source

Make the same change as A2 in the repo's `rules/common/performance.md`, and the
matching lines in `rules/zh/performance.md` (Haiku 5.5, Sonnet 5.5, Opus 5.5).

Commit: `docs: update model names in performance rules`

### B7. Split `gateguard-fact-force.js`

**Why:** `scripts/hooks/gateguard-fact-force.js` is 832 lines and runs on every edit.
Repo rule: hook scripts under 200 lines, helpers in `scripts/lib/`.

**ASK** the owner before starting; this is the largest task. Prefer to hand it to
Claude Code if the owner agrees.

1. Read the file and its test `tests/hooks/gateguard-fact-force.test.js`.
2. Move self-contained helper functions into `scripts/lib/gateguard/` modules.
   Keep the hook file as the entry point with the same exports and behaviour.
3. The existing test must pass unchanged. Do not edit the test to make it pass.
4. Add a test in `tests/lib/` for each new module.

Commit: `refactor: split gateguard-fact-force helpers into lib`

### Finish Part B

1. `node tests/run-all.js` passes, with no new failures compared with the baseline.
2. `npx markdownlint-cli '**/*.md' --ignore node_modules` passes.
3. `git push origin claude/stoic-newton-92qioc`
4. Do not merge. The owner reviews PR #57.

---

## Out of scope (do not do)

- Splitting the large Rust files in `ecc2/` (up to 15,000 lines). Only worth it if the
  owner builds on ECC 2.0.
- Trimming `.mcp.json` servers (item 02 in the original plan). Those tools already
  load on demand, so the gain is small.
- Deleting the packaging folders for other tools (`.cursor`, `.kiro`, …).

## Report back

When finished, give the owner:

1. A table of every task: done, skipped (why), or failed (exact error).
2. The answers the owner gave at each **ASK**.
3. Test counts before and after.
4. The backup folder path, and how to undo Part A.
5. Open decisions left: `yarn.lock`, the `.claude/enterprise/` and `.claude/team/` folders.
