---
name: review-evidence
description: Tier review evidence, generate unified machine facts, freeze candidate versions, and conduct independent verification. Use for high-risk acceptance or adversarial review.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Complex Review and Evidence

Tier evidence by task risk. Enforce proportional review overhead: internal test repairs, harness adaptations, and routine local refactors belong to Tier 0/1—verify via the author's local regression run (`git diff --stat` and passing tests) without spawning independent reviewer sub-agents or writing multi-page manifest packages. Reserve formal multi-agent review for Tier 3 candidates (public API breaking changes, security boundaries, or irreversible persistence cutovers). Emit review findings into ephemeral review output or PR summaries rather than cluttering repositories or scratch trees with persistent ceremony files.

## Freeze Acceptance Scope

Before review, establish one authoritative acceptance matrix for complex or high-risk candidates:

- behavioral contracts and their corresponding evidence;
- `must_remove`: old behavior, paths, or dependencies that must be removed;
- `must_retain`: behavior and data that must remain;
- `out_of_scope`: content explicitly excluded from this change;
- environment boundaries and runtime requirements; and
- the stop condition: which result is sufficient to conclude review.

The Reviewer verifies against this matrix rather than reinterpreting approved scope. New discoveries block only when they violate an existing contract, security baseline, data consistency, or production correctness; track everything else separately.

## Freeze Candidate and Machine Manifest

Complete self-review first, then freeze the candidate and emit a single machine-generated fact manifest. Formal evidence binds to:

- unambiguous candidate version and baseline commit SHA;
- affected change scope and dependency closure;
- execution environment, test inputs, and configuration flags;
- machine exit codes, pass/fail counts, and duration; and
- skipped items, known limitations, and remaining risks.

The machine manifest is the single source of truth for execution facts. Author, Reviewer, and Root cite anchors or hashes in this manifest under a zero hand-copying policy rather than manually duplicating SHAs, counts, or exit statuses across separate documents. When candidate code, inputs, or environments change, assess impact and rerun affected checks; reuse requires unchanged inputs.

## Independent Verification

Use fresh review context, specifications, and the machine manifest; passing author summaries into another model does not establish independence. The Reviewer executes:

1. Independently confirm change boundaries, Owners, and true dependency closures.
2. Sample critical verification commands by risk rather than mechanically repeating all tests.
3. Execute forensic test audits and contract checks: verify that assertions were not softened, skipped, or hardcoded to bypass failures, adding structural checks for boundary leakage, forwarding, and change amplification only where affected scope demands them.
4. Classify failures explicitly: regression in this change, pre-existing baseline defect, test-suite flaw, flaky test, environment breakdown, or unexecuted.
5. Record skipped, unexecuted, or under-evidenced items as “unproven”; do not report them as passed.

## Completion Criteria

Review is complete when every acceptance matrix item has candidate-bound evidence or an explicit gap, `must_remove` and `must_retain` are verified, and remaining risks have designated Owners. Mandatory checks must pass; any gap marks the candidate unproven unless an authorized, explicit exception accepts it. Report review completion, verification success, and exception acceptance as distinct states. See `test-evidence` for evidence capability boundaries, `system-design` for structural architecture review, and `agent-team` for reviewer session isolation.
