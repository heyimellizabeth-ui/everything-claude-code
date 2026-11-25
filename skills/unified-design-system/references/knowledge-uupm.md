# Knowledge layer: ui-ux-pro-max

The skill calls ui-ux-pro-max (uupm) as a search library, not as a workflow.
Its data is a set of CSV files searched by a Python script. Use it to get
candidates, then decide yourself. Do not follow uupm's own SKILL.md steps,
because its Step 1 is hard-coded to React Native. [uupm]

## Where search.py lives

Check in this order and use the first that exists:

1. Installed in the project: `.claude/skills/ui-ux-pro-max/scripts/search.py`
2. Installed for the user: `~/.claude/skills/ui-ux-pro-max/scripts/search.py`
3. Source repo: `<repo>/src/ui-ux-pro-max/scripts/search.py`

```bash
UUPM=~/.claude/skills/ui-ux-pro-max/scripts/search.py
python3 "$UUPM" "saas analytics dashboard" --domain product -n 3
```

Needs Python 3 and nothing else. No network. Runs from any directory. [uupm]

If it is not installed, say so in one line ("ui-ux-pro-max not found, picking
from presets.md by hand") and continue with the presets. Never block on it.
[uupm]

## Commands per step

Always pass `--domain` or `--stack`. Without a domain, uupm guesses by keyword
and falls back to `style`. [uupm]

### Step 2: product and style candidates

```bash
python3 "$UUPM" "<product type> <industry> <audience>" --domain product -n 3
python3 "$UUPM" "<style name from the hit>" --domain style -n 1
```

`product` returns product type, primary and secondary style, landing pattern,
dashboard style and palette focus. `style` returns keywords, effects, best-for
and do-not-use-for. Pick the closest product type by eye, not the first hit.
Feed the result into the one-line design read. [uupm]

### Step 3: palette, typography and the combined recommendation

```bash
python3 "$UUPM" "<product> <industry> <tone>" --design-system -p "<Project>" -f markdown
python3 "$UUPM" "<product type>" --domain color -n 3
python3 "$UUPM" "<mood words>" --domain typography -n 3
python3 "$UUPM" "<traits>" --domain google-fonts -n 5
```

`--design-system` joins product, style, colour, landing, typography and
anti-patterns into one block. In this mode `-n` is ignored. `--domain color`
adds Card and Muted Foreground, which the MASTER.md output drops. Use
`typography` for curated pairs with an import line and `google-fonts` for
single families with a popularity rank. Everything returned is a candidate.
The preset from `presets.md` decides. [uupm]

### Step 5: stack guidelines

```bash
python3 "$UUPM" "<topic>" --stack <stack> -n 5
```

Stacks: react, nextjs, vue, svelte, astro, html-tailwind, shadcn, swiftui,
react-native, flutter, jetpack-compose, nuxtjs, nuxt-ui, threejs, angular,
laravel. Skip this for Astryx projects, because `astryx component <Name>`
answers those questions. Use it for html-tailwind, vue, svelte and swiftui.
Add `--json` if you need to parse the output. [uupm]

### Step 6: ux rules for the review

```bash
python3 "$UUPM" "animation accessibility z-index loading" --domain ux -n 5
```

Rows carry a severity. Merge them into the review gate and fix every High.
Other build-time needs: `--domain chart "<data type>"`, `--domain landing
"hero social-proof"`, `--domain icons "<need>"`. One domain per need. [uupm]

Do not use `--domain web`. It holds iOS and Android rules, not web rules.
[uupm]

## Persist: the path fix

`--persist` writes `design-system/<project-slug>/MASTER.md` and, with
`--page`, `pages/<page>.md`. That is not the path step 1 reads, and uupm's own
docs claim the wrong location. Without `-o` it writes into the current
directory. [uupm]

Always run it into a scratch folder, then map the output by hand:

```bash
TMP=$(mktemp -d)
python3 "$UUPM" "<query>" --design-system --persist -p "<Project>" \
  --page "<page>" -o "$TMP"
ls -R "$TMP/design-system"
```

1. Read `$TMP/design-system/<slug>/MASTER.md` (the folder name may not match
   the confirmation text, so trust the listing).
2. Write the result to `design-system/MASTER.md` in the project using
   `design-md-template.md`, with the mapping below and the gaps filled.
3. Write page overrides to `design-system/pages/<page>.md`, listing only what
   differs from MASTER.md.
4. Delete `$TMP`. Never leave a `design-system/<slug>/` folder in the project.

Decision 7: only `design-system/MASTER.md` and `design-system/pages/<page>.md`
exist. No root `DESIGN.md`, because Hallmark treats `DESIGN.md` as its project
marker. [uupm] [hallmark]

## Field mapping: uupm MASTER.md to our template

| Our section | uupm source | Gap we fill |
|---|---|---|
| 1 Design read | Category, Style name, Page Pattern | Preset, dials and the read line. Map style to preset: Minimalism, Swiss, Editorial Grid to minimal; Neubrutalism, Brutalism to brutalist; Soft UI, Claymorphism to soft; Data-Dense, Executive and Real-Time dashboards to product-tool; Accessible and Ethical, Inclusive to trust-first |
| 2 --color-bg | Background | Dark value |
| 2 --color-surface | not in MASTER.md (Card is in colors.csv) | Surface, both modes |
| 2 --color-text | Foreground | Dark value |
| 2 --color-text-muted | not in MASTER.md (its Muted is a fill; Muted Foreground is in colors.csv) | Muted text, both modes, 4.5:1 |
| 2 --color-accent | Primary, Accent/CTA (pick one) | Dark value; On Primary text colour |
| 2 --color-border | Border | Dark value, 3:1 where it marks a control edge |
| 2 extra roles | Secondary, Destructive, Ring | Add rows only if the design uses them |
| 3 Typography | Heading Font, Body Font, Mood, import link | Mono font, size scale, line heights, weights |
| 4 Spacing | Spacing Variables (fixed 4 to 64px) | Constants, not chosen by style. Keep or replace |
| 4 Radius | none (8, 12, 16px hard-coded in components) | Radius tokens chosen by preset |
| 4 Shadow | Shadow Depths (fixed sm to xl) | Choose by preset, one edge language per surface |
| 5 Components | Component Specs as CSS | Drop the CSS (raw hex and px). Keep the intent. Add library field |
| 6 Motion | Key Effects (free text) | Duration and easing tokens, reduced-motion rule |
| 7 Never do | Anti-Patterns plus the fixed forbidden list | Keep as is, add project items |
| none | Pre-Delivery Checklist | Goes to the review gate, not MASTER.md |

Also remove uupm's hover lift (`translateY(-1px)` on buttons and cards). It
shifts layout and breaks uupm's own stable-state rule. Use a colour or shadow
change on hover. [uupm]

Summary of gaps we must fill ourselves: dark mode column, surface, muted
text, radius, mono font, motion. uupm output is light mode only. [uupm]

## Retrieval caveats

- Search is BM25 keyword matching. It scores words, not meaning. Treat every
  result as a candidate list. [uupm]
- Query with product-type and industry words ("fintech dashboard", "kids
  education app"), not vibe words ("sleek", "futuristic", "cool"). Vibe words
  match the wrong rows. Example: "club nightlife" returned a sports team
  palette. If the first query misses, retry with a plainer product noun. [uupm]
- A typography result of Inter for both heading and body is the script's
  default, which means no match. Do not accept it. Re-run `--domain typography`
  or `google-fonts` with two or three mood words. Decision 4: Inter is never a
  default. It is fine when the user asks, for trust-first or product-tool
  work, or when Astryx sets the type. [uupm] [taste-skill]
- Check what a font row loads against what it names. One pairing names Clash
  Display and Satoshi but imports Outfit and Rubik. [uupm]
- A generated note like "Accent adjusted for WCAG 3:1" means the accent may
  still fail 4.5:1 as text. Measure it. [uupm]
- uupm recommends glassmorphism, aurora and neon for many categories. Allow
  at most one such effect on a page. [uupm] [taste-skill]
- Do not hard-code counts of styles, pairings or stacks anywhere. The README
  numbers are stale. [uupm]
