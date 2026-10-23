---
name: agent-dev
description: Govern agent prompts, model evaluations, tool contracts, and orchestration loops. Use for agent capabilities, evaluation benchmarks, or behavioral regressions.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Agent Development

## Define and Verify the Change

Version prompt, model, schema, tool, and orchestration changes. Establish behavioral evaluation benchmarks with representative cases, and compare candidates on identical inputs to measure regressions, cost, and evidence gaps.

Diagnose inputs, context, tools, and task boundaries before adding prompt instructions. Fix known root causes directly with deterministic tools rather than stacking brittle prompt patches. When designing agents for recurring failure modes, provide autonomous verification foundations—such as raw trace fetchers, commit-state mappings, and sandboxed reproduction environments—so the model can independently reproduce, fix, and verify.

Reserve semantic judgment for semantic decisions. Deterministic parsing, state indexing, authorization checks, and auditable protocol rules remain deterministic code, avoiding brittle keyword matching disguised as model reasoning.

## Generate and Inspect Useful Units

Choose generation unit size from task scope and available validation feedback. Complete files or mechanical transformations can generate in one pass; split uncertain or long work into independently checkable units, inspecting each result before proceeding. Use JSON with trusted schemas only when repeating structures warrant them. Enforce genuine tool execution evidence, disallowing simulated tool output or model self-certification.

## Keep Prompts Relevant

Frame instructions around the role's domain vocabulary, omitting implementation internals unless needed for tool calling. Prune deprecated fields, permanently empty outputs, and obsolete provider formats. Rely on deterministic runtime tools for state tracking, timeouts, and logging rather than descriptive prompt bloat.

Keep reusable instructions stable where useful, preserving instruction priority and semantics without distorting behavior for cache savings. Verify provider caching behavior before claiming performance gains.

Deliver verified behavioral deltas, comparative eval results, actual execution evidence, and remaining limits. Use `test-evidence` for configuration or integration claims; model availability alone does not prove task quality.
