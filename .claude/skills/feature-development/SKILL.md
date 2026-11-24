---
name: feature-development
description: Use for the standard feature workflow in everything-claude-code: implementation plus tests and docs, often touching manifests, schemas or API code.
---

# feature-development

Workflow skill for **feature-development** in `everything-claude-code`. Treat it as a scaffold, not a hard-coded script, and update it if the workflow changes materially.

## When to Use

Standard feature implementation workflow.

Common files:

- `manifests/*`
- `schemas/*`
- `**/*.test.*`
- `**/api/**`

## How It Works

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

Typical commit signals:

- Add feature implementation
- Add tests for feature
- Update documentation

## Examples

Ask: "Add a new install manifest field" → update `manifests/` and `schemas/`, add or extend `*.test.*` coverage, update docs, then run `node tests/run-all.js`.
