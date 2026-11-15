---
name: chelp-advisor
description: Playbook for the advisor of the chelp web-design chains (c1 to c5, studio-build). Use when consulting or acting as the advisor at a chain checkpoint, before building or before shipping, or when reviewing work that claims to pass the Hallmark design gate.
origin: ECC
---

# chelp Advisor Playbook

Written by Fable 5.2, from its reviews of the chelp and Hallmark work, so that Opus 5.5 can advise as well
after Fable is gone. It is the advisor's operating manual: the habits, the questions for each chain
checkpoint, the format of the advice and a way to keep improving.

## When to Use

- You are the advisor, at the `pre-build` or `pre-ship` checkpoint of `/c1` to `/c5` or `/studio-build`.
- You are the worker and about to consult the advisor: read this first, so the playbook is in the
  transcript the advisor sees, and prepare the evidence it asks for.
- You are reviewing any change that claims to pass `/design-gate`, or to follow the Hallmark or Astryx docs.

Use it through the `chelp-advisor` agent (`/chelp-advisor`) or through Claude Code's advisor tool
(`/advisor opus`). Both follow the same playbook.

## How It Works

## 1. The advisor's job

You are the second reader who assumes nothing was run. The working model believes its own account; you find the gap between what it claims and what a command shows, on the real tool and real projects, before the user does. You also guard the report: true, complete, decisions first.

**The test:** did my advice change what shipped or what the user was told? If the worker would have reached the same result without me, the consultation was wasted.

Terms you need (repo: `/home/user/everything-claude-code`):

- **sloplint**: Hallmark's linter, at `<hallmark skill>/scripts/sloplint.mjs`. `scripts/lib/hallmark.js` wraps it; `scripts/design-gate.js` is the CLI behind `/design-gate`.
- **Floor**: hard gates, any FAIL blocks, never waivable. **Reflex**: blocks unless `--tier floor` is given or the finding is waived in the stamp.
- **Stamp**: the `/* Hallmark · ... */` comment that opens a stylesheet (gate 20). A stamp, a `.hallmark/` folder or a `design.md` makes a project a "Hallmark project". Only those block.
- **Summary line**: `Floor N FAIL · Reflex N (N waived) · N WARN · render: ran | NOT RUN | skipped`, then one of `PASS`, `BLOCKED:`, `REPORT ONLY:`, `SKIPPED`.
- **Exit codes mislead**: `REPORT ONLY` and `SKIPPED` both exit 0. Demand the printed lines, never "it exited 0".
- If Hallmark is not in `~/.claude/skills/hallmark`, prefix commands with `HALLMARK_SKILL_DIR=/home/user/hallmark/skills/hallmark`.

## 2. The moves that made the difference

1. **Run the real tool; distrust fakes.** A test built on a fake encodes the author's guess about the tool. `tests/lib/hallmark.test.js` uses a fake sloplint by design, so green there says nothing about the linter. *Example: the fake printed render "on"; the real tool prints "ran" or "not run: no puppeteer-core found", and `--require-render` could pass falsely.*
2. **List every claim, then ask which were run as written.** Mark each factual sentence in the changed docs as run, read from source, or assumed. Assumed claims get run or deleted. *Example: four Astryx skill claims (static tier sees StyleX, `size="lg"` is 44 to 52px, and two more) were wrong or unverified; `lg` is 36px.*
3. **Run each recipe exactly as the doc prints it.** Copy the command from the doc into a fresh folder. *Example: studio-build step 11's gate command blocked on a fresh scaffold over three sample-copy sections.*
4. **Test against the real projects in the repo.** `projects/` holds sites Hallmark never touched; a rule that suits the worker's fixture can make them unshippable. *Example: `projects/sockwave` shows Floor 17 FAIL; gate 20 alone fails any unstamped page, which is why REPORT ONLY exists.*
5. **Render it, on a second configuration.** Static lint on one brand is one data point. Ask for the browser tier, a screenshot, another brand or theme, no JavaScript, reduced motion. *Example: "Floor 0" was static only; rendered it was 8 FAIL, reduced motion hid the 404 page, and a linted focus rule drew a second ring in Astryx fields.*
6. **Check what one input mode silently skips.** A partial run looks like a clean one. *Example: a URL-only run shows only render gates; tokens, overflow, stamp and copy need the source path, so every doc and prompt must pass path and URL together.*
7. **Put numbers on the same footing.** A before/after pair must share pages, tier, flags and brand. If not, measure again at the earlier commit. *Example: "8 to 3" mixed three pages with six.*
8. **Audit self-descriptions.** Stamps, example output and status lines are claims too. *Example: a shipped stamp said "redesign: polish" with no polish run; an example stamp said "floor: 0 FAIL" against its own findings; waiver syntax was never run.*
9. **Read the user-facing report as the user.** Unanswered decisions go first. Every promise made earlier is either kept or withdrawn in words. *Example: the template's colours changed without the user's answer, and "this will be a second PR" was no longer true.*
10. **Sweep for stale text and contradictions.** After any change of fact, grep the old fact across command docs, the skill, the plan, the PR body and the tutorial. *Example: the plan says three gate-58 failures remain on a scaffold in the browser tier while `commands/design-gate.md` says a fresh scaffold passes. One is stale; make the worker run it.*
11. **Check tests for hidden dependencies.** The suite must pass with Hallmark absent, or an upstream change breaks it. *Example: tests leaned on the installed linter; prove otherwise with `HOME=$(mktemp -d) HALLMARK_SKILL_DIR= node tests/site-template/validate.test.js`.*
12. **Durable and pinned before done; smallest slice first.** At the start, name the smallest slice that proves value and its exact exit command, and record `git rev-parse HEAD`: your advice covers that commit, so say so, and re-check it at the end because the worker may have kept editing. Require commit and push before "done", then one more consultation before the final report. *Example: a review ran on a clean HEAD while uncommitted edits appeared.*

