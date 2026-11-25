---
description: Turn a client brand brief (Markdown) into a brand-config.json that /studio-build can scaffold
argument-hint: "[path/to/Brand brief.md] [--out path/to/brand-config.json]"
---

# /brief-to-brand — Brand Brief to Studio Config

Bridges the lead pipeline and the site pipeline. A brand brief (for example
`Clients/<Business>/Brand brief.md` in an Obsidian vault, written by a brief-writing agent or by hand)
becomes a `brand-config.json` in the format the Design Studio produces, so `/studio-build` can scaffold
a preview without re-entering anything in the Studio.

## When to Use

- A lead has a brief and needs a homepage preview for a pitch
- Rebuilding a preview after the brief changed
- Any time you would otherwise copy brief values into the Design Studio by hand

## Steps

### 1 — Read the brief

Use the path argument, or ask for it. Read the whole file. Briefs are free-form Markdown, so map by
meaning, not by exact heading. Typical content: business name, type, address and city, what they
offer, audience, tone, colours, fonts, existing links (website, Instagram, Facebook, booking),
reviews, and the problem the pitch addresses.

### 2 — Map to brand-config.json

Follow the format in `projects/design-studio/USAGE.md` ("brand-config.json Format"). The template was
built for venues, so set these for a non-venue business:

| Config key | From the brief |
|------------|----------------|
| `site.name`, `site.short` | Business name; `short` is a 3-8 character uppercase wordmark |
| `site.domain` | Their domain, or a placeholder `<slug>.nl` marked as a guess in the report |
| `site.tagline`, `site.description` | Offer and tone, in the brief's language, under 160 characters for `description` |
| `site.lang`, `site.locale` | Language of the business's audience (`nl` / `nl_NL` for Dutch clients) |
| `site.estYear` | Founding year if the brief states it; otherwise empty |
| `site.bpm` | Empty string (venue-only field) |
| `colors.*` | Brief palette mapped to `void` (darkest), `surface`, `cream` (text on dark), `accent`, `muted` |
| `fonts.heading`, `fonts.body` | Brief fonts if they are Google Fonts; otherwise a close Google Fonts pairing |
| `venue.name`, `venue.city`, `venue.region`, `venue.country` | The business's own address |
| `social.*` | Only links that appear in the brief |
| `ticketUrl` | Booking or appointment link if any, else empty |
| `reviews[]` | Only reviews quoted in the brief, with author and rating as given |

Sections and modules for a non-venue business (salon, café, trade, studio):

- `sections.events`, `sections.next-event`, `sections.footer-bpm`: `false`
- `sections.gallery`: `true` only if the brief lists photos or an Instagram feed
- `modules.calendar.enabled`: `false`
- `modules.newsletter.enabled` and `sections.newsletter`: `false` unless the brief asks for one
- `forms.backend`: `"formspree"` with empty keys, so `/studio-build` reports them as a manual slot

If the brief has no palette, run the ui-ux-pro-max colour lookup for the business type
(`search.py "<business type>" --domain color`) and say in the report that the colours were chosen, not
given.

### 3 — Never invent facts

Leave a value empty rather than guess an address, opening hours, a review, a price or a social handle.
Every empty or guessed value goes in the report.

### 4 — Write and validate

Write the file to `--out`, or next to the brief as `brand-config.json`. Check that `site.name`,
`site.short`, `colors` and `venue` are present (the minimum `/studio-build` validates) and that it
parses as JSON:

```bash
node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <out-path>
```

### 5 — Report and hand off

Tell the user the output path, which values came from the brief, which were chosen (colours, fonts,
wordmark) and which are empty. Then offer:

> Run `/studio-build <out-path>` to scaffold the preview. It ends with `/design-gate`, so the preview
> gets the same Hallmark check as a client site.

## Usage Examples

```
/brief-to-brand "Clients/Kapsalon Oudorp/Brand brief.md"
/brief-to-brand "Clients/Café de Tuin Alkmaar/Brand brief.md" --out projects/cafe-de-tuin/brand-config.json
```
