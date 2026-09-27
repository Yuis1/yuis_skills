---
name: safe-refactor
description: Execute cross-module or long-running structural migrations through verifiable slices. Routine local refactors do not need this workflow.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Safe Refactoring

Advance refactoring through working vertical slices. Do not start multiple horizontal transformations that wait on one another.

## Before Changing Code

1. Freeze the behavior that must remain, current evidence, target structure, and explicit non-goals.
2. Draw the boundaries of the old and new paths, then find the smallest slice that can complete one real behavior end to end.
3. Record the baseline needed for this decision: affected callers, old entry points, dependency edges and current verification results. Do not create a counting system for its own sake.
4. Separate behavior changes from structural changes. When they cannot be separated, identify the new behavior and its independent evidence explicitly.

## Execution Cadence

Advance only one vertical slice at a time:

1. Establish the new path or compatibility bridge.
2. Migrate one real caller or one indivisible group of callers.
3. Run the smallest set of behavioral checks sufficient to verify that slice, along with any necessary structural checks.
4. At the end of a completed behavioral slice, confirm that old usage, dependencies or code decreased. An initial bridge can temporarily coexist if the slice has a bounded exit condition.
5. Establish a reviewable, recoverable checkpoint before the next slice. Commit when the authorized project workflow calls for it; respect a no-commit scope without adding a blanket approval prompt.

Independent dependency chains may proceed separately. Allow only one active structural transition on the same dependency chain. If multiple slices must all finish before any can pass, the work has already degraded into big-bang refactoring.

## Roll-Forward and Cleanup

- For data, protocol, or cross-version compatibility windows, follow the migration phases in `arch-evolve`. Every compatibility bridge needs an Owner, deadline, and deletion condition.
- Before deleting the old path, prove that every caller has migrated and the new path covers the public behavior.
- Clean up only imports, variables, functions, and compatibility layers orphaned by this refactoring. Track historical dead code separately.
- Prioritize high-risk correctness fixes. When a historical metric cannot be reduced safely, prevent new risk and register a time-bounded exception.

## Stop and Replan Immediately

- More than one slice is mutually blocked, preventing an intermediate state that passes verification.
- Making the new structure usable requires simultaneous changes to multiple unrelated business Owners.
- A supposedly completed slice only adds a framework or directory without migrating its intended callers.
- Acceptance scope keeps expanding, or the recovery path is still unclear.

See `arch-evolve` for architectural quanta, service decomposition, shared databases, and breaking data or protocol migrations. See `test-evidence` for selecting verification evidence and `review-evidence` for independent acceptance of complex, high-risk candidates.
