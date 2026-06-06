---
description: Review pending git diff against the 4 Karpathy principles using the LLM Council (multi-model deliberation). Falls back to local review if the council is not running.
argument-hint: [--staged | --local | blank for auto]
---

# Karpathy Review

Submit the current code change to the LLM Council for evaluation against the 4 Andrej Karpathy
behavioral guidelines. Returns a principle-by-principle PASS/FAIL verdict with multi-model
consensus and chairman synthesis.

**Input**: $ARGUMENTS

---

## Phase 1 — GATHER

Collect the diff to review:

```bash
# If --staged: review staged changes only
git diff --cached

# If --local or blank: review all uncommitted changes
git diff HEAD
```

If the diff is empty, stop: "Nothing to review — no uncommitted or staged changes."

Trim the diff to 4000 lines maximum. If longer, warn: "Diff is large — showing first 4000 lines."

---

## Phase 2 — CHECK COUNCIL

Run:

```bash
node scripts/lib/council-client.js --check
```

If exit code is 0: council is running → use **Council Review Mode**.
If exit code is non-zero: council is unreachable → use **Local Review Mode**.

---

## Phase 3A — Council Review Mode

Run the review via the council client:

```bash
node scripts/lib/council-client.js --review "$(git diff HEAD)"
```

The script will:
1. Create a council conversation
2. Send the diff with the Karpathy evaluation prompt
3. Return the full 3-stage JSON result

Parse and display:

**Stage 1 — Individual Model Verdicts**
For each of the 4 council models, show:
```
Model: [name]
1. Think Before Coding: PASS | FAIL — [reason]
2. Simplicity First:    PASS | FAIL — [reason]
3. Surgical Changes:    PASS | FAIL — [reason]
4. Goal-Driven Exec.:   PASS | FAIL — [reason]
Overall: PASS | NEEDS WORK
```

**Stage 2 — Peer Rankings**
Show aggregate ranking: which model gave the most thorough review.

**Stage 3 — Chairman Synthesis**
Show the final synthesized verdict. Highlight any principles flagged as FAIL.

---

## Phase 3B — Local Review Mode

Warn: "LLM Council not running at localhost:8001 — running local review."

Apply the 4 principles directly as a single-model review:

**Karpathy Principles Checklist:**

For each principle, evaluate the diff:

**1. Think Before Coding**
- Are there any changes that implement features not explicitly requested?
- Does the implementation make silent assumptions about format, scope, or fields?
- Would the right response have been to ask a question instead of coding?

**2. Simplicity First**
- Are there abstractions, classes, or interfaces that only have one implementation?
- Are there configuration options, flags, or extension points not requested?
- Could the same result be achieved in significantly fewer lines?
- Is there error handling for scenarios that cannot realistically occur?

**3. Surgical Changes**
- Do any changed lines touch code unrelated to the task?
- Has existing style, formatting, or naming been changed without being asked to?
- Were imports, variables, or functions removed that the task didn't create?
- Were comments or docstrings rewritten beyond what the change required?

**4. Goal-Driven Execution**
- Are tests present that verify the specific behavior requested?
- If this is a bug fix: is there a test that first reproduces the bug?
- If this is a multi-step change: was a verifiable plan defined before implementation?

Output:
```
=== Karpathy Review (Local — Council Not Running) ===

1. Think Before Coding: PASS | FAIL
   [specific evidence from the diff]

2. Simplicity First: PASS | FAIL
   [specific evidence from the diff]

3. Surgical Changes: PASS | FAIL
   [specific evidence from the diff]

4. Goal-Driven Execution: PASS | FAIL
   [specific evidence from the diff]

Overall: PASS | NEEDS WORK
[Summary of most important issues]
```

---

## Phase 4 — REPORT

Save the review to `.claude/reviews/karpathy-<YYYY-MM-DD>.md`:

```markdown
# Karpathy Review — <date>

**Mode**: Council (4 models) | Local
**Diff size**: <N> lines changed

## Verdict

| Principle | Result |
|---|---|
| Think Before Coding | PASS / FAIL |
| Simplicity First | PASS / FAIL |
| Surgical Changes | PASS / FAIL |
| Goal-Driven Execution | PASS / FAIL |

**Overall**: PASS | NEEDS WORK

## Council Stage 1 — Model Verdicts
<stage 1 output if council mode>

## Council Stage 2 — Peer Rankings
<stage 2 output if council mode>

## Council Stage 3 — Chairman Synthesis
<stage 3 output if council mode>

## Local Review
<local review output if local mode>
```

---

## Edge Cases

- **Empty diff**: Stop with "Nothing to review."
- **Council timeout**: Fall back to local review after 30 seconds.
- **Diff > 4000 lines**: Truncate with warning; suggest reviewing in smaller chunks.
- **No `.claude/reviews/` directory**: Create it silently before writing the artifact.
