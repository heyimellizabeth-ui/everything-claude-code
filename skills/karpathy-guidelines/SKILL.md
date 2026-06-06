---
name: karpathy-guidelines
description: "Behavioral guidelines to reduce common LLM coding mistakes: Think Before Coding,
  Simplicity First, Surgical Changes, Goal-Driven Execution. Use before implementing, reviewing,
  or committing any non-trivial change."
origin: andrej-karpathy-skills
---

# Karpathy Guidelines

Four principles for LLM-assisted coding, derived from Andrej Karpathy's observations on
common LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## When to Use

- Before starting any non-trivial implementation
- When reviewing a diff or PR for quality
- Before committing — to verify the change is surgical and correct
- When a task description is ambiguous and needs clarification
- Run `/karpathy-review` to get a multi-model council verdict on any pending diff

## How It Works

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

**The test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan before starting:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

## Examples

### Think Before Coding — Surface Assumptions

**Request:** "Add a feature to export user data"

❌ Silently implements file export, picks JSON format, exports all users.

✅ Before coding:
```
Before implementing, I need to clarify:
1. Scope: Export all users or a filtered subset? (privacy implications)
2. Format: Download in browser, background job, or API endpoint?
3. Fields: Which fields? Some may be sensitive.
Simplest path: paginated JSON API endpoint. What's your preference?
```

### Simplicity First — Skip the Strategy Pattern

**Request:** "Add a function to calculate discount"

❌ Creates `DiscountStrategy` ABC, `PercentageDiscount`, `FixedDiscount`, `DiscountConfig`,
`DiscountCalculator` — 80+ lines for one calculation.

✅ One function:
```python
def calculate_discount(amount: float, percent: float) -> float:
    return amount * (percent / 100)
```

### Surgical Changes — Fix the Bug, Nothing Else

**Request:** "Fix the bug where empty emails crash the validator"

❌ Also adds type hints, rewrites email regex, adds username length validation, reformats docstring.

✅ Only changes the two lines that guard against empty email — matches existing style exactly.

### Goal-Driven Execution — Verifiable Steps

**Request:** "Add rate limiting to the API"

❌ Implements Redis-backed rate limiting with config system in one 300-line commit.

✅ Defines a 4-step plan, each with an explicit verify step:
```
1. Basic in-memory limiting on one endpoint
   Verify: 11th request in a row returns 429
2. Extract to middleware → apply to all routes
   Verify: existing tests still green
3. Add Redis backend
   Verify: limit persists across restarts
4. Add per-endpoint config
   Verify: /search allows 10/min, /users allows 100/min
```

## Self-Check

These guidelines are working when:
- Diffs are small and traceable
- Clarifying questions arrive before implementation, not after
- New code is 3–5x simpler than the first instinct
- Every task has an explicit "done" definition before work starts

## Related

- `/karpathy-review` — Submit pending diff to the LLM Council for multi-model Karpathy review
- `council` skill — Internal 4-voice decision council for ambiguous tradeoffs
- `tdd-workflow` skill — Test-driven implementation loop (complements Goal-Driven Execution)
