# Council Verdict — Brasa y Mar (Paella Restaurant Site)

The live `llm-council` backend (`/home/user/llm-council`) was **not** used: it requires an
`OPENROUTER_API_KEY` (unset here) and spends tokens. Following the precedent set in
everything-claude-code **PR #28**, the deliberation was run with the ECC `/council` skill —
four advisor voices launched as fresh, context-isolated subagents (anti-anchoring), then
synthesized by the in-context Architect voice.

## Question put to the council

> Review the plan for a multi-page Spanish paella restaurant website (static HTML + one
> `form-handler.php`, uploaded to Hostinger shared hosting), with GSAP scroll animations,
> a warm terracotta/saffron palette, **CSS gradient art instead of photos**, and a PHP
> reservation form. What's wrong with it, and what must change before building?

## Voices

### Skeptic — *challenge the premise*
- A **photo-free gallery is a category error** for a food business: appetite sells; gradient
  tiles are abstract art, not paella.
- 6 pages + process docs risks **scope creep**; a restaurant really needs Home / Menu /
  Reservations / Contact.
- GSAP reveal/grain/parallax is **nightclub energy**, not the warmth a restaurant wants.
- **Top change:** use real food photos; consider trimming animation and page count.

### Pragmatist — *will it work when a non-technical owner uploads it?*
- `PHP mail()` on shared hosting often lands in spam without a domain `From:`.
- The **hardcoded CORS origin lock is a footgun**: forget to edit it → every reservation 403s.
- Placeholder email/domain **will ship broken** without a setup checklist.
- **Top change:** remove the hard CORS 403; make the form resilient; pre-fill a real recipient.

### Critic — *failure modes & edge cases*
- **Scroll-invisibility trap (highest):** elements at `opacity:0` must force-reveal if the GSAP
  CDN fails or JS is disabled — otherwise the site is silently blank.
- **Rate-limit temp file (highest):** temp dirs get wiped / shared / race on cheap hosting; a
  write failure must **not** block real submissions.
- Terracotta/saffron small text on cream **fails WCAG AA**; parallax is a vestibular trigger.
- JSON-LD with a **placeholder address poisons local SEO**.
- A gallery with zero photos **reads as unfinished**.

### Architect — *synthesis (in-context voice)*
The user made two explicit, binding choices: **multi-page** and **CSS-art (no photos)**. Those
stand. But every operational risk the council raised is real and cheap to fix, so all of them
were adopted.

## Decisions adopted into the build

| # | Concern | Resolution |
|---|---------|------------|
| 1 | Scroll-invisibility on CDN/JS failure | `<noscript>` rule + JS watchdog timeout force all `.reveal` elements to visible; reveals are an *enhancement*, never a gate. Verified with GSAP blocked. |
| 2 | CORS 403 footgun | Origin check **fails open** — logs a soft note, never blocks a same-host POST or a missing Origin. |
| 3 | Rate-limit file fragility | Wrapped in try/catch; **any** filesystem error fails open (allows the send). Best-effort throttle only. |
| 4 | `mail()` deliverability | `From:` set to `no-reply@<domain>`, `Reply-To:` the guest; recipient defaults to the owner's real email, documented in `DEPLOY.md`. |
| 5 | Contrast | Body copy uses `--ink` (dark brown) on `--cream` (AA+). Terracotta/saffron reserved for large headings / accents. |
| 6 | SEO placeholders | Minimal `Restaurant` JSON-LD, **no fake street address**; single edit point flagged in `DEPLOY.md`. |
| 7 | Photo-free gallery reads as broken | Honored the user's CSS-art choice but reframed the page as a deliberate **illustrated "Flavours"** wall with captions; `DEPLOY.md` documents a one-step swap to real photos. |

**Dissent on record:** Skeptic and Critic would both ship real food photos. The user chose
CSS-art only; that choice is respected, with an easy upgrade path left in place.
