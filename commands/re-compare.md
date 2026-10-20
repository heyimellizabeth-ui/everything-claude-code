---
description: RECC — compare two versions of a shipped application or artifact with REA and explain what changed in behavior, with evidence.
argument-hint: "<old-path> <new-path> [\"<focus>\"]"
---

# RE Compare

**Input**: $ARGUMENTS

## Steps

1. Create `.recc/` if missing, and confirm REA tools are available (otherwise `/re-doctor`).
2. Record scope in `.recc/plan.md` with the `re-scope-and-legality` skill (both artifacts, purpose, focus area).
3. Start from REA's guided prompt `compare_application_versions` with both paths. Follow its suggested route, skipping steps that do not serve the focus:
   - `mcp__rea__compare_artifacts` for an overall diff of the two artifacts
   - `mcp__rea__find_changed_behavior` to rank changes by behavioral impact
   - `mcp__rea__compare_functions` for specific native functions of interest
   - `mcp__rea__compare_javascript_export_shapes` for JavaScript/Electron bundles
4. Write `.recc/compare.md`:

```markdown
# <app>: <old version> → <new version>
## Summary (3–5 bullets)
## Behavior changes
| change | where | evidence | confidence |
## Security-relevant changes
## Unchanged areas checked
## Unknowns
```

5. If the focus is a security update, hand off to the `re-security-analyst` agent to judge whether the fix is complete.
