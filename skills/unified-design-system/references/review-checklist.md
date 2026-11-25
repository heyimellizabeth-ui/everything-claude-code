# Review gate

## Must (fix before done)

- Text contrast meets WCAG 2.2 AA (4.5:1 body, 3:1 large text and UI parts).
- Every interactive element has visible focus, hover and disabled states.
- Touch targets are at least 44 by 44px on touch layouts.
- Respects `prefers-reduced-motion`.
- No raw colour, size or shadow values in components; tokens only.
- Light and dark mode are both complete if the project supports both.
- Layout holds at 360px wide and at desktop width, with no horizontal scroll
  and no text overflow.
- Loading, empty and error states exist for anything that fetches data.
- The first screen shows the actual product, tool or content.

## Should (fix or explain)

- One clear type hierarchy (display, heading, body, caption) used everywhere.
- Spacing follows one scale (for example 4/8/12/16/24/32/48).
- Similar elements look the same across pages.
- Motion clarifies state changes rather than decorating.
- Images and assets carry real subject matter, not filler.

## AI-slop check (any hit is a "should")

- Purple-to-blue gradients or glowing blobs by default.
- Centred hero text over a dark mesh background.
- Three identical feature cards in a row.
- Glassmorphism on everything.
- Cards nested inside cards.
- Inter or system sans with slate-900 and no other typographic choice.
- UI text that describes features the controls already show.
