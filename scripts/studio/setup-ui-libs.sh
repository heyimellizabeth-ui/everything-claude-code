#!/usr/bin/env bash
# setup-ui-libs.sh — Personal UI/UX reference library installer
# Idempotent: safe to re-run. Updates existing clones, adds new ones.
#
# Clones the 10 most useful 2026 React UI/UX repos into ~/dev/_ref/ui-libs/
# (configurable via UI_LIBS_ROOT) so you can browse them offline as design inspiration
# alongside the Design Studio. Defaults to shallow clones (~500MB total).
#
# Usage:
#   ./scripts/studio/setup-ui-libs.sh
#   UI_LIBS_ROOT=~/custom/path ./scripts/studio/setup-ui-libs.sh
#   CLONE_DEPTH=0 ./scripts/studio/setup-ui-libs.sh   # full git history

set -u  # treat unset vars as errors, but don't set -e (we handle errors per-repo)

# ─── Config ─────────────────────────────────────────────────────────────────
UI_LIBS_ROOT="${UI_LIBS_ROOT:-$HOME/dev/_ref/ui-libs}"
CLONE_DEPTH="${CLONE_DEPTH:-1}"  # set to 0 for full history

# ─── Colors ─────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  C_RESET='\033[0m'; C_DIM='\033[2m'; C_BOLD='\033[1m'
  C_GREEN='\033[0;32m'; C_YELLOW='\033[0;33m'; C_RED='\033[0;31m'
  C_BLUE='\033[0;34m'; C_CYAN='\033[0;36m'
else
  C_RESET=''; C_DIM=''; C_BOLD=''; C_GREEN=''; C_YELLOW=''; C_RED=''; C_BLUE=''; C_CYAN=''
fi

# ─── Repo list ──────────────────────────────────────────────────────────────
# Format: "tier_dir|repo_name|github_url|one_line_description"
REPOS=(
  "01-foundation|shadcn-ui|https://github.com/shadcn-ui/ui.git|The baseline. Radix UI + Tailwind. De facto standard for React in 2026."
  "01-foundation|originui|https://github.com/origin-space/originui.git|400+ copy-paste components extending shadcn. Fills the gaps."

  "02-animation|react-bits|https://github.com/DavidHDev/react-bits.git|110+ animated components. Best-in-class text effects + backgrounds."
  "02-animation|magicui|https://github.com/magicuidesign/magicui.git|150+ Framer Motion components. Linear/Vercel-style polish."
  "02-animation|motion-primitives|https://github.com/ibelick/motion-primitives.git|Accessible, composable motion components. Lighter alternative."

  "03-distinctive|neobrutalism-components|https://github.com/ekmas/neobrutalism-components.git|Bold borders, hard shadows, vibrant palette. Club KUDT territory."
  "03-distinctive|brutalist-ui|https://github.com/dev-snake/brutalist-ui.git|26+ neo-brutalist components on Radix primitives. Fully a11y."

  "04-three-d|react-three-next|https://github.com/pmndrs/react-three-next.git|Official pmndrs Next.js + R3F starter. Solves scissor-viewport perf."
  "04-three-d|drei|https://github.com/pmndrs/drei.git|R3F helpers ecosystem. Camera controls, HDRIs, materials."

  "05-curation|awesome-shadcn-ui|https://github.com/birobirobiro/awesome-shadcn-ui.git|The meta-list. 650+ shadcn-compatible registries and tools."
)

# ─── Counters ───────────────────────────────────────────────────────────────
CLONED=0
UPDATED=0
FAILED=0
FAILED_REPOS=()

# ─── Functions ──────────────────────────────────────────────────────────────
log()   { printf "${C_DIM}%s${C_RESET} %b\n" "$(date +%H:%M:%S)" "$1"; }
ok()    { printf "  ${C_GREEN}✓${C_RESET} %b\n" "$1"; }
warn()  { printf "  ${C_YELLOW}⚠${C_RESET} %b\n" "$1"; }
fail()  { printf "  ${C_RED}✗${C_RESET} %b\n" "$1"; }
hdr()   { printf "\n${C_BOLD}${C_CYAN}%s${C_RESET}\n" "$1"; }

clone_or_update() {
  local tier_dir="$1" name="$2" url="$3"
  local target="$UI_LIBS_ROOT/$tier_dir/$name"

  if [ -d "$target/.git" ]; then
    printf "  ${C_BLUE}↻${C_RESET} %-30s " "$name"
    if git -C "$target" pull --quiet --ff-only 2>/dev/null; then
      printf "${C_GREEN}updated${C_RESET}\n"
      UPDATED=$((UPDATED + 1))
    else
      printf "${C_YELLOW}pull failed (local changes?)${C_RESET}\n"
    fi
  else
    printf "  ${C_BLUE}↓${C_RESET} %-30s " "$name"
    mkdir -p "$UI_LIBS_ROOT/$tier_dir"
    local depth_flag=""
    [ "$CLONE_DEPTH" != "0" ] && depth_flag="--depth $CLONE_DEPTH"
    if git clone $depth_flag --quiet "$url" "$target" 2>/dev/null; then
      printf "${C_GREEN}cloned${C_RESET}\n"
      CLONED=$((CLONED + 1))
    else
      printf "${C_RED}FAILED${C_RESET}\n"
      FAILED=$((FAILED + 1))
      FAILED_REPOS+=("$name ($url)")
    fi
  fi
}

