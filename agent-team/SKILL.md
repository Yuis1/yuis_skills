---
name: agent-team
description: Coordinate parallel agents, bounded task contracts, worktree isolation, and session handoffs. Use for concurrent workstreams or multi-angle reviews.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Organizing Parallel Work

## Decide Whether to Delegate

Follow the user's and active runtime's delegation limits first. Delegate only independent work whose benefit exceeds startup, handoff and integration cost. Routine planning stays with the parent; an advisor or committee needs a concrete unresolved question or an explicit request.

Root-only delegation remains the default: workers and reviewers report needed assistance back to their parent instead of spawning detached agents. When the user explicitly authorizes hierarchical delegation for large multi-subsystem efforts, designated domain leads may assign bounded tasks to direct workers; leaf workers do not delegate further.

Keep the root directly responsible for one critical workstream that materially advances the objective. Delegate concrete outcomes rather than a continuous stream of micro-tasks that reduces the root to status forwarding and sign-offs.

## Bind Workers by Task Contract

State the goal, inputs or candidate versions, read/write boundaries, acceptance checks, and escalation thresholds. Within this `Task Contract`, the worker drives autonomous closure on internal call-chain repairs, private adapters, and local tests without stopping for routine approvals.

Escalate to the parent only on critical side effects:
- introducing public protocol or cross-component API changes beyond the contract;
- accessing unauthorized network endpoints, cross-domain credentials, or elevated permissions;
- performing irreversible persistence migrations or destructive file overwrites;
- encountering execution denials like `dcg` or permission blocks. When blocked by false positives on operations confirmed safe within scope, decompose into targeted smaller commands or use `dcg` allowlist/allow-once; escalate genuine out-of-scope destruction risks.

Read `delegation-models` when available for unspecified model and effort defaults; explicit user choices win. Assign concrete domain methodologies, tools, and evidence standards for specialized angles (such as adversarial review or forensic verification); avoid cosmetic role-playing. Use the active runtime's exposed tool schema directly (`paseo`, Codex native delegation, or CLI).

## Isolate Writes and Permissions

- Assign at most one active writer per worktree, regardless of permission mode. Concurrent writers work in separate worktrees; reviewers remain read-only unless authorized otherwise.
- Grant permissions sufficient for the authorized task. Writing local test caches does not warrant host-level privileges; a mode label is not proof of isolation.
- Record the baseline commit SHA before branching, and verify HEAD and merge-base against it. For an existing branch or PR, verify the requested ref and comparison base directly.

## Continue, Recover and Finish

Reuse an existing session when its task, relevant context and permission boundary match. Use fresh context for independent adversarial review or substantially changed work; summarize evidence pointers when handing off.

Classify failures before retrying, and retry only safe transient operations within the task budget. If an external submission may have occurred, query its status or record uncertainty; never blindly resend. Handle missing inputs and tooling defects directly; a different model or arbitrary wait cannot cure a broken tool.

Deduplicate completion notifications and heartbeats by event ID or state hash. Absorb unchanged heartbeats idempotently without emitting repetitive narrative reports or re-dispatching identical work. A worker completion notification is a progress event, not proof that the root objective is complete. Review and integrate the result, check the remaining objective bottlenecks, and proceed with authorized work unless blocked by a genuine decision. Report at meaningful milestones, keep sessions available when follow-up is expected, and close them once accepted.
