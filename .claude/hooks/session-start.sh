#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs Node and Python dependencies so tests and linters work in fresh
# remote containers. Synchronous, idempotent, non-interactive.
set -euo pipefail

# Only run in remote (Claude Code on the web) sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] Installing Node dependencies (npm install)..."
npm install

if [ -f pyproject.toml ]; then
  echo "[session-start] Installing Python dev dependencies..."
  python3 -m pip install -e ".[dev]"
fi

echo "[session-start] Done."