generate_index() {
  local index_path="$UI_LIBS_ROOT/INDEX.md"
  log "Generating INDEX.md..."

  {
    echo "# UI/UX Reference Library — INDEX"
    echo ""
    echo "_Generated: $(date '+%Y-%m-%d %H:%M:%S')_"
    echo "_Location: \`$UI_LIBS_ROOT\`_"
    echo ""
    echo "## How to use"
    echo ""
    echo "- **Browse** these locally for inspiration and code patterns."
    echo "- **Don't symlink** into projects. Use the shadcn CLI to install components per-project:"
    echo "  \`\`\`bash"
    echo "  npx shadcn@latest add button"
    echo "  npx shadcn@latest add \"https://magicui.design/r/animated-beam\""
    echo "  npx shadcn@latest add \"https://reactbits.dev/r/blur-text\""
    echo "  \`\`\`"
    echo "- **Re-run** \`setup-ui-libs.sh\` periodically to pull updates."
    echo ""
    echo "---"
    echo ""

    local current_tier=""
    for entry in "${REPOS[@]}"; do
      IFS='|' read -r tier name url desc <<< "$entry"
      if [ "$tier" != "$current_tier" ]; then
        case "$tier" in
          "01-foundation")   echo ""; echo "## 🏛️  Foundation"; echo "" ;;
          "02-animation")    echo ""; echo "## ✨ Animation & Effects"; echo "" ;;
          "03-distinctive")  echo ""; echo "## 🔨 Distinctive / Brutalist"; echo "" ;;
          "04-three-d")      echo ""; echo "## 🎮 3D / R3F"; echo "" ;;
          "05-curation")     echo ""; echo "## 📚 Curation / Meta"; echo "" ;;
        esac
        current_tier="$tier"
      fi
      local local_path="$tier/$name"
      local exists="❌"
      [ -d "$UI_LIBS_ROOT/$local_path" ] && exists="✅"
      echo "### $exists \`$name\`"
      echo ""
      echo "$desc"
      echo ""
      echo "- **Local:** \`$local_path/\`"
      echo "- **Remote:** [$url]($url)"
      echo ""
    done

    echo ""
    echo "---"
    echo ""
    echo "## 🔖 Bookmarks (browse-only, not cloned)"
    echo ""
    echo "These are docs-site distributed or paywalled — read on the web, copy as needed:"
    echo ""
    echo "- **Aceternity UI** — https://ui.aceternity.com (200+ free, dramatic effects)"
    echo "- **Tailwind Plus** — https://tailwindcss.com/plus (premium blocks)"
    echo "- **Untitled UI** — https://www.untitledui.com (React + Figma kit)"
    echo "- **shadcn registries** — https://ui.shadcn.com/docs/registry"
    echo ""
    echo "## ⚙️  Maintenance"
    echo ""
    echo "\`\`\`bash"
    echo "# Pull all updates"
    echo "./setup-ui-libs.sh"
    echo ""
    echo "# Custom location"
    echo "UI_LIBS_ROOT=~/custom/path ./setup-ui-libs.sh"
    echo ""
    echo "# Full git history instead of shallow clones"
    echo "CLONE_DEPTH=0 ./setup-ui-libs.sh"
    echo "\`\`\`"
  } > "$index_path"

  ok "INDEX.md written to $index_path"
}

# ─── Pre-flight checks ──────────────────────────────────────────────────────
hdr "🔍 Pre-flight"

if ! command -v git >/dev/null 2>&1; then
  fail "git not found. Install git first."
  exit 1
fi
ok "git: $(git --version | head -1)"

mkdir -p "$UI_LIBS_ROOT"
ok "Root directory: $UI_LIBS_ROOT"

# ─── Main loop ──────────────────────────────────────────────────────────────
hdr "📦 Cloning / updating repos"

current_tier=""
for entry in "${REPOS[@]}"; do
  IFS='|' read -r tier name url desc <<< "$entry"
  if [ "$tier" != "$current_tier" ]; then
    case "$tier" in
      "01-foundation")   echo ""; echo "  ${C_DIM}── Foundation ──${C_RESET}" ;;
      "02-animation")    echo ""; echo "  ${C_DIM}── Animation ──${C_RESET}" ;;
      "03-distinctive")  echo ""; echo "  ${C_DIM}── Distinctive ──${C_RESET}" ;;
      "04-three-d")      echo ""; echo "  ${C_DIM}── 3D / R3F ──${C_RESET}" ;;
      "05-curation")     echo ""; echo "  ${C_DIM}── Curation ──${C_RESET}" ;;
    esac
    current_tier="$tier"
  fi
  clone_or_update "$tier" "$name" "$url"
done

# ─── Index ──────────────────────────────────────────────────────────────────
hdr "📝 Index"
generate_index

# ─── Summary ────────────────────────────────────────────────────────────────
hdr "📊 Summary"
echo "  Cloned:  $CLONED"
echo "  Updated: $UPDATED"
echo "  Failed:  $FAILED"
if [ ${#FAILED_REPOS[@]} -gt 0 ]; then
  echo ""
  warn "Failed repos:"
  for r in "${FAILED_REPOS[@]}"; do
    echo "    - $r"
  done
fi
echo ""
if command -v du >/dev/null 2>&1; then
  total_size=$(du -sh "$UI_LIBS_ROOT" 2>/dev/null | cut -f1)
  echo "  Disk usage: $total_size"
fi
echo ""
ok "Done. Browse the library: ${C_BOLD}open $UI_LIBS_ROOT${C_RESET}"
ok "Read the index: ${C_BOLD}cat $UI_LIBS_ROOT/INDEX.md${C_RESET}"
echo ""

exit 0
