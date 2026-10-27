---
name: test-evidence
description: Select direct verification evidence, enforce failure observability, validate environment capabilities, and judge test coverage. Use for behavioral proof, preflight checks, or legacy test migration.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Test and Verification Evidence

State the conclusion to prove before selecting a verification method that proves it directly. Test count, lines of code, and command count are not completion criteria.

## Select Evidence

1. State the target behavior, Owner, dependencies, risks, and minimum verification path. Run a lightweight preflight probe first to verify required environment capabilities; when underlying capabilities are absent, report the dependency immediately rather than constructing sham tests.
2. Classify the conclusion:
   - **Behavioral conclusion:** exercise a public interface, state transition, real component, or controlled integration.
   - **Static conclusion:** use an AST, dependency graph, or source inspection to prove imports, explicit Owner declarations or static boundaries, not business ownership by itself.
   - **Non-code conclusion:** for configuration, documentation, dependencies, CLI behavior, and infrastructure, select static checks, dry runs, integration, idempotency, target-state checks, or smoke verification according to risk.
3. State the capability boundary of the evidence. A static check cannot prove runtime behavior; evidence from mocks cannot establish real integration behavior. The executing model cannot act as its own judge: narrative self-assessment in the same loop is not verification evidence. Mandate an outside judge, whether an automated test, a native tool, or an isolated evaluation session.
4. Enforce failure observability before running: ensure native stdout, stderr, exit code, and crash traces are captured independently. Never use pipes that discard text or merely count bytes. Expose a sanitized projection for review while keeping raw diagnostic logs in a restricted local path.

## New Behavior and Defects

- For test-first work, the test must fail for the missing target behavior or reproduced defect before the fix. Existing contracts may already pass; do not manufacture a failure.
- A filename, generated file or CLI string can itself be the public contract. Test it directly when that is the claim; source-text checks do not substitute for unrelated runtime behavior.
- A reproducible defect requires a regression test. First prove that the test reproduces the defect, then fix it. Investigate from the rawest inputs—such as native stack traces, runtime logs, or AST representations—rather than digested summaries or speculative guesses.
- Enforce Reward-Hacking Defense: treat target test suites as immutable evaluation baselines during implementation. A change is proven only when production code satisfies the locked test; strictly prohibit softening assertions, injecting skip annotations, altering coverage thresholds, or hardcoding input-output tables to engineer a pass. Any modification to existing tests requires audit as an explicit contract change.
- Decouple product regressions from test harness defects: test fixtures and verification probes must declare capability boundaries and reject real host operations by default. When an internal test controller, probe, or sampling harness exhibits race conditions (such as short-lived child processes exiting before inspection), fix the harness autonomously rather than treating harness false alarms as product blockers or escalating routine test script repairs to the user.
- Eradicate harness competition and port collisions through clean-room ephemeral sandboxing: bind dynamic ephemeral ports (OS `:0` or dedicated dynamic leases) rather than hardcoded ports to eliminate TIME_WAIT false alarms; supervise multi-process integration stacks under a dedicated process group (`setsid`), terminating cleanly with a single group signal (`kill -- -$PGID`) to eliminate zombie child processes; isolate persistent state using copy-on-write database templates or ephemeral instances rather than fragile shared setup/teardown logic.
- Uphold Single-Command E2E Primacy: decoupled slice passes (backend units, UI component tests) prove isolated correctness, but feature completion strictly requires one reproducible command exercising the full unmocked user journey from clean startup to persistent state.
- Enforce non-interactive execution with an anti-hang guard: set `CI=true` and disable watch modes with bounded timeouts to prevent silent process hangs; never launch unbounded daemons or interactive prompts during verification.
- Target verification commands to localized slices first: running unconstrained full-suite builds or global test runs on every minor edit amplifies turn latency without adding proportional evidence.

## Insufficient Evidence and Lifecycle

When stable automation is impossible or the current environment cannot execute it:

- mark it “insufficient evidence,” not “passed” or “failed”;
- record the reproducible command, actual result, limiting reason, and remaining risk; and
- identify the supported environment in which it should be rerun.

Asynchronous, network, and process-level verification must run under a supervised driver with explicit timeouts that reserve a cleanup buffer. The driver must terminate child processes and close resources before exit; completion requires verifying net space release and absence of orphan processes rather than merely invoking a deletion command.

## Coverage Judgment

- Test count and LOC are not coverage. Select relevant critical states from the actual contract, such as authentication and authorization, protocol and errors, sorting and pagination, degradation and freshness, concurrency consistency, and side effects.
- A parameterized state matrix or differential contract testing may replace repeated cases, but it must not omit any contract.
- If rebuilding the test infrastructure blocks a product change, freeze the product candidate first and split the infrastructure work into an independent slice.

For legacy-test migration or broad Fixture deletion, continue with [LEGACY.md](LEGACY.md). See `review-evidence` for evidence packages and independent review of complex candidates.
