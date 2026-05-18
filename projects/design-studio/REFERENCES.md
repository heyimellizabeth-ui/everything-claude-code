# Design Studio — Reference Libraries

Curated list of the most useful 2026 React UI/UX repos to browse for inspiration
alongside your selection of cataloged elements.

The companion script `scripts/studio/setup-ui-libs.sh` clones the buildable ones
into `~/dev/_ref/ui-libs/` (configurable via `UI_LIBS_ROOT`). Idempotent — safe
to re-run to pull updates. Defaults to shallow clones (~500MB total).

```bash
# First-time setup
./scripts/studio/setup-ui-libs.sh

# Custom location
UI_LIBS_ROOT=~/code/ref ./scripts/studio/setup-ui-libs.sh

# Full git history (~3-5GB)
CLONE_DEPTH=0 ./scripts/studio/setup-ui-libs.sh
```

After the script runs, the generated `INDEX.md` inside `~/dev/_ref/ui-libs/`
serves as the live map of what's installed.

---

## 🏛️ Foundation

| Repo | Why |
|------|-----|
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | The baseline. Radix UI + Tailwind. De facto React standard in 2026. |
| [origin-space/originui](https://github.com/origin-space/originui) | 400+ copy-paste components extending shadcn. Fills the gaps. |

## ✨ Animation & Effects

| Repo | Why |
|------|-----|
| [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) | 110+ animated components. Best-in-class text effects + backgrounds. |
| [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | 150+ Framer Motion components. Linear/Vercel-style polish. |
| [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) | Accessible, composable motion. Lighter alternative. |

## 🔨 Distinctive / Brutalist

| Repo | Why |
|------|-----|
| [ekmas/neobrutalism-components](https://github.com/ekmas/neobrutalism-components) | Bold borders, hard shadows, vibrant palette. Club KUDT territory. |
| [dev-snake/brutalist-ui](https://github.com/dev-snake/brutalist-ui) | 26+ neo-brutalist components on Radix primitives. Fully a11y. |

## 🎮 3D / R3F

| Repo | Why |
|------|-----|
| [pmndrs/react-three-next](https://github.com/pmndrs/react-three-next) | Official pmndrs Next.js + R3F starter. |
| [pmndrs/drei](https://github.com/pmndrs/drei) | R3F helpers ecosystem. Camera controls, HDRIs, materials. |

## 📚 Curation / Meta

| Repo | Why |
|------|-----|
| [birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) | The meta-list. 650+ shadcn-compatible registries and tools. |

---

## 🔖 Bookmarks (browse-only, not cloned)

Docs-site distributed or paywalled — read on the web, copy as needed:

- **[Aceternity UI](https://ui.aceternity.com)** — 200+ free dramatic effects; All-Access Pass for premium
- **[Tailwind Plus](https://tailwindcss.com/plus)** — premium blocks from the Tailwind team
- **[Untitled UI](https://www.untitledui.com)** — React + Figma kit
- **[shadcn registries](https://ui.shadcn.com/docs/registry)** — registry directory

---

## How the references plug into the Studio

The Design Studio catalog is built from **your own sites** (Club KUDT, Ashley,
FoodKing). The reference libraries above complement that:

- **When scaffolding a new site**, browse a library to find a polished
  component pattern you want to mimic
- **When the catalog feels thin** for a category (e.g. you want a fancy chart
  or input), grab it from `magicui` or `react-bits` via the shadcn CLI:
  ```bash
  cd projects/my-new-site
  npx shadcn@latest add "https://magicui.design/r/animated-beam"
  ```
- **For brutalist / nightlife aesthetic** (Club KUDT lineage), the
  `neobrutalism-components` repo is the closest match — useful for borrowing
  shadow/border patterns

## Notes

- **Disk cost:** ~500 MB shallow. Trivial vs. the time saved.
- **Why not Aceternity in the clones?** Their components are primarily
  docs-site distributed; the All-Access Pass is paid ($199 lifetime). Free
  components can be copied directly from `ui.aceternity.com`.
- **shadcn registry interop:** all of MagicUI, React Bits, Origin UI publish
  shadcn-compatible registries. Install per-project via the CLI; the clones
  here are for browsing.
