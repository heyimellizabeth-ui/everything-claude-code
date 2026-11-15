---
description: Consult the chelp advisor (Opus) at a chain checkpoint, before building or before shipping, and get ranked, evidence-backed advice.
argument-hint: "[pre-build|pre-ship] [c1|c2|c3|c4|c5|studio-build] [notes]"
---

# chelp Advisor

A second opinion from a stronger reviewer at the two moments where mistakes are cheapest to catch: before
the chain builds anything (`pre-build`) and before it ships or reports (`pre-ship`). The advisor reads the
real files, runs the real checks, and returns advice ranked by what stops the work from being correct or
honest. Its habits live in the `chelp-advisor` skill.

## Usage

```
/chelp-advisor pre-build c2 Add an account settings page to the Astryx app
/chelp-advisor pre-ship c4
/chelp-advisor pre-ship studio-build
```

## Two ways to consult

1. **The advisor tool (preferred).** Set the advisor model once with Claude Code's own `/advisor opus`.
   Before you call the advisor, read `skills/chelp-advisor/SKILL.md` in this session so the playbook is in
   the transcript the advisor sees. Then call the advisor at the checkpoint. It sees the whole conversation.
2. **This command.** It starts the `chelp-advisor` agent (model: opus) with a context packet. Use it when
   the advisor tool is not enabled, or when you want the review written to the advisor log.

## Process

1. Build the context packet:
   - the chain and the checkpoint
   - what you did or plan to do, in a few lines
   - `git status --short` and `git diff --stat` for the work so far
   - the commands you ran and their last lines of output, including the `/design-gate` summary line
   - anything the user has not answered yet
2. Start the `chelp-advisor` agent with that packet.
3. Read the advice. Fix every item under **Blocking** before you go on. Check **Fix before reporting**
   before you write the report to the user. Put **What to tell the user** at the top of the report.
4. If you have evidence that contradicts a finding, do not silently switch: ask the advisor once which
   constraint breaks the tie.

## Where it sits in the chains

| Chain | Pre-build | Pre-ship |
|-------|-----------|----------|
| `/c1` | after `/prp-plan` | after `/design-gate`, before `/santa-loop` |
| `/c2` | after `/plan` | after `/design-gate`, before `/checkpoint` |
| `/c3` | skip | after `/design-gate --kept`, before `/code-review` |
| `/c4` | skip | after `/design-gate`, before `/santa-loop` |
| `/c5` | skip | after `/design-gate`, before `/checkpoint create` |
| `/studio-build` | skip | after the Report step |

## Notes

- The advisor appends to `.chelp/advisor-log.md` in the project. In a site project keep that file in git;
  in the ECC repository itself it is git-ignored. It is how the playbook improves: a miss that recurs becomes a new habit in `skills/chelp-advisor/SKILL.md`.
- Make the work durable (written, committed) before you ask for the pre-ship review; a consultation can
  take a while.
- The advisor does not replace `/code-review` or `/santa-loop`. It checks that the chain's own claims are
  true: that the commands in the docs were run as written and the numbers in the report are honest.

## Arguments

$ARGUMENTS:

- `pre-build` or `pre-ship`: the checkpoint
- `c1` to `c5` or `studio-build`: the chain
- free text: what the work is
