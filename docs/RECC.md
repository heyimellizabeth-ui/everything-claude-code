# RECC: Reverse Engineering with ECC + REA

RECC combines two projects:

- **REA** ([`rea-agents`](https://www.npmjs.com/package/rea-agents)) — an MCP server and CLI that inspects native binaries, Electron/JavaScript apps, Android packages, .NET assemblies, WASM, firmware, packet captures, and websites, and returns Evidence with explicit unknowns.
- **ECC** — this repository: agents, skills, commands, hooks, and rules for disciplined engineering (planning, TDD, review, memory).

REA supplies the *tools*; ECC supplies the *workflow* around them. RECC is the ECC module that wires the two together. REA stays an independent, version-pinned package, so both projects keep their own release cycles.

## What RECC adds

| Kind | Items |
|---|---|
| Agents | `re-planner`, `re-investigator`, `re-reconstructor`, `re-parity-verifier`, `re-security-analyst` |
| Skills | `reverse-engineer-anything` (vendored from REA), `re-evidence-discipline`, `re-feature-to-implementation`, `re-target-playbooks`, `re-scope-and-legality` |
| Commands | `/re-investigate`, `/re-compare`, `/re-rebuild`, `/re-verify`, `/re-doctor` |
| Hooks | `post:recc-evidence-log` (logs REA calls and Evidence IDs), `stop:recc-unknowns-reminder` |
| MCP | `rea` entry in `mcp-configs/mcp-servers.json`, pinned to an exact `rea-agents` version |
| Install | `reverse-engineering` module, `recc` profile, `capability:reverse-engineering` component |

## Workflow

```text
 /re-investigate                    /re-rebuild                       /re-verify
 ┌────────────┐  ┌───────────────┐  ┌────────────────┐  ┌──────────┐  ┌──────────────────┐
 │ re-planner │─>│re-investigator│─>│re-reconstructor│─>│ /plan +  │─>│re-parity-verifier│─> /code-review
 │ scope+plan │  │  REA tools    │  │ clean-room spec│  │ TDD build│  │  parity report   │
 └────────────┘  └───────────────┘  └────────────────┘  └──────────┘  └──────────────────┘
   .recc/plan.md   .recc/findings.md   .recc/spec.md                     .recc/parity.md
                   .recc/evidence-log.jsonl (hook)
```

`re-security-analyst` and `/re-compare` branch off the investigation for defensive reviews and version diffs.

## Install

1. **Install ECC with the RECC profile:**

   ```bash
   ./install.sh --profile recc
   ```

   `full` also includes the module. The RE agents and commands ship with `agents-core` and `commands-core`; the module adds the RE skills.

2. **Register REA with your agent.** Use REA's own setup, which shows the planned changes and asks for approval before writing:

   ```bash
   npx -y rea-agents@6.7.0 setup --client claude_code --dry-run --json   # review
   npx -y rea-agents@6.7.0 setup --client claude_code --yes              # apply
   ```

   Or copy the `rea` entry from `mcp-configs/mcp-servers.json` into your MCP configuration. Restart the agent afterwards.

3. **Optional providers** for native analysis: Hopper, Ghidra, or IDA (bring your own). Android needs JADX and Java; firmware extraction needs Binwalk or Unblob. Static JavaScript/Electron analysis needs none of these.

4. **Check:** run `/re-doctor`.

## Per-project workspace

RECC writes to `.recc/` in the project you are working in. The evidence-log hook only runs when that directory exists (`/re-investigate` creates it), so other projects are unaffected. Add `.recc/` to `.gitignore` if findings about third-party software should stay local.

Disable the hooks with `ECC_DISABLED_HOOKS=post:recc-evidence-log,stop:recc-unknowns-reminder`.

## Scope

RECC is for understanding software you are entitled to analyze: your own builds, interoperability, authorized security work, CTFs, and clean-room feature design. The `re-scope-and-legality` skill records the basis for each investigation and stops on credential theft, DRM or licence circumvention, malware development, or attacks on systems the user does not control. See also REA's `DISCLAIMER.md`.

## Keeping REA and ECC in sync

The pin, the vendored REA skill, and a snapshot of REA's tool catalog (`mcp-configs/rea-tool-catalog.json`) move together:

```bash
# from a REA source checkout or an extracted rea-agents package
node scripts/sync-rea.js --version <x.y.z> --from ../rea
node tests/run-all.js
```

`sync-rea.js` launches the pinned server over stdio to read `tools/list` and `prompts/list`. `tests/ci/recc-contract.test.js` then fails if any RECC agent, skill, or command names a REA tool that the pinned release does not provide, which catches renamed or removed tools before users do.

Both repositories are forks of active upstreams. Keep RECC changes in the files listed above so that merging upstream changes stays conflict-free.
