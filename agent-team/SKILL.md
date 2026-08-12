---
name: agent-team
description: Organize delegation, sessions, and worktrees for parallel multi-Agent work.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Organizing Parallel Development

## Delegation Principle

Coase's theorem: delegate only when the benefit of a Sub-agent significantly exceeds the cost of delegation.

## Planning and Sessions

- During planning, use `paseo-advisor` or `paseo-committee` according to task difficulty, selecting among the strongest available ChatGPT, Claude, GLM, and other models.
- Prefer reusing a session when the task depends on continuing context, or when starting a new session would require reading many of the same files. For temporary network or rate-limit failures, send “continue” and wait ten minutes.
- Use a stronger model or reasoning level in the existing session when the current intelligence level cannot handle the task—for example, after more than three rounds of major rework on the same task. Compress the context before changing models.
- Start a new session when most of the context required by the task has changed.

## Permissions and Worktrees

- Codex: use `modeId=full-access` for writes or runtime verification; `auto` is sufficient for static review only.
- Paseo Worktree: record the baseline SHA first. After creation, verify that both `HEAD` and `merge-base` equal that SHA; do not trust the branch name alone.
- Only the Root Agent may delegate Sub-agents. By default, Sub-agents must not create, start, or delegate other Agents, including Paseo run/create and detached or root Agents; they ask the parent Agent when assistance is needed.
- Each worktree may have at most one full-access Writer at a time. Reviewers must not delegate further.
- Every task that must report back is created by the parent Agent with `relationship=subagent` and `notifyOnFinish=true`. Do not poll; archive the Agent promptly after completion.
