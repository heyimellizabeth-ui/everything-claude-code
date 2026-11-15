---
description: Run the Hallmark design linter on a page, folder or URL and block on Floor failures.
argument-hint: "[path|.] [--tier floor] [--scope app|component] [--render] [--require-render] [--before] [--kept] [--url <url>]"
---

# Design Gate Command

The visual counterpart of `/quality-gate`. It runs the Hallmark design skill's linter (`sloplint`)
on HTML, CSS and component files and blocks when the page breaks Hallmark's Floor: contrast, focus
rings, reduced motion, colour and font tokens, phone layout, tracked-capital labels and the other
tells that make a page look generated.

Hallmark is a separate, optional skill. This command wraps it and never copies it.

## Usage

`/design-gate [path|.] [flags]`

| Flag | Effect |
|------|--------|
| `--tier floor` | Check only the Floor. Open Reflex findings are reported but do not block. |
| `--scope app` or `--scope component` | Lint an app screen or a single component instead of a page. |
| `--genre <genre>` | `editorial`, `modern-minimal`, `atmospheric` or `playful`. |
| `--render` | Also run the browser checks at eight widths. |
| `--require-render` | Fail if the browser checks did not run. Use before shipping. |
| `--url <url>` | Lint a running dev server route. Implies `--render`. Pass the source path too: a URL alone checks only the running page, not tokens, overflow, the stamp or copy rules. |
| `--before` | Record the page's links, fields, handlers and headings before a redesign. Never blocks. |
| `--kept` | After a redesign, fail if anything recorded by `--before` went missing. Run it from the same folder, on files with the same names. |
| `--require-hallmark` | Fail instead of skipping when Hallmark is not installed. |
| `--enforce` | Block on findings even when the project was not built with Hallmark. |
| `--json` | Print the full result as JSON. |

## Process

1. Run the gate:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/design-gate.js" $ARGUMENTS
   ```

   With a manual install, use `node ~/.claude/scripts/design-gate.js $ARGUMENTS`.

2. Read the summary line, for example
   `Floor 0 FAIL · Reflex 2 (1 waived) · 4 WARN · render: skipped`, and report it to the user as
   printed. Always say whether the render tier ran.

3. On `BLOCKED`:
   - Fix every `FAIL`. Floor findings cannot be waived.
   - Fix every `REFLEX`, or waive it with a real reason in the page's Hallmark stamp.
   - Re-run until the gate passes. Never edit a test, the stamp counts or the linter to get a pass.

4. On `SKIPPED`, tell the user Hallmark is not installed and that no design check ran. Do not
   report a pass.

## Pass Rules

- The gate **blocks** only on a project Hallmark built or polished: a Hallmark stamp in a stylesheet or
  page, a `.hallmark/` folder, or a `design.md`, at or above the target or the working directory. For any
  other project it prints `REPORT ONLY`, lists the findings and exits 0, because gate 20 (the stamp)
  alone would fail every page Hallmark never touched. Add `--enforce` to block anyway.
- Any `FAIL` blocks.
- An open `REFLEX` blocks, unless `--tier floor` was given.
- With `--require-render`, a run without the browser checks blocks. The summary says `render: NOT RUN`
  and prints the reason when `--render` or `--url` was asked for but the browser checks did not run.
- A `--before` run only records the page and never blocks.
- Studio sites from `/studio-build`: use `--tier floor`. A freshly scaffolded site passes it with the browser
  checks (`--render --require-render`). The full tier still reports Reflex findings that a project may
  waive in its own stamp, and longer copy brings back the words-per-screen budget (gate 58).

Exit codes: `0` pass or skipped, `1` blocked, `2` usage or runtime error.

## Prerequisites

- **Hallmark skill**, version 2.0.0: `npx skills add nutlope/hallmark -g`. The gate looks in
  `HALLMARK_SKILL_DIR`, then `~/.claude/skills/hallmark`, then `~/.agents/skills/hallmark`.
- **Node 18 or later.**
- **For `--render` only:** `puppeteer-core` (global, local, or via `HALLMARK_PUPPETEER`) and Chrome
  or Chromium (`CHROME_PATH` when it is not in a usual place). Playwright alone is not enough.

## When to Use

- After `/quality-gate` in any chain that ships UI.
- With `--before` and then `--kept` around a redesign or polish pass, to prove no link, form field
  or test hook was dropped.
- With `--require-render` before a release.

## Examples

```
/design-gate projects/my-club --tier floor
/design-gate src/app --scope app --render
/design-gate src --url http://localhost:3000/pricing --require-render
/design-gate projects/my-club --before
/design-gate projects/my-club --kept
```

## Arguments

$ARGUMENTS:

- `[path|.]` optional target path, default current directory
- flags as listed under Usage
