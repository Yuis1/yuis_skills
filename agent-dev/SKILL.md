---
name: agent-dev
description: Govern an Agent product's Prompts, models, Schemas, tools, and evaluations.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Agent Development

## Changes and Evaluation

- Changes to Prompts, models, Schemas, tools, and Agent orchestration must be versioned. Use the same evaluation set to compare gains, regressions, and cost.
- Do not disguise decisions that require semantic understanding as model decisions by using case-specific regexes, keywords, or fixed phrasing. Fixed protocols, identifiers, hard safety constraints, and auditable deterministic rules are exceptions.
- Do not ask an LLM to emit large blocks of code, structured content, or SVG in one pass. Prefer JSON plus templates; if it must emit code or large structured content, use multiple React rounds.

## Optimization Order

- When Agent behavior is unsatisfactory, do not patch or paper over it with more rule code. Optimize in this order:
  1. Check the input, context, and task boundary.
  2. Establish reproduction cases and an evaluation set.
  3. Improve the Prompt, Schema, and tools.
  4. Adjust model configuration.
  5. Adjust or add orchestration nodes only after demonstrating that the benefit exceeds the cost.

## Prompt Writing

- Use business language the role understands. Unless the role itself serves development, operations, or testing, do not expose internal module names, configuration-package names, implementation names, pipeline names, or debugging semantics.
- Optimize the KV Cache without changing meaning or message priority. Order Prompt content from most stable to least stable: invariant system rules → low-frequency context → medium- and high-frequency context → current-turn input.
- Remove deprecated fields, outputs that are always empty, and legacy model-specific formats from the Prompt. The runtime owns compatibility logic.
