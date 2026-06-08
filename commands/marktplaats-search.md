---
description: Search Marktplaats for washing machines and dryers near Alkmaar (configurable postcode/radius) using the firecrawl MCP.
argument-hint: [radius-km | postcode | --items "wasmachine,droger"]
---

# Marktplaats Appliance Search

Find washing machines and dryers for sale on [Marktplaats](https://www.marktplaats.nl) within a
radius of a Dutch postcode. Defaults target **Alkmaar (postcode 1811), 25 km radius, washing
machines + dryers**.

**Input**: `$ARGUMENTS`

This command pairs with the `marktplaats-search` skill, which holds the category paths, the
distance/postcode filter contract, and the anti-bot guidance. Activate that skill before running.

## Step 1: Parse Arguments

All arguments are optional. Apply these defaults when not supplied:

| Argument | Default | Notes |
|----------|---------|-------|
| radius (km) | `25` | Converted to meters for the URL (`25` → `distanceMeters=25000`). |
| postcode | `1811` | Alkmaar centrum. Use a full code (e.g. `1811KL`) if the 4-digit area is rejected. |
| `--items` | `wasmachine,droger` | Which categories to search. `wasmachine` → washing machines, `droger` → dryers. |

## Step 2: Build Search URLs

Marktplaats filters by `distanceMeters` (radius in meters) **combined with** `postcode`. Build one
URL per requested item using the category paths:

- **Washing machines** (`wasmachine`):
  `https://www.marktplaats.nl/l/witgoed-en-apparatuur/wasmachines/?distanceMeters=<METERS>&postcode=<POSTCODE>`
- **Dryers** (`droger`):
  `https://www.marktplaats.nl/l/witgoed-en-apparatuur/wasdrogers/?distanceMeters=<METERS>&postcode=<POSTCODE>`

Default Alkmaar example:

```text
https://www.marktplaats.nl/l/witgoed-en-apparatuur/wasmachines/?distanceMeters=25000&postcode=1811
https://www.marktplaats.nl/l/witgoed-en-apparatuur/wasdrogers/?distanceMeters=25000&postcode=1811
```

Optional: append `&sortBy=SortIndex&sortOrder=increasing` for newest-first.

## Step 3: Fetch via the firecrawl MCP

Marktplaats actively blocks plain bots — a direct `WebFetch`/`curl` GET returns **HTTP 403**.
Use the **firecrawl MCP** (anti-bot + JS rendering), which ECC already ships in
`mcp-configs/mcp-servers.json`.

For each URL, call `firecrawl_scrape` (or `firecrawl_extract`) and pull these fields per listing:

- **title**
- **price** (note "Bieden"/"Gereserveerd"/"Gratis" where shown)
- **town / location**
- **distance** from the postcode
- **listing URL**
- **posted date** (where available)

## Step 4: Fallback (only if firecrawl is unavailable)

If the firecrawl MCP is not connected or has no `FIRECRAWL_API_KEY`, **say so explicitly** — do not
silently fall back to a plain GET (it 403s). Then either:

1. Use the **exa-web-search MCP** (also in `mcp-configs/mcp-servers.json`) to surface listings, or
2. Use the official `api.marktplaats.nl` search endpoint (`categoryId`, `postCode`, `distance`)
   if credentials are configured.

## Step 5: Present Results

Output one compact table per category, deduped, sorted by distance (or recency if `sortBy` used):

```text
### Washing machines — within 25 km of Alkmaar (1811)
| Title | Price | Town | Distance | Link |
|-------|-------|------|----------|------|

### Dryers — within 25 km of Alkmaar (1811)
| Title | Price | Town | Distance | Link |
|-------|-------|------|----------|------|
```

Close with a one-line summary (counts, lowest/typical price band) and the exact search URLs used so
the user can open them directly.
