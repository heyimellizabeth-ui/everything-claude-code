---
name: openclaw-install-guide
description: "Beginner-friendly step-by-step guide for installing OpenClaw — a self-hosted personal AI gateway — and wiring it up with Claude (Anthropic) as the model provider and with VSCode via MCP. Use when someone asks how to install, set up, or get started with OpenClaw on any platform."
origin: community
---

# OpenClaw Install Guide

> OpenClaw is a personal AI assistant you run on your own machine. Think of it as a local control plane that lets you talk to Claude (or any other AI) across WhatsApp, Telegram, Slack, Discord, iMessage, and 15+ other channels — all from one gateway running on your device.

---

## When to Use

- Someone asks "how do I install OpenClaw?"
- Someone wants to connect OpenClaw to Claude / Anthropic
- Someone wants to use OpenClaw from inside VSCode
- Someone is migrating from a plain Claude Code setup to OpenClaw

### Avoid when

- The user only wants to use Claude Code on its own (no gateway needed)
- The user is asking about OpenClaw plugins or channel setup (separate docs)

---

## Prerequisites

Before you start, make sure you have:

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | 24 (recommended) or 22.19+ | `node --version` |
| npm / pnpm / bun | any recent | `npm --version` |
| Anthropic API key **or** existing Claude Code login | — | see Step 3 |

> **Don't have Node 24 yet?**
> - macOS: `brew install node@24` or use [nvm](https://github.com/nvm-sh/nvm)
> - Windows: download the installer from nodejs.org
> - Linux: `nvm install 24 && nvm use 24`

---

## Part 1 — Install OpenClaw

### Step 1 — Install the CLI globally

```bash
npm install -g openclaw@latest
```

Verify it worked:

```bash
openclaw --version
```

### Step 2 — Run the onboarding wizard

This is the fastest way to get everything configured. It takes about 2 minutes and walks you through model selection, API keys, and daemon setup.

```bash
openclaw onboard --install-daemon
```

The `--install-daemon` flag registers OpenClaw as a background service so it starts automatically:
- **macOS** → registered via `launchd`
- **Linux** → registered via `systemd`
- **Windows** → runs as a background process via the Windows Hub companion

The wizard will ask you to choose a model provider. **Jump to Part 2** (below) for the Claude-specific answers.

### Step 3 — Confirm the Gateway is running

```bash
openclaw gateway status
```

You should see the gateway listening on port `18789`. If not, start it manually:

```bash
openclaw gateway --port 18789 --verbose
```

### Step 4 — Open the dashboard

```bash
openclaw dashboard
```

This opens the Control UI in your browser at `http://127.0.0.1:18789`. You can send test messages, check logs, and manage settings from here.

### Step 5 — Verify everything is healthy

```bash
openclaw doctor
```

This checks your configuration, DM policies, and model connectivity. Fix any warnings it reports before continuing.

---

## Part 2 — Connect Claude (Anthropic) as Your AI Provider

OpenClaw supports two ways to authenticate with Anthropic. Pick whichever fits your situation.

### Option A — API key (recommended for most users)

Best if you want predictable costs or are running OpenClaw on a server.

1. Get a key from [console.anthropic.com](https://console.anthropic.com/)
2. Run:

```bash
openclaw onboard --anthropic-api-key "$ANTHROPIC_API_KEY"
```

Or set it in `~/.openclaw/openclaw.json`:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-..."
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-opus-4-8"
      }
    }
  }
}
```

Verify the model is available:

```bash
openclaw models list --provider anthropic
```

### Option B — Reuse your existing Claude Code login (no API key needed)

Best if you already use Claude Code and don't want to manage a separate API key.

1. Confirm Claude Code is installed: `claude --version`
2. Run the wizard and select "Claude CLI" when asked for a provider:

```bash
openclaw onboard
```

Your config will look like this in `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-opus-4-8"
      },
      "models": {
        "anthropic/claude-opus-4-8": {
          "agentRuntime": { "id": "claude-cli" }
        }
      }
    }
  }
}
```

> **Heads up:** Anthropic treats the Claude CLI path as Agent SDK usage. From June 15 2026, this may draw from a separate monthly credit pool rather than your standard plan. If you need predictable billing, use Option A.

### Available Claude model IDs

| Model | ID |
|-------|----|
| Claude Opus 4.8 | `anthropic/claude-opus-4-8` |
| Claude Sonnet 4.6 | `anthropic/claude-sonnet-4-6` |
| Claude Haiku 4.5 | `anthropic/claude-haiku-4-5` |

### Enable extended thinking (Opus 4.8)

Thinking is off by default on Opus 4.8. To enable it for a single message:

```bash
openclaw agent --message "Explain this codebase" --thinking high
```

Or set it as a default in your config:

```json
{
  "agents": {
    "defaults": {
      "thinking": "high"
    }
  }
}
```

---

## Part 3 — VSCode Integration

OpenClaw does not ship a dedicated VSCode extension. Instead, it exposes a local MCP (Model Context Protocol) server that VSCode AI extensions can connect to. This gives you access to the OpenClaw gateway — and all the Claude models it manages — from inside your editor.

### Which VSCode extension to use

Any VSCode extension that supports MCP servers works. The most common choices:

| Extension | MCP Support | Notes |
|-----------|------------|-------|
| **Claude for VS Code** (Anthropic) | Yes | Native; simplest if you already use Claude Code |
| **Continue** | Yes | Open-source, multi-model, popular for coding |
| **Cline** | Yes | Agent-focused, strong tool use |

### Step 1 — Make sure OpenClaw is running

The gateway must be running before VSCode can connect to it.

```bash
openclaw gateway status
```

If it is not running:

```bash
openclaw gateway --port 18789
```

### Step 2 — Find or create the MCP config file

**For Claude for VS Code / Claude Code:**

Add OpenClaw to `.mcp.json` in your project root (or `~/.claude.json` for global config):

```json
{
  "mcpServers": {
    "openclaw": {
      "url": "http://127.0.0.1:18789/mcp"
    }
  }
}
```

Then reload VSCode (`Cmd/Ctrl + Shift + P` → "Reload Window").

**For Continue extension:**

Open `~/.continue/config.json` and add under `models` or `mcpServers`:

```json
{
  "mcpServers": [
    {
      "name": "openclaw",
      "url": "http://127.0.0.1:18789/mcp"
    }
  ]
}
```

**For Cline:**

In VSCode settings (`Cmd/Ctrl + ,`), search for "Cline MCP" and add the server URL `http://127.0.0.1:18789/mcp`.

