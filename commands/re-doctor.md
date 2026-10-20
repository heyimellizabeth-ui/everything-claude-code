---
description: RECC — read-only diagnosis of the REA MCP connection and analysis providers for this agent, with the exact repair steps.
---

# RE Doctor

Diagnose why REA tools are missing or failing, without changing any configuration.

## Steps

1. **Check the session.** Are `mcp__rea__*` tools available right now? If they are and the user's task does not need a missing provider, say so and stop: no further diagnosis is needed.
2. **Read the pinned version** from the `rea` entry in ECC's `mcp-configs/mcp-servers.json` (installed copy under the ECC install root). Fall back to `latest` only if no pin is found.
3. **Run the read-only doctor:**

   ```bash
   npx -y rea-agents@<pin> doctor --client claude_code --json
   ```

   This may download the package into npm's cache; it does not change agent configuration.
4. **Explain the result**, distinguishing:
   - Missing or stale registration → show `npx -y rea-agents@<pin> setup --client claude_code --dry-run --json`, review the planned changes with the user, and only after approval run the same command with `--yes`.
   - Registered but no tools in this session → restart or reconnect the agent.
   - Missing provider (Hopper, Ghidra, IDA, JADX/Java, Binwalk/Unblob) → only affects tasks that need it. Static JavaScript/Electron analysis needs none. Neither REA nor RECC installs these for you.
5. Follow the `reverse-engineer-anything` skill's connection-and-recovery reference for anything not covered above.
