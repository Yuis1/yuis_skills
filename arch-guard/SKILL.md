---
name: arch-guard
description: Turn architecture constraints into automated enforcement. Use for architecture tests, CI Gates, baseline ratchets, or rule exemptions.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Automated Architecture Enforcement

Automatically block only risks that are important, stable, objectively decidable, and controllable in false positives. Claim only what the tool can prove.

## Establish Enforcement Rules

1. State the architectural characteristic to protect and the concrete harm caused by its degradation.
2. Select one or more checks for that characteristic; do not force a one-characteristic-to-one-check mapping.
3. Document the scope, trigger, decision result, execution method, and capability boundary of every check.
4. Choose its location:
   - Stable, high value, low false-positive rate: put it in merge-request CI and allow it to block.
   - Requires contextual judgment: put it in a Review Checklist or ADR.
   - Infrequent or expensive: put it in specialized verification.
5. For a legacy project, establish a baseline first and block only new or worsened violations. Do not mechanically split or compress code merely to pass.
6. For every exception, record the rule, reason, scope, Owner, risk, review date, retirement condition, and tracking item.

## Gate Responsibilities

- **Static Gate:** formatting, Lint, types, and rules directly decidable by static tools.
- **Architecture Gate:** dependency direction, cycles, Owners, and static boundaries. It cannot prove runtime behavior.
- **Test Gate:** public behavior, state transitions, real components, or controlled integrations.
- **Preflight:** a fast local entry point that must share its decision implementation with CI; local success does not replace CI.
- **Toolchain-Evidence Gate:** pins tools and environments and preserves actual exit results, skipped items, and evidence locations.

For each Gate, state its inputs, outputs, blocking conditions, and behavior when it cannot decide. A skipped or unexecuted Gate—or one whose tooling failed—must not count as passed.

## Automation Boundaries

- For complex analysis, **prefer mature parsers, compilers, Lint frameworks, or dependency-graph tools**.
- If a decision requires nearly complete language semantics, narrow the supported scope or move it to human review instead of expanding a home-grown approximate compiler.
- Cyclomatic complexity, line count, dependency count, and distance from the main sequence are risk signals only; they cannot independently become decomposition targets.
- Static import checks prove only source dependencies. Shared databases, synchronous calls, transactions, and runtime orchestration require runtime evidence or architecture documentation.
- Monitoring constitutes architecture enforcement only when the objective, allowed deviation, and alert criteria are explicit.

## Completion Criteria

Deliver a mapping of “protected characteristic → check → execution location → result evidence → Owner,” and verify that each rule passes a compliant example and fails a real violating example. See `test-evidence` for judging evidence credibility.