### Step 3 — Test the connection

In VSCode, open the chat panel for your chosen extension and send a test message. You should get a response powered by the Claude model you configured in Part 2.

If the connection fails, run `openclaw doctor` in your terminal — it will report any configuration issues.

### Step 4 — (Optional) Import your Claude Code config into OpenClaw

If you have existing MCP servers or project memory in Claude Code, you can migrate them into OpenClaw so they are available in VSCode too:

```bash
# Preview what will be imported
openclaw migrate claude --dry-run

# Apply the migration
openclaw migrate apply claude --yes

# Restart the gateway
openclaw gateway restart
```

This imports:
- MCP server definitions from `.mcp.json` and `~/.claude.json`
- Project memory (`CLAUDE.md` files → merged into `AGENTS.md` / `USER.md`)
- Skills with `SKILL.md` files

It does **not** import hooks, broad tool allowlists, or credentials that need manual review.

---

## Useful CLI Reference

| Command | What it does |
|---------|-------------|
| `openclaw gateway status` | Show gateway health and port |
| `openclaw gateway restart` | Restart the daemon |
| `openclaw models list` | List all available models |
| `openclaw doctor` | Audit config and DM policies |
| `openclaw update --channel stable` | Update to latest stable release |
| `openclaw config get` | Print current config |
| `openclaw config set <key> <value>` | Set a config value |
| `openclaw dashboard` | Open the web Control UI |
| `openclaw agent --message "..."` | Send a one-shot message from CLI |

---

## Troubleshooting

**"command not found: openclaw"**
The global npm bin directory is not in your `PATH`. Run `npm bin -g` to find it and add it to your shell profile.

**Gateway not starting**
Port 18789 may be in use. Check with `lsof -i :18789` (macOS/Linux) or `netstat -an | findstr 18789` (Windows), then either stop the conflicting process or change the port in your config: `openclaw config set gateway.port 18790`.

**"No models available" error**
Your API key or Claude CLI auth may not be configured. Re-run `openclaw onboard --anthropic-api-key "$YOUR_KEY"` or verify with `openclaw models list --provider anthropic`.

**VSCode extension cannot reach OpenClaw**
Make sure the gateway is running (`openclaw gateway status`) and the MCP URL in your extension config matches the port. Run `openclaw doctor` for a full health check.

---

## Examples

```bash
# Full fresh install with Claude via API key
npm install -g openclaw@latest
export ANTHROPIC_API_KEY=sk-ant-...
openclaw onboard --install-daemon --anthropic-api-key "$ANTHROPIC_API_KEY"
openclaw gateway status
openclaw doctor

# Use existing Claude Code login instead of API key
npm install -g openclaw@latest
openclaw onboard --install-daemon   # select "Claude CLI" when prompted
openclaw gateway status

# Quick test from terminal
openclaw agent --message "Hello, are you working?" --thinking high

# Migrate Claude Code config into OpenClaw
openclaw migrate claude --dry-run
openclaw migrate apply claude --yes
openclaw gateway restart
```

---

## Next Steps

- Connect a messaging channel: `openclaw onboard --flow channels` then pick Telegram, Discord, Slack, etc.
- Explore the Control UI at `http://127.0.0.1:18789`
- Read the OpenClaw docs at [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