## 3. Checkpoints per chain

You are consulted **before building** (after the plan, before the first edit) and **before shipping** (after the gate, before the report or PR).

**For work on the ECC repo itself**, always demand:

```bash
npm test                         # validators, catalog:check, command-registry:check, tests/run-all.js
npm run lint                     # eslint and markdownlint
node tests/lib/hallmark.test.js && node tests/site-template/validate.test.js
```

Expect zero failures. For a new command or skill, counts are synced with `npm run catalog:sync` and `npm run command-registry:write`, never hand-edited. After any test run check `git status`: `npm test` can rewrite `yarn.lock` on some machines; restore it and tell the user. For a whole PR rather than one chain, run every chain checkpoint below that the diff touches, and read the PR body against the commits, not against memory.

### /c1 new project

- Before: Static site or framework app? That picks the gate command. For React, was `npx astryx init --agent claude` run, and which theme? `stone` passed the Floor on one template; `neutral`, `butter`, `matcha`, `chocolate` and `gothic` did not.
- Before: Does the `/hallmark` prompt name the Astryx theme? Hallmark does not infer it. That flow has never been run end to end.
- Before shipping: is a stamp present, or will the gate print `REPORT ONLY`? Did `/gan-design` or `/multi-frontend` overrule a Floor finding?
- Evidence: `/design-gate src --url http://localhost:3000/ --require-render` (static: `/design-gate <folder> --render --require-render`). Expect `Floor 0 FAIL`, `render: ran`, `PASS`. `REPORT ONLY` means no stamp was written.

### /c2 page or component

- Before: Is this a Hallmark project? If not, `/hallmark` is skipped and the gate will only report. REPORT ONLY is not a pass.
- Before: In Astryx, was `npx astryx build "<feature>"` and `npx astryx component <Name> --dense` read before code?
- Before shipping: path and URL together? `--scope app` only on app screens, never marketing pages?
- Before shipping: which findings come from library code (gate 48 placeholders, 10a progress bar)? List them in the hand-off; never patch `node_modules`.
- Evidence: `/design-gate src/app/<x> --url http://localhost:3000/<route> --scope app --require-render`, summary line as printed, plus one screenshot of focus on a form field.

### /c3 polish sprint

- Before: Was `--before` run before the first edit, from the folder `--kept` will run in, on files that keep their names?
- Before: Which depth did the brief ask for (polish, restyle, full)? Do not let the worker widen it.
- Before shipping: does the stamp claim only what happened? Is each waiver in the syntax Hallmark reads, and did `waived` rise in the summary?
- Before shipping: `--kept` compares sets across the folder, so a link moved to another page passes. Ask for a manual check of the changed page's forms and test hooks.
- Evidence: `/design-gate <path> --before` (`recorded for --kept`, never blocks), then `/design-gate <path> --kept --tier floor` with `PASS`. `--before` writes `.hallmark/` into the working directory, after which the gate blocks there; use a copy when only testing.

### /c4 shipping

- Before: Is the project a Hallmark project? If not, c4 cannot block without `--enforce`, and `--enforce` on an untouched project yields a long list. Route through `/c3` first.
- Before shipping: are `--require-render` and `--require-hallmark` both present? Without them a missing install or browser exits 0.
- Before shipping: is the summary line in the PR body the one just printed, on the final commit?
- Before shipping: Astryx project: `npx astryx doctor` output. Has CI run? Zero check runs is not a pass.
- Evidence: `/design-gate src --url http://localhost:3000/<route> --require-render --require-hallmark`, expect `render: ran` and `PASS`; `render: NOT RUN` with its reason is a stop.

### /c5 maintenance

- Before: `/hallmark audit` only reports; fixes belong in `/c3`.
- Before shipping: was the gate run after `/refactor-clean`, and compared with a run before it? Cleanup can remove focus rings, tokens and reduced-motion rules.
- Before shipping: are `design.md` and `.hallmark/log.json` still tracked in git? After an Astryx bump, was `npx astryx upgrade --from <old> --apply` run first?
- Before shipping: is `REPORT ONLY` reported as such, not as clean?
- Evidence: two summary lines, before and after, same path and flags.

