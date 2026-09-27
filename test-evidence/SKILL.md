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
   - **Static conclusion:** use an AST, dependency graph, or source inspection to prove imports, explicit Owner declarations or static boundaries, not business ownership by itself.
   - **Non-code conclusion:** for configuration, documentation, dependencies, CLI behavior, and infrastructure, select static checks, dry runs, integration, idempotency, target-state checks, or smoke verification according to risk.
3. State the capability boundary of the evidence. A static check cannot prove runtime behavior; evidence from mocks cannot establish real integration behavior.
4. Rerun against the current change and record the actual command, result, environment, and risks not covered by verification.

## New Behavior and Defects

- For test-first work, the test must fail for the missing target behavior or reproduced defect before the fix. Existing contracts may already pass; do not manufacture a failure.
- A filename, generated file or CLI string can itself be the public contract. Test it directly when that is the claim; source-text checks do not substitute for unrelated runtime behavior.
- A reproducible defect requires a regression test. First prove that the test reproduces the defect, then fix it.
- Documentation, configuration, and infrastructure changes should not gain sham tests merely to manufacture a formal “red first” stage.

## Insufficient Evidence

When stable automation is impossible or the current environment cannot execute it:

- mark it “insufficient evidence,” not “passed” or “failed”;
- record the reproducible command, actual result, limiting reason, and remaining risk; and
- identify the supported environment in which it should be rerun.

For asynchronous, browser, real-time communication, and process-level verification, state the resource lifecycle, timeout, and supported environment. The creator or owning Fixture closes resources.

## Coverage Judgment

- Test count and LOC are not coverage. Select relevant critical states from the actual contract, such as authentication and authorization, protocol and errors, sorting and pagination, degradation and freshness, concurrency consistency, and side effects.
- A parameterized state matrix or differential contract testing may replace repeated cases, but it must not omit any contract.
- If rebuilding the test infrastructure blocks a product change, freeze the product candidate first and split the infrastructure work into an independent slice.

For legacy-test migration or broad Fixture deletion, continue with [LEGACY.md](LEGACY.md). See `review-evidence` for evidence packages and independent review of complex candidates.
