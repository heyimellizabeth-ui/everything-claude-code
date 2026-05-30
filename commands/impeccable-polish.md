---
description: Apply the frontend design review checklist to the current UI. Fixes issues without redesigning — improves what exists rather than replacing it.
---

# Impeccable Polish

Invoke the `polish` mode of the `frontend-design-direction` skill. Apply the
full review checklist to the current UI and fix every failing item. Do not
redesign; do not change the information architecture; only improve the execution.

## What Gets Polished

- First viewport communicates the product or workflow immediately
- Visual hierarchy supports scanning and repeated use
- Typography fits containers; nothing overflows or overlaps
- Color contrast meets accessibility minimums (4.5:1 body, 3:1 large text)
- Body and placeholder text is not muted gray on tinted near-white
- Icons used for familiar tool actions instead of text labels
- Responsive layout is stable: no shifting on hover or resize
- Visual assets carry subject matter instead of acting as filler
- Motion clarifies state and does not mask sluggishness

## Usage

```
/impeccable-polish
/impeccable-polish <component or file>
```

Polish is non-destructive. If a fix would require a structural change, flag it
as a recommendation rather than applying it silently.

## See Also

- `/impeccable-audit` — scan and report without fixing
- `/impeccable-critique` — adversarial review of the design's strategic choices