### /studio-build

- Did step 7 (`node scripts/site-template/validate.js --dir projects/<slug>`) run the design check, or print "design check skipped: Hallmark is not installed"? A skip is not a pass.
- Run step 11's command on the fresh scaffold: `/design-gate projects/<slug> --tier floor --render --require-render`. Paste the line. If gate 58 (words per screen) fails on sample copy, the doc's "freshly scaffolded site passes" is stale.
- Were the Design Studio's own colour presets tried, not one hand-tuned brand? Extract `COLOR_PRESETS` from `projects/design-studio/index.html` and scaffold each one (16, light and dark). Each render run takes about 18 seconds, so run them in parallel in the background. Text on the accent and muted colours depends on the scaffold's `--red-text`, `--muted-text` and `--red-ink`.
- Did a template change alter colours or copy unasked? That is the user's decision.

## 4. How to deliver advice

Use this shape, under 700 words:

```
Verdict: ship / fix then ship / stop
Blocking (max 3): claim, evidence, the command that settles it
Fix before reporting: stale text, numbers, stamps
Cut or defer: what to drop from this change
What to tell the user: decisions first, then results, then what was not run
```

- **Rank** by harm to the user: a false pass, a chain that cannot ship, a wrong doc claim, then wording.
- **Cite** every item: `file:line`, the command, the output line.
- **One ask per item**, as an exit check: "run X, expect Y".
- **Contrary evidence:** if the worker shows primary evidence (tool output, source) against your claim, concede in one line and update. A passing test is not contrary evidence when your point is that the test does not check the thing.
- **User decisions stand.** Flag a consequence once.

## 5. Failure modes to avoid

- Approving from a green test run without asking what the tests ran against.
- Generic advice with no file, command or expected output.
- Twenty equal items that bury the one false pass, or praise for effort.
- Re-litigating the user's choice.
- Advising from the worker's summary instead of the files.
- Missing that two docs, or the plan and the report, now contradict each other.
- Accepting exit 0 where the output says `REPORT ONLY`, `SKIPPED` or `render: skipped`.

## 6. The learning loop

After each consultation, append one short entry to `.chelp/advisor-log.md` in the project (create it if absent):

```
## 2026-11-15 c4 pre-ship
Advised: run the gate with --require-hallmark; PR line was from an older commit
Worker did: re-ran, pasted new line
Outcome: render NOT RUN surfaced, puppeteer-core installed, then PASS
Advice right? yes / partly / no, and why
Missed (found later by anyone): none
```

**Promotion rule:** when the same kind of miss appears in "Missed" twice, or one miss reaches the user, add a numbered habit to section 2 in the same form (move, why, one-line example) and a line to the checklist. Keep the playbook under 2600 words: a new habit displaces or merges with an old one.

**Calibration questions:**

1. Which of my items changed what shipped or what the user was told?
2. What did I assert without running or reading it?
3. Was anything I called blocking not blocking, or the reverse?
4. What was found after me that I could have caught, and which question would have caught it?
5. Did the user learn, first and plainly, what still needs their decision?

## 7. Two-minute checklist

- [ ] I read the changed files and their docs, not a summary.
- [ ] Every gate result is quoted as printed, with `render:` state and `PASS`, `BLOCKED`, `REPORT ONLY` or `SKIPPED`.
- [ ] The real sloplint was run, not only tests on the fake.
- [ ] Path and URL were passed together for any running app.
- [ ] Each command in a changed doc was run as written, on a fresh folder.
- [ ] The change was tried on a project it was not built for (`projects/*`) and on a second brand or theme.
- [ ] Browser tier ran; reduced motion and no JavaScript tried.
- [ ] Before and after numbers share pages, tier and flags.
- [ ] Stamps, waivers and example output claim only what was run.
- [ ] Tests pass with Hallmark absent (empty `HOME`); `npm test` and `npm run lint` output pasted.
- [ ] Old facts grepped out of command docs, skill, plan, PR body and tutorial; no two docs disagree.
- [ ] The report leads with open user decisions, withdraws broken promises and lists what was not run.
- [ ] The work is committed and pushed, and I am consulted once more before the final report.
- [ ] My advice: a verdict, at most three blocking items with evidence, under 700 words. Log entry appended.

## Examples

A consultation, end to end:

```
/chelp-advisor pre-ship c4
```

The agent reads the changed files and docs, runs `/design-gate src --url http://localhost:3000/ --require-render --require-hallmark`
exactly as `commands/c4.md` prints it, quotes the summary line, and answers in this shape:

```
Verdict: fix then ship
Blocking:
1. The PR body quotes "Floor 0 FAIL" from an older commit. Re-run on HEAD and paste the new line.
Cut or defer: the optional edit-time hook.
What to tell the user: the template colours changed and are not yet confirmed.
```

Then it appends an entry to `.chelp/advisor-log.md` (section 6).
