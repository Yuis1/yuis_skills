---
name: agent-team
description: Organize authorized parallel work, session handoffs and worktree writers. Routine single-agent tasks do not need a team.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Organizing Parallel Work

## Decide Whether to Delegate

Follow the user's and active runtime's delegation limits first. Delegate only independent work whose benefit exceeds startup, handoff and integration cost. Routine planning stays with the parent; an advisor or committee needs a concrete unresolved question or an explicit request.

Only the root agent delegates. Children and reviewers report missing help to their parent instead of creating further agents, including detached agents or agents started through another tool.

For a continuing objective, keep one consequential path under the root's direct ownership. Delegate outcomes that advance the objective, not a stream of tiny follow-ups that leaves the root only coordinating and accepting work.

## Give the Worker a Bounded Task

State the goal, input or candidate version, read/write scope, acceptance checks, prohibited side effects and expected return. Read `delegation-models` when available for unspecified model and effort defaults; explicit user choices win. Do not change the parent's model, the manual picker or global configuration to satisfy a worker assignment.

Use the current runtime's exposed tool schema and, for Paseo, its installed official `paseo` skill. Codex native delegation and Paseo creation have different interfaces; do not copy arguments between them or guess unavailable options. Workspace placement and parentage are distinct.

## Isolate Writes and Permissions

- Each worktree has at most one active writer, regardless of permission mode. Give concurrent writers separate worktrees; reviewers remain read-only unless authorized otherwise.
- Use permissions sufficient for the authorized task. A test writing cache files does not itself require unrestricted host access; a mode name is not proof of isolation.
- Before branching off, record the resolved baseline SHA and verify the new HEAD and merge-base against it. For an existing branch or PR, verify the requested ref and comparison base instead of requiring its HEAD to equal the base.

## Continue, Recover and Finish

Reuse a session when its task, relevant context and permission boundary still match. Use fresh context for independent review or substantially changed work; summarize evidence pointers when handing off, not automatically before every model change.

Classify failure before retrying. Retry only safe transient operations within the task's budget. If an external submission may have happened, query its status or report uncertainty; never blindly resend. Missing inputs and broken tools need their own fixes, not a stronger model or a fixed wait.

Use completion notifications when supported; make bounded status checks when notifications fail, a budget expires or the user asks. A worker completion notification is a result event, not a new user objective or a signal that the root objective is complete. Review and integrate the result, then recheck the original objective and choose the next action from its remaining bottlenecks. Continue authorized work unless the objective is complete, the user has paused it, or a decision is genuinely required. Report at meaningful milestones rather than ending a root turn for each worker result. Read results before archiving, and keep a session available when follow-up is expected. A worker task is complete when the parent has checked its result and recorded any remaining gap; that does not complete the root objective.
