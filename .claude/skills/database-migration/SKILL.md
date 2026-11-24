---
name: database-migration
description: Use when making database schema changes that need migration files, schema updates and regenerated types.
---

# database-migration

Workflow skill for **database-migration** in `everything-claude-code`. Treat it as a scaffold, not a hard-coded script, and update it if the workflow changes materially.

## When to Use

Database schema changes with migration files.

Common files:

- `**/schema.*`
- `migrations/*`

## How It Works

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

Typical commit signals:

- Create migration file
- Update schema definitions
- Generate/update types

## Examples

Ask: "Add a `last_login` column to users" → add a migration under `migrations/`, update the schema definition, regenerate types, then run the relevant tests.
