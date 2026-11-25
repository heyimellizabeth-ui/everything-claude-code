#!/usr/bin/env bash
# setup-chelp-cloud.sh: prepare a cloud session so /chelp-pipeline reports READY.
#
# Installs, in order: the ECC commands, agents, skills and scripts into ~/.claude,
# the studio-kit plugin's skills, agents, commands, scripts and templates into
# ~/.claude (so /chelp, /c1 to /c5, /design-gate, /chelp-pipeline and /chelp-advisor exist),
# puppeteer-core globally (the browser checks), and the Hallmark design skill.
#
# Best effort: a failed step is reported and the script still exits 0, so it can
# never stop a session from starting. /chelp-pipeline reports what is missing.
#
# Usage: bash scripts/setup-chelp-cloud.sh [--dry-run] [ECC_DIR]
#
# Environment:
#   HALLMARK_DIR       a Hallmark checkout to install from (default: a sibling
#                      "hallmark" folder, else a clone of HALLMARK_REPO_URL)
#   HALLMARK_REPO_URL  where to clone Hallmark from when no checkout exists
#   ECC_PROFILE        install profile (default: developer)
#   PUPPETEER_VERSION  puppeteer-core version (default: 23.11.1, the one tested)

set -u

DRY_RUN=0
ECC_DIR=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    *) ECC_DIR="$arg" ;;
  esac
done

if [ -z "$ECC_DIR" ]; then
  ECC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
fi

ECC_PROFILE="${ECC_PROFILE:-developer}"
PUPPETEER_VERSION="${PUPPETEER_VERSION:-23.11.1}"
HALLMARK_REPO_URL="${HALLMARK_REPO_URL:-https://github.com/heyimellizabeth-ui/hallmark}"

log() { echo "[chelp-setup] $*"; }

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    log "would run: $*"
    return 0
  fi
  "$@"
}

step_failed=0

# 1. ECC into ~/.claude, from a copy so the session's checkout stays clean
#    (npm can rewrite yarn.lock, and the installer needs node_modules).
install_ecc() {
  if [ ! -f "$ECC_DIR/scripts/install-apply.js" ]; then
    log "ECC installer not found in $ECC_DIR, skipping the ECC install"
    return 1
  fi
  log "installing ECC (profile $ECC_PROFILE) into ~/.claude"
  if [ "$DRY_RUN" -eq 1 ]; then
    log "would copy $ECC_DIR to a temp folder, run npm ci and: node scripts/install-apply.js --profile $ECC_PROFILE"
    return 0
  fi
  local copy
  copy="$(mktemp -d)" || return 1
  tar -C "$ECC_DIR" --exclude=.git --exclude=node_modules -cf - . | tar -C "$copy" -xf - || { rm -rf "$copy"; return 1; }
  ( cd "$copy" \
    && npm ci --no-audit --no-fund --loglevel=error \
    && node scripts/install-apply.js --profile "$ECC_PROFILE" )
  local status=$?
  rm -rf "$copy"
  return $status
}

# 1b. studio-kit (plugins/studio-kit) into ~/.claude, so its skills find their scripts there
install_studio_kit() {
  local kit="$ECC_DIR/plugins/studio-kit"
  if [ ! -d "$kit/skills" ]; then
    log "studio-kit not found in $ECC_DIR, skipping it"
    return 1
  fi
  log "installing studio-kit into ~/.claude"
  local dir
  for dir in skills agents commands scripts templates; do
    [ -d "$kit/$dir" ] || continue
    run mkdir -p "$HOME/.claude/$dir" || return 1
    run cp -R "$kit/$dir/." "$HOME/.claude/$dir/" || return 1
  done
}

# 2. puppeteer-core, global, so Hallmark's browser checks can find it
install_puppeteer() {
  log "installing puppeteer-core@$PUPPETEER_VERSION globally"
  run npm i -g --no-audit --no-fund --loglevel=error "puppeteer-core@$PUPPETEER_VERSION"
}

# 3. Hallmark, from a checkout on the session, else a clone
install_hallmark() {
  local dir="${HALLMARK_DIR:-}"
  if [ -z "$dir" ] && [ -d "$ECC_DIR/../hallmark/skills/hallmark" ]; then
    dir="$(cd "$ECC_DIR/../hallmark" && pwd)"
  fi
  if [ -z "$dir" ]; then
    dir="/opt/hallmark"
    if [ "$DRY_RUN" -eq 1 ]; then
      log "would clone $HALLMARK_REPO_URL to $dir"
    elif [ ! -d "$dir/skills/hallmark" ]; then
      log "cloning Hallmark from $HALLMARK_REPO_URL"
      timeout 120 git clone --depth 1 "$HALLMARK_REPO_URL" "$dir" || { log "could not clone Hallmark"; return 1; }
    fi
  fi
  if [ "$DRY_RUN" -ne 1 ] && [ ! -f "$dir/skills/hallmark/scripts/install.mjs" ]; then
    log "Hallmark installer not found in $dir"
    return 1
  fi
  log "installing Hallmark from $dir into ~/.claude/skills/hallmark"
  [ "$DRY_RUN" -eq 1 ] || mkdir -p "$HOME/.claude" 2>/dev/null
  run node "$dir/skills/hallmark/scripts/install.mjs" --claude
}

install_ecc || { log "ECC install failed"; step_failed=1; }
install_studio_kit || { log "studio-kit install failed"; step_failed=1; }
install_puppeteer || { log "puppeteer-core install failed"; step_failed=1; }
install_hallmark || { log "Hallmark install failed"; step_failed=1; }

# 4. Report what is still missing
if [ "$DRY_RUN" -eq 0 ] && [ -f "$HOME/.claude/scripts/chelp-pipeline.js" ]; then
  node "$HOME/.claude/scripts/chelp-pipeline.js" --no-smoke || true
fi

if [ "$step_failed" -ne 0 ]; then
  log "one or more steps failed; run /chelp-pipeline for what is missing and the exact fix"
fi
exit 0
