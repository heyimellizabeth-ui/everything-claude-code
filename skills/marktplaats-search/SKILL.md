---
name: marktplaats-search
description: Use this skill to search Marktplaats (Dutch classifieds) for second-hand items within a radius of a Dutch postcode — e.g. washing machines and dryers near Alkmaar. Provides the category paths, the distance/postcode filter contract, and the firecrawl-based anti-bot fetch pattern.
origin: ECC
---

# Marktplaats Search — Location-Filtered Classifieds

Search [Marktplaats](https://www.marktplaats.nl) for second-hand goods within a radius of a Dutch
(or Belgian) postcode and return a clean, deduped table of listings. Built around the
**washing-machine + dryer near Alkmaar** use case, but the pattern generalizes to any category.

## When to Use

- Finding second-hand appliances (washing machines, dryers, fridges) near a town
- Any "what's for sale on Marktplaats within X km of postcode Y" request
- Comparison shopping across a category with price/location/distance context
- Whenever the `/marktplaats-search` command runs — this skill supplies its domain knowledge

## How It Works

### 1. Category paths

Marktplaats organizes appliances under **Witgoed en Apparatuur**. The relevant sub-categories:

| Item | Path segment |
|------|--------------|
| Washing machines | `/l/witgoed-en-apparatuur/wasmachines/` |
| Dryers | `/l/witgoed-en-apparatuur/wasdrogers/` |
| Combined keyword | `/l/witgoed-en-apparatuur/q/wasmachine+droger/` |

### 2. Distance + postcode filter contract

The website front-end filters by two query parameters that **must be used together**:

- `distanceMeters` — search radius in meters (`25000` = 25 km).
- `postcode` — the Dutch postcode the radius is centered on. A 4-digit area (e.g. `1811`,
  Alkmaar centrum) usually works; if rejected, use a full 6-character code such as `1811KL`.

Optional: `sortBy=SortIndex&sortOrder=increasing` for newest-first.

Example — washing machines within 25 km of Alkmaar:

```text
https://www.marktplaats.nl/l/witgoed-en-apparatuur/wasmachines/?distanceMeters=25000&postcode=1811
```

### 3. Fetching — use the firecrawl MCP (Marktplaats blocks plain bots)

Marktplaats returns **HTTP 403** to plain `WebFetch`/`curl`/Node `https` requests. Do **not** try to
scrape it with a bare GET. Instead use the **firecrawl MCP** — it handles anti-bot challenges and
JS rendering. ECC ships the firecrawl config in `mcp-configs/mcp-servers.json`; the user copies that
block into `~/.claude.json` and sets `FIRECRAWL_API_KEY` (no secret is committed to the repo).

Call `firecrawl_scrape` (or `firecrawl_extract`) on each category URL and extract per listing:
**title, price, town/location, distance, listing URL, posted date**.

**Fallbacks** (state explicitly when used): the **exa-web-search MCP** (also bundled), or the
official `api.marktplaats.nl` search endpoint (`categoryId`, `postCode`, `distance`) if credentialed.

### 4. Presenting results

One markdown table per category — `Title | Price | Town | Distance | Link` — deduped and sorted by
distance (or recency). Flag non-numeric prices like `Bieden` (open to offers), `Gereserveerd`
(reserved), or `Gratis` (free).

## Examples

**Washing machines + dryers near Alkmaar (defaults):**

```text
/marktplaats-search
```

→ builds:

```text
https://www.marktplaats.nl/l/witgoed-en-apparatuur/wasmachines/?distanceMeters=25000&postcode=1811
https://www.marktplaats.nl/l/witgoed-en-apparatuur/wasdrogers/?distanceMeters=25000&postcode=1811
```

**Wider radius, different town (Amsterdam, 50 km, washing machines only):**

```text
/marktplaats-search 50 1012 --items wasmachine
```

→ `https://www.marktplaats.nl/l/witgoed-en-apparatuur/wasmachines/?distanceMeters=50000&postcode=1012`

## Anti-Patterns

- **Don't** scrape Marktplaats with a plain `WebFetch`/`curl` GET — it returns 403.
- **Don't** use `distanceMeters` without `postcode` (the radius filter is ignored).
- **Don't** commit a `FIRECRAWL_API_KEY` — keep it in the user's local `~/.claude.json`.
- **Don't** invent listing prices/links when firecrawl is unavailable — say it's unavailable instead.

## Related Skills

- `browser-qa` — another MCP-delegating skill (browser automation) for JS-heavy pages.
