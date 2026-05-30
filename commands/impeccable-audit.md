---
description: Scan the current UI for frontend design anti-patterns. Reports concrete failures in typography, color contrast, layout, and generated-UI defaults.
---

# Impeccable Audit

Invoke the `audit` mode of the `frontend-design-direction` skill against the
current UI files. Report every anti-pattern with a specific location and a
one-line fix.

## What Gets Checked

- **Contrast**: body text ≥4.5:1, large text ≥3:1, placeholder text ≥4.5:1
- **Color failures**: muted gray on tinted near-white; neutral gray on colored background
- **Generated-UI defaults**: purple-to-blue gradients, decorative blobs, oversized cards,
  cards-in-cards, vague hero copy, hiding the product behind marketing sections
- **Typography**: oversized hero text, overflow, poor fit on mobile
- **Motion**: decorative animation with no state-clarification purpose
- **Layout**: unstable dimensions that shift on hover or resize

## Usage

```
/impeccable-audit
/impeccable-audit <file or component>
```

## Output Format

For each failure found:

```
[FILE:LINE] Anti-pattern: <name>
Issue: <one sentence describing the specific problem>
Fix: <one sentence describing the minimum change>
```

Finish with a count: `N issues found across M files.`

If no issues are found, say so explicitly — do not invent problems.

## See Also

- `/impeccable-polish` — apply the review checklist and fix issues
- `/impeccable-critique` — broader adversarial design review
- `pbakaus/impeccable` (external) — `npx impeccable detect` for automated CLI detection
