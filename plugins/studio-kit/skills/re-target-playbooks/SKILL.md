---
name: re-target-playbooks
description: Per-target routing for RECC reverse engineering. Tells the agent which REA tools, providers, and prerequisites to use for native binaries, Electron/JavaScript, Android, .NET, WASM, firmware, packet captures, and websites, and which REA guide covers the details.
origin: RECC
---

# RE Target Playbooks

## When to Use

- Deciding how to start on a new target
- A REA call fails because a provider or prerequisite is missing
- Choosing between static analysis and runtime observation

## How It Works

Identify the target first (`file <path>`, archive listing, or `mcp__rea__inspect_binary_layout`), then follow the matching row. Tool names are REA MCP tools (prefix `mcp__rea__`). The REA guides named below live in the REA repository's `docs/` folder and on rea.tools.

| Target | Start with | Then | Prerequisite | REA guide |
|---|---|---|---|---|
| Electron app / ASAR | `analyze_javascript_application` | `trace_application_feature`, `inspect_electron_fuses` | none | `javascript-application-workflows.md`, `electron-fuses.md` |
| Web bundle / site | `inspect_web_page`, `analyze_web_bundle` | `trace_web_module_imports`, `recover_javascript_sources` | browser for live pages | `web-runtime.md`, `javascript-recovery.md` |
| Native Mach-O / ELF / PE | `open_binary` | `binary_overview`, `search_strings`, `analyze_function`, `get_call_graph` | Hopper, Ghidra, or IDA | `native-investigation.md`, `ghidra-provider.md`, `ida-provider.md` |
| Apple app bundle | `inspect_artifact` | `inspect_macho`, `inspect_signature`, `decode_interface_builder`, `get_objc_classes` | provider for code | `apple-application-analysis.md` |
| Go / Rust binary | `inspect_go_binary` / `inspect_rust_binary` | native flow | provider for code | `go-binaries.md`, `rust-binaries.md` |
| Android APK | `inspect_android_package` | `search_android_classes`, `inspect_android_method`, `decode_android_resources` | JADX + Java; apktool for resources | `android-analysis.md` |
| Flutter | `identify_flutter_build` | `inspect_dart_aot` | none | `flutter-analysis.md` |
| .NET assembly | `inspect_managed_artifact` | `inspect_managed_members`, `project_managed_application_graph` | none | `managed-code-analysis.md` |
| WASM | `inspect_wasm_artifact` | `compare_wasm_interfaces` | none | `wasm-artifacts.md` |
| Firmware image | `inspect_firmware_regions` | `extract_firmware`, then per-file rows | Binwalk or Unblob | `firmware-analysis.md` |
| PCAP / network capture | `inspect_pcap_capture` / `inspect_packet_capture` | `inspect_packet_fields` | none | `pcap-analysis.md`, `packet-captures.md` |
| SQLite database | `inspect_sqlite_database` | | none | `sqlite-databases.md` |
| Crash report | `inspect_recorded_crash` | REA prompt `trace_crash` | provider for symbolication | `recorded-crashes.md` |
| Two versions of an app | REA prompt `compare_application_versions` | `compare_artifacts`, `find_changed_behavior` | as per target | `reconstruction-coverage.md` |

### Static vs runtime

1. Static first: it is reproducible and has no side effects on the target or system.
2. Passive runtime observation (`observe_javascript_runtime`, `observe_web_session`, `capture_process_scenario`) only when static evidence cannot answer the question and the plan's scope allows running the target.
3. Instrumentation (Frida, debuggers) last, only for targets the user controls, with the experiment designed first (REA prompt `prepare_bounded_process_capture`).

### When a provider is missing

Run `/re-doctor`. REA never installs Ghidra, IDA, Java, JADX, Binwalk, or Unblob for you, and RECC does not either. Continue with the parts of the task that do not need the missing provider, and record the gap as an unknown.

## Examples

- "What does this ASAR's updater do?" → `analyze_javascript_application` on the ASAR, then `trace_application_feature` with seed `autoUpdater`.
- "Which function in this ELF validates the licence file format?" → `open_binary` (Ghidra) → `search_strings` for the error message → `xrefs` → `analyze_function`.
- "What changed between v2.3 and v2.4 of our desktop app?" → the `compare_application_versions` prompt with both paths.
