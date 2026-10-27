---
name: agent-team
description: Coordinate parallel agents, two-tier domain leads, bounded task contracts, worktree isolation, and session handoffs. Use for concurrent workstreams or multi-angle reviews.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Organizing Parallel Work

## Decide Whether to Delegate

Follow the user's and active runtime's delegation limits first. Delegate only independent work whose benefit exceeds startup, handoff and integration cost. Routine planning stays with the parent; an advisor or committee needs a concrete unresolved question or an explicit request.

Root-only delegation remains the default: workers and reviewers report needed assistance back to their parent instead of spawning detached agents. When the user explicitly authorizes hierarchical delegation for large multi-subsystem efforts, designated domain leads may assign bounded tasks to direct workers; leaf workers do not delegate further.

Operate root orchestration strictly on the Control Plane (objective convergence, cross-domain contract locking, acceptance adjudication, and asset retirement). Separate all Data Plane execution (leaf implementation, local repairs, and test runs) to bounded workers. The root adjudicates delivery based on real product behavioral verification, never letting internal monitoring harness noise or fragile governance probes hold delivery hostage.

Enforce an Anti-Bureaucracy Ratchet: meta-work (task tracking, contract negotiation, review reports, and harness repair) exists strictly to de-risk product delivery, never as an accumulating asset. Prohibit generating persistent ceremonial closeout files, sample dumps, or multi-stage metadata artifacts in the workspace or temporary directories; convey handoffs through ephemeral structured outputs and concise commit summaries. Trigger a Meta-Work Circuit Breaker when consecutive integration commits fail to advance product code paths (consumed entirely by harness fixes, port collisions, or review loops): the orchestrator must halt parallel delegation, collapse harness complexity into a minimal direct runner, and restore focus to primary product delivery.

## Two-Tier Orchestration and Domain Leads

When fast-paced parallel development requires coordinating multiple subsystems (such as client, server, data, QA, and infrastructure), deploy a two-tier orchestration hierarchy capped at a strict depth of two:

1. **Root Orchestrator (Tier 1):** locks cross-domain public schemas, partitions 2–4 architectural domains, appoints high-reasoning Domain Leads, and adjudicates milestone integrations. The root never implements leaf code, nor does it inspect raw leaf logs.
2. **Domain Leads (Tier 2):** high-reasoning models (such as Sol or Astra) holding ownership over a single architectural domain. Each lead decomposes domain goals into atomic slices, coordinates 3–6 direct leaf workers, provides isolated scratch environments, and runs domain-level verification gates. Leads do not mutate shared public schemas unilaterally. Root and Domain Leads enforce Decentralized Leaf Autonomy: they verify definitions of done and final black-box acceptance, while local scratch configurations, ephemeral port allocations, and internal harness implementations remain fully decentralized to executing workers without serial micro-management.
3. **Leaf Workers (Tier 3):** execute single bounded task contracts within dedicated worktrees. Leaf workers are hard-blocked from spawning further sub-agents (zero recursive delegation).
4. **Cascading Digest Isolation:** leaf workers submit only structured handoff manifests (`git diff --stat`, test commands, exit codes, and output summaries) to their Domain Lead; Domain Leads aggregate verified progress into concise milestone digests for the Root Orchestrator.
5. **Hierarchical Worktree Lifecycle:** the mainline integrates domain branches; each Domain Lead operates one domain integration worktree; each leaf worker operates an ephemeral worktree. When a leaf task merges into the domain branch, its worktree and branch are immediately deleted. When a domain milestone merges to mainline, the root tags the recovery commit and retires the domain worktree.
6. **Domain Deadlock Circuit Breaker:** when two consecutive leaf workers fail on the same task or oscillate between conflicting fixes, the Domain Lead halts the workstream, isolates the failed technical hypothesis, and escalates to the root for architectural re-adjudication.

## Bind Workers by Task Contract

State the goal, inputs or candidate versions, read/write boundaries, acceptance checks, escalation thresholds, and the asset disposition plan (target integration line, recovery tag if needed, and retirement condition for the branch and worktree). Within this `Task Contract`, the worker drives autonomous closure on internal call-chain repairs, private adapters, local tests, and test harness fixes without stopping for routine approvals. Autonomous closure explicitly includes repairing internal verification scripts, test controllers, and scratch artifacts; never escalate internal test tooling repairs to the user unless crossing critical side-effect boundaries. Uphold Single-Command E2E Primacy: subsystem and decoupled slice passes (backend units, UI component mocks) are intermediate proofs, but zero milestone progress is claimed until a single command executes the unmocked end-to-end user path.

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
- Manage worktree lifecycles as ephemeral leases. Assign distinct scratch ports, socket paths, or temporary databases to concurrent worktrees to avoid runtime collision. Remove completed or abandoned worktrees to release branch locks, metadata, and disk space; prune stale worktrees before spawning new parallel writers.
- Decouple source preservation, active branches, and working directories. Preserving history requires commit SHAs or lightweight tags, not long-lived active branches or persistent checkouts. A HOLD on pending assets must isolate specific files with explicit release conditions, rather than indefinitely freezing entire worktrees or branches.

## Continue, Recover and Finish

Favor stateless, short-lived worker sessions scoped to single atomic Task Contracts over continuous multi-hour sessions prone to context rot. Reclaim worker sessions upon task acceptance; reuse an existing session only when the task, relevant context, and permission boundary remain strictly identical. When handing off the orchestrator role to a successor session, pause or cancel the predecessor's active goals and recurring heartbeats to prevent split-brain dual orchestration.

Classify failures before retrying, and retry only safe transient operations within the task budget. Trigger a context poisoning circuit breaker upon repeated repair failures or oscillating diffs: rather than compounding failed reasoning in the same session, revert to the baseline, isolate the specific negative constraint, and execute a clean-room reboot with a fresh session. If an external submission may have occurred, query its status or record uncertainty; never blindly resend. Handle missing inputs and tooling defects directly; a different model or arbitrary wait cannot cure a broken tool.

Protect the root orchestrator from context bloat: root inspects only structured handoff manifests, exit statuses, and `git diff --stat`, while raw child reasoning and build streams remain isolated in worker logs. Deduplicate completion notifications and heartbeats by event ID or state hash. Absorb unchanged heartbeats idempotently without emitting repetitive narrative reports or re-dispatching identical work. A worker completion notification is a progress event, not proof that the root objective is complete. Review and integrate the result, check remaining bottlenecks, and proceed with authorized work unless blocked by a genuine decision. Report at meaningful milestones. Pair integration with retirement: a worker task is complete only when its branch is merged or tagged for recovery, and its ephemeral worktree is deleted; prevent the creation rate of temporary environments from permanently outpacing retirement.
