---
name: re-feature-to-implementation
description: End-to-end RECC workflow for "see a feature in an app, understand how it works, and build an equivalent in my project". Chains re-planner, REA investigation, a clean-room spec, ECC test-driven implementation, and parity verification.
origin: RECC
---

# Feature to Implementation (RECC)

## When to Use

- "How does <app> do <feature>? Build something similar for my project."
- Porting behavior from a legacy binary whose source is lost
- Understanding a competitor-style UX pattern well enough to design your own version
- Recovering the behavior of an internal tool before rewriting it

## How It Works

```text
/re-investigate ─> re-planner ─> re-investigator ─> .recc/findings.md
                                                        │
/re-rebuild ──────> re-reconstructor ─> .recc/spec.md ─> /plan ─> TDD
                                                        │
/re-verify ───────> re-parity-verifier ─> .recc/parity.md ─> /code-review
```

### Phase 1: Investigate (REA)

1. `re-planner` records scope, target type, provider, and 3 to 5 falsifiable questions in `.recc/plan.md`.
2. `re-investigator` answers them with REA. For feature questions, REA's guided prompt `investigate_feature` gives a good first route; JavaScript/Electron targets go straight to `mcp__rea__analyze_javascript_application` and `mcp__rea__trace_application_feature`, while native targets start from `mcp__rea__open_binary` and `mcp__rea__trace_feature`.
3. Findings follow the `re-evidence-discipline` skill.

**Gate:** every question is answered with Evidence or listed as an unknown with impact.

### Phase 2: Specify (clean room)

`re-reconstructor` writes `.recc/spec.md`: behaviors in its own words, each tagged with an Evidence ID or marked as an assumption. No decompiled code or target assets enter the user's project.

**Gate:** the user reviews the spec. This is the cheapest point to change direction.

### Phase 3: Build (ECC)

Use ECC's normal engineering loop on the user's codebase:

- `/plan` for phases and files
- The `tdd-workflow` skill (or `tdd-guide` agent): one failing test per behavior id, then the code
- Project rules and coding standards apply as for any other feature

### Phase 4: Verify parity

`re-parity-verifier` maps tests and REA comparisons to behavior ids and writes `.recc/parity.md` with a verdict of PARITY, PARTIAL, or NOT YET. Finish with `/code-review` on the diff.

### Cost control

- Static JavaScript/Electron analysis needs no native engine and is the fastest path; prefer it when the feature lives in JS.
- Ask REA for summaries and use paging before requesting full detail.
- Keep each investigation round to the questions in the plan; start a new round rather than drifting.

## Examples

```text
/re-investigate /Applications/Notes.app "How does search rank results?"
# review .recc/findings.md
/re-rebuild "search ranking"
# review .recc/spec.md, then the test-first build runs
/re-verify
```

For an Electron app:

```text
/re-investigate ~/Downloads/SomeApp/resources/app.asar "How does offline sync queue edits?"
```
