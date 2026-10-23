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
- Test fixtures must declare their capability boundaries and reject real host operations by default. When a fixture itself fails repeatedly on clock, type, or mapping errors, stop retrying and classify it as an infrastructure defect rather than a product regression.
- Run test and verification commands non-interactively with bounded timeouts. Enforce non-interactive execution (such as setting `CI=true` and disabling watch modes) to prevent silent process hangs; never launch unbounded daemons or interactive prompts during verification.
- Scope verification commands to the modified slice or module first. Running unconstrained full-suite builds or global test runs on every minor edit amplifies turn latency without adding proportional evidence.

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
