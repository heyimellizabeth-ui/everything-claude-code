---
description: RECC — verify that a reconstructed feature matches the behavior observed in the original target, and write a parity report.
argument-hint: "[\"<feature name>\"]"
---

# RE Verify

**Input**: $ARGUMENTS

## Steps

1. Confirm `.recc/spec.md` exists (otherwise run `/re-rebuild` first).
2. Use the `re-parity-verifier` agent. It runs the project's tests, maps them to behavior ids, uses REA's `mcp__rea__verify_reconstruction` / `mcp__rea__evaluate_reconstruction_coverage` and comparison tools where they apply, and writes `.recc/parity.md`.
3. Report the verdict (PARITY, PARTIAL, or NOT YET) with the divergent and unverified behaviors.
4. For PARTIAL or NOT YET, propose the smallest next step for each gap: add a test, fix the implementation, or investigate the original again with `/re-investigate`.
5. When the verdict is PARITY, run `/code-review` on the change.
