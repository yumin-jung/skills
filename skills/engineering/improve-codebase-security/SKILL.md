---
name: improve-codebase-security
description: Scan a codebase's trust boundaries for evidenced security vulnerabilities and hardening opportunities, present them as a visual HTML report, then safely fix whichever one the user picks. Use for security reviews, post-incident or pentest follow-up, and focused audits of endpoints, parsers, authentication, authorization, secrets, dependencies, or dangerous sinks.
disable-model-invocation: true
---

# Improve Codebase Security

Surface **hardening opportunities**: changes that turn an implicit trust boundary into an enforced one. Use this vocabulary consistently:

- **Actor** — who or what initiates an action
- **Asset** — data or capability worth protecting
- **Entry point** — where data or control enters the scoped system
- **Trust boundary** — where it moves from less trusted to more trusted
- **Control** — validation, authorization, isolation, or other enforcement at that boundary
- **Sink** — interpreter, privileged operation, or data store the flow can reach

## Process

### 1. Scope and map the trust boundaries

Scope before scanning. If the user named an endpoint, module, incident, pentest result, or advisory, use that scope. Otherwise:

1. Inventory externally reachable entry points: HTTP routes, CLI arguments, parsers and uploads, webhooks, queues and jobs, IPC, env/config loading, and deserialization.
2. Use `git log --oneline` to identify recently changed entry points.
3. Select the externally reachable and recently changed surfaces first.
4. Record **In scope**, **Excluded**, and **Why**. Do not imply full-repository coverage when the scan is sampled.

Use the Agent tool with `subagent_type=Explore` to trace each in-scope entry point through normalization, validation, authentication, authorization, and other controls to every reachable sink. Keep a coverage ledger: each entry point is `traced`, `cleared`, or `untraced` with a reason.

Look for missing or misplaced controls:

- Injection into SQL, shell, templates, paths, HTML/JS, regex, or deserializers. Prefer structural controls appropriate to the sink: parameterized queries, APIs that avoid a shell, canonicalization plus allowlists, context-specific output encoding, resource limits, and safe deserialization.
- Missing authentication, object- or action-level authorization, tenant isolation, or privilege checks. Do not assume sibling endpoints prove this endpoint is safe.
- User-controlled URLs, redirects, file names, uploads, dynamic imports, `exec`/`eval`, or other privileged sinks.
- Secrets in source, logs, errors, build artifacts, or client-shipped bundles. Redact secret values in all notes and reports.
- Missing integrity, replay, rate, size, or time limits where the attack scenario depends on them.
- Dependency advisories. Run the ecosystem's read-only audit command when available, but never its auto-fix mode. Treat an advisory as a vulnerability only after confirming the affected code is installed, used, and reachable; otherwise label it `Hygiene`.

For every candidate, capture evidence before recommending a fix:

- attacker-controlled source and required preconditions
- exact source → controls → sink path, with file and line references
- existing control and why it does not stop the scenario
- affected asset and concrete impact
- confidence: `Confirmed`, `Likely`, or `Speculative`

A candidate without a concrete attack scenario is `Hygiene`, not a vulnerability. Do not promote pattern matches or audit-tool output without tracing reachability.

Operate safely while scanning: do not exploit production systems, send destructive or denial-of-service payloads, reveal secrets, or upload repository data to third parties. Use static reasoning and isolated tests. If a safe check cannot confirm a scenario, state the uncertainty instead of escalating the test.

Completion criterion: every in-scope entry point is traced or explicitly marked untraced, and every reported candidate has the evidence above. Untraced surfaces appear in the coverage summary, not as invented vulnerabilities.

### 2. Present candidates as an HTML report

Write one CDN-backed HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp directory from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/security-review-<timestamp>.html`. Open it with `open` on macOS, `xdg-open` on Linux, or `start` on Windows, and tell the user the absolute path.

Start with the scope and coverage ledger. Render each candidate as a card containing:

- **Files and lines** — the evidence locations
- **Boundary** — actor, asset, and what crosses from where to where
- **Evidence path** — source → existing controls → sink
- **Attack scenario** — attacker input, preconditions, path, and impact
- **Control gap** — why the existing enforcement fails
- **Fix** — enforcement at the trust boundary so every caller inherits it
- **Badge row** — severity or `Hygiene`, plus confidence
- **Before / After diagram** — the exploitable flow beside the enforced flow

Assign severity only to concrete vulnerability scenarios:

- `Critical` — credible, low-friction path to catastrophic compromise
- `High` — credible path with realistic prerequisites and major impact
- `Medium` — meaningful but constrained exploitability or impact
- `Low` — limited impact or substantial prerequisites
- `Hygiene` — defense-in-depth or an unconfirmed concern; no vulnerability severity

End with a **Top recommendation** chosen by severity, confidence, boundary leverage, and testability—not severity alone. See [SECURITY-REPORT.md](SECURITY-REPORT.md) for the scaffold, diagram patterns, and visual rules.

This step is propose-only. Do not modify the repository. After opening the report, ask: “Which of these would you like to fix?”

### 3. Fix the selected candidate

After the user picks a candidate:

- For a design-heavy fix such as a new authorization model, session handling, tenant isolation, or secrets management, run the `/grilling` skill first.
- For a mechanical fix, use the sink-appropriate structural control: parameterize the query, replace shell construction with an argument-safe API, canonicalize and allowlist a path, or apply context-specific output encoding.

Enforce the control at the trust boundary, not at individual call sites. Add the smallest isolated regression test that reproduces the attack path safely, verify it fails on the pre-fix behavior, implement the fix, and verify it passes. Never reproduce against production. Do not print or commit live secrets; if a real secret is exposed, report it redacted and explain that rotation may be required rather than silently moving it.

Completion criterion: the regression test demonstrates the pre-fix failure and post-fix protection, relevant existing tests pass, and the report's attack scenario can no longer cross the boundary in the isolated test environment.
