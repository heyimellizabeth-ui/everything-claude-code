---
name: rust-migration
description: Decision and strategy guide for adopting Rust — when a move to Rust is worth it, when it is not, and how to migrate incrementally via FFI/interop boundaries rather than big-bang rewrites.
origin: ECC
---

# Rust Migration Overview

Guidance for deciding whether to adopt Rust for a component and, if so, how to get there
incrementally. This complements `skill: rust-patterns` (idiomatic code) and `skill: rust-testing`
(test strategy), which assume you are *already* writing Rust — this skill covers the decision that
comes before that.

## When to Use

- Evaluating whether an existing component should move to Rust.
- Standing up a new performance- or safety-critical service and choosing a language.
- Planning an incremental migration that must keep a shipping system green throughout.

## How It Works

### When to adopt Rust

Reach for Rust when the pain it removes is real:

- **Memory-safety-critical** code where data races or use-after-free would be costly, but a garbage
  collector is unwanted (systems software, parsers, crypto, untrusted-input handling).
- **Performance-sensitive** hot paths where predictable, GC-free latency matters.
- **Concurrency-heavy** work where the compiler's `Send`/`Sync` guarantees turn whole classes of
  bugs into compile errors ("fearless concurrency").
- **Long-lived libraries/CLIs** that benefit from a strong type system, exhaustive `enum` matching,
  and a single self-contained static binary.

### Advantages, concisely

- Compile-time memory safety **without a garbage collector**.
- Predictable performance and low, GC-free latency.
- Fearless concurrency — shared-state misuse is a compile error, not a runtime crash.
- Strong types + exhaustive enums make illegal states unrepresentable.
- First-class tooling: `cargo`, `clippy`, `rustfmt`, integrated test/bench/doc.
- Distributes as one static binary with no runtime to install.

### When NOT to adopt Rust

Do not migrate just because Rust is appealing. Skip it when:

- The component is a **CSS framework or browser-facing UI** (e.g. Bootstrap) — the platform runs
  CSS/JS; Rust/WASM cannot replace SCSS or DOM-driving JavaScript.
- The code is **glue/config or short scripts** (e.g. ECC's Node hooks) where an interpreted,
  zero-build, cross-platform script is the feature, not a liability.
- The code is **stable and not causing pain** — a rewrite trades working software for risk.
- It is a **throwaway prototype** where iteration speed beats runtime guarantees.

### Incremental migration strategy

Prefer the **strangler-fig** approach over a big-bang rewrite:

1. Pick **one** module where Rust's benefit is highest (a hot path or a safety-critical boundary).
2. Carve a clean interface and port that module behind a stable FFI boundary.
3. Keep tests green on **both** sides of the boundary at every step; ship in small increments.
4. Expand only once the first slice has proven its value in production.

Common interop boundaries:

| Host stack | Boundary |
|------------|----------|
| C / C++    | C ABI via `extern "C"`, headers via `cbindgen`, or the `cxx` crate |
| Python     | `PyO3` (and `maturin` to build/publish wheels) |
| Node.js / JS | `napi-rs` for native addons, or compile to **WASM** for portable modules |
| Go / others | C ABI shared library (`cdylib`) |

### Anti-patterns

- **Big-bang rewrites** of a whole system at once — high risk, no incremental value.
- **Rewriting stable code** that has no performance or safety problem.
- **Reaching for `unsafe`** to silence the borrow checker instead of redesigning ownership.
- **Ignoring interop cost** — every FFI boundary has marshalling and maintenance overhead; cross it
  deliberately, not casually.

## Examples

**Good first slice:** a JSON/CSV parsing hot path in a Node service that dominates CPU profiles.
Port just the parser, expose it via `napi-rs`, keep the existing JS API and tests unchanged, and
measure before widening scope.

**Bad migration:** "rewrite the whole web frontend in Rust." The browser still needs CSS and DOM
JavaScript; the win is illusory and the cost is total. Keep it on its native stack.

For idiomatic Rust once you have chosen to migrate, see `skill: rust-patterns`; for test strategy,
see `skill: rust-testing`.
