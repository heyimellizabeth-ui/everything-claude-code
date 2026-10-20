---
description: RECC — turn reverse-engineering findings into a clean-room spec and a test-first implementation of an equivalent feature in this project.
argument-hint: "\"<feature name>\""
---

# RE Rebuild

**Input**: $ARGUMENTS

Follow the `re-feature-to-implementation` skill, phases 2 and 3.

## Steps

1. **Check inputs.** `.recc/findings.md` must exist and cover the feature. If not, run `/re-investigate` first.
2. **Spec.** Use the `re-reconstructor` agent to write `.recc/spec.md`: behaviors in its own words, each tagged with Evidence IDs or marked as an assumption. No decompiled code, proprietary strings, or target assets go into the project.
3. **Confirm.** Show the spec's behaviors table and open unknowns to the user and WAIT for confirmation before writing code.
4. **Build.** Plan with `/plan`, then implement test-first with the `tdd-workflow` skill (or the `tdd-guide` agent): one failing test per behavior id, then the implementation.
5. **Next.** Run `/re-verify` to check parity.
