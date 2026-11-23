---
name: add-language-rules
description: Use when adding a new programming language to the ECC rules system (coding style, hooks, patterns, security and testing rules under rules/<language>/).
---

# add-language-rules

Workflow skill for **add-language-rules** in `everything-claude-code`. Treat it as a scaffold, not a hard-coded script, and update it if the workflow changes materially.

## When to Use

Adds a new programming language to the rules system, including coding style, hooks, patterns, security, and testing guidelines.

Common files:

- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`

## How It Works

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

Typical commit signals:

- Create a new directory under rules/{language}/
- Add coding-style.md, hooks.md, patterns.md, security.md, and testing.md files with language-specific content
- Optionally reference or link to related skills

## Examples

Ask: "Add Go rules" → create `rules/go/` with `coding-style.md`, `hooks.md`, `patterns.md`, `security.md` and `testing.md`, link related skills, then run markdownlint and the test suite.
