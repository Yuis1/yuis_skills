---
name: test-evidence
description: Determine whether verification evidence proves a change correct. Use for non-code verification, static and runtime evidence, or legacy-test migration.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Test and Verification Evidence

State the conclusion to prove before selecting a verification method that proves it directly. Test count, lines of code, and command count are not completion criteria.

## Select Evidence

1. State the target behavior, Owner, dependencies, risks, and minimum verification path.
2. Classify the conclusion:
   - **Behavioral conclusion:** exercise a public interface, state transition, real component, or controlled integration.
   - **Static conclusion:** use an AST, dependency graph, or source inspection to prove imports, Owners, or static boundaries.
   - **Non-code conclusion:** for configuration, documentation, dependencies, CLI behavior, and infrastructure, select static checks, dry runs, integration, idempotency, target-state checks, or smoke verification according to risk.
3. State the capability boundary of the evidence. A static check cannot prove runtime behavior; a mock cannot substitute for a real-integration conclusion.
4. Rerun against the current change and record the actual command, result, environment, and uncovered risk.

## New Behavior and Defects

- Before implementing target behavior, the test should fail because that behavior does not yet exist.
- If a test fails only because a filename, source string, or internal structure changed, it does not prove the target behavior.
- A reproducible defect requires a regression test. First prove that the test reproduces the defect, then fix it.
- Documentation, configuration, and infrastructure changes should not gain sham tests merely to manufacture a formal “red first” stage.

## Insufficient Evidence

When stable automation is impossible or the current environment cannot execute it:

- mark it “insufficient evidence,” not “passed” or “failed”;
- record the reproducible command, actual result, limiting reason, and remaining risk; and
- identify the supported environment in which it should be rerun.

For asynchronous, browser, real-time communication, and process-level verification, state the resource lifecycle, timeout, and supported environment. The creator or owning Fixture closes resources.

## Coverage Judgment

- Test count and LOC are not coverage. Enumerate critical states by contract: authentication and authorization, protocol and errors, sorting and pagination, degradation and freshness, concurrency consistency, and side effects.
- A parameterized state matrix or differential contract may replace repeated cases, but it must not omit any contract.
- If resetting the test foundation blocks a product change, freeze the product candidate first and split the foundation work into an independent slice.

For legacy-test migration or broad Fixture deletion, continue with [LEGACY.md](LEGACY.md). See `review-evidence` for evidence packages and independent review of complex candidates.
