---
name: agent-dev
description: Change agent prompts, models, tool contracts or orchestration and compare behavior. Ordinary application edits do not require this workflow.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Agent Development

## Define and Verify the Change

Version prompt, model, schema, tool and orchestration changes. Identify the intended behavior, a representative case and the failure to address or cost to reduce; compare candidates on the same relevant inputs and report regressions and evidence gaps.

Diagnose inputs, context, tools and the task boundary before adding prompt rules. Fix a known cause directly; add an orchestration step only when its measured benefit warrants the extra work. Follow existing model policy rather than maintaining a separate set of defaults.

Use semantic judgment for semantic decisions. Deterministic parsing, identifiers, authorization checks and auditable protocol rules remain deterministic; do not dress brittle keyword matching up as model reasoning.

## Generate and Inspect Useful Units

Choose output size from the task and the available validation feedback. A complete file or mechanical transformation can be generated in one pass. Split uncertain or long work into independently checkable units, inspect each result and continue. Use JSON with trusted templates only when a repeated structure benefits from that approach. Never substitute simulated tool output for execution evidence or require disclosure of private reasoning.

## Keep Prompts Relevant

Use language the intended role understands. Mention implementation-specific names only when they help that role make a decision. Remove deprecated fields, permanently empty outputs and obsolete provider formats; the runtime owns compatibility.

Keep reusable instructions stable where useful, without changing meaning or instruction priority for cache savings. Verify provider caching behavior before claiming a performance gain.

Deliver the behavior change, comparison cases, actual results and remaining limits. Use `test-evidence` for configuration or integration claims; model availability alone does not prove task quality.
