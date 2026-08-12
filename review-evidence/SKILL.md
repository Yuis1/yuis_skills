---
name: review-evidence
description: Freeze acceptance scope and produce reproducible evidence for complex tasks. Use for independent review or high-risk acceptance.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Complex Review and Evidence

Use this only for complex, high-risk work or work that requires independent adversarial review. Routine changes do not need a complete evidence package.

## Freeze Acceptance Scope

Before review, establish one authoritative acceptance matrix containing:

- behavioral contracts and their corresponding evidence;
- `must_remove`: old behavior, paths, or dependencies that must disappear;
- `must_retain`: behavior and data that must remain;
- `out_of_scope`: content explicitly excluded from this change;
- environment boundaries; and
- the stop condition: which result is sufficient to end the review.

The Reviewer verifies against this matrix rather than reinterpreting the approved scope. A new discovery blocks only when it violates an existing contract or concerns security, data consistency, or production correctness; track everything else separately.

## Freeze the Candidate Version

Complete the structural and contract self-review first, then freeze the candidate. Formal evidence must be tied to:

- the current Commit or another unambiguous candidate version;
- the baseline and affected scope;
- the runtime environment and verification input;
- exact commands, actual results, and exit status; and
- skipped items, evidence gaps, and remaining risk.

When the Commit, baseline, environment, or verification input changes, the old evidence becomes invalid immediately. Do not manually copy facts a tool can generate—such as SHAs, counts, and exit results—into a second authoritative source.

## Independent Verification

The Reviewer starts from the acceptance matrix and evidence package:

1. Independently confirm the change scope, Owners, and true dependency closure.
2. Sample critical commands by risk instead of mechanically rerunning every command.
3. Check behavioral contracts as well as boundary leakage, pass-through layers, implicit call order, and representative change amplification.
4. Classify each failure explicitly as a regression in this change, historical baseline, test defect, flaky failure, environment failure, or not executed.
5. When work is skipped, not executed, or under-evidenced, state “unproven”; do not report it as passed.

## Completion Criteria

Every item in the acceptance matrix has evidence tied to the current candidate or an explicit gap; all `must_remove` and `must_retain` items have been checked; and every remaining risk has an Owner. See `test-evidence` for evidence capability, `system-design` for structural architecture review, and `agent-team` for session and permission isolation of independent Reviewers.
