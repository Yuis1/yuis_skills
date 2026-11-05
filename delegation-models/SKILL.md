---
name: delegation-models
description: Choose default model and reasoning effort when creating agent teams or sub-agents. Apply alongside agent-team for delegated work. Does not control manual sessions or UI model selection.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Defaults for Delegated Work

Use these defaults only when the user has not specified the delegated agent's model or effort. Respect explicit user selections. Do not change the parent's model, effort, or manual model picker.

This skill does not authorize delegation; follow the active delegation and team rules first.
Do not force a named role. Keep fast mode off unless explicitly requested.
Prefer native Pi execution (`pi`) across all models and sub-agents for unified session streaming and higher execution efficiency. In Paseo, configure provider `pi` across OpenAI Codex, Antigravity, and DeepSeek models alike.

## Model Specialization by Domain

Frontier engineering research and SlopCodeBench empirical studies demonstrate that applying heavy reasoning models unconditionally produces severe verbosity expansion, self-debate spirals, and over-defensive boilerplate. Effective multi-agent orchestration pairs models by cognitive archetype:

1. **Top-Level System Architecture & Invariant Modeling:**
   - Use `pi/openai-codex/gpt-6-astra` (defaults to `high`; reserve extreme reasoning like `xhigh` strictly for hardcore deadlocks).
   - Produce formal types, state machines, and interfaces (`Schema-as-Spec`), not speculative natural language.
2. **Architecture Review & Slop Reduction:**
   - Use `pi/antigravity/gemini-3.8-flash` (via Pi's native Antigravity extension, not standalone Antigravity CLI; thinking: `high`).
   - Leverages true 1M+ context to review global dependencies, actively pruning over-defensive branches, redundant validation shims, and accidental complexity before code generation.
3. **Development Planning & Scope Decomposition:**
   - **Primary Planning Engine:** use `pi/deepseek-official/deepseek-flash` (thinking: `high`; fallback to other DeepSeek providers like `codebuddy/deepseek-v4.1-flash`). Directly drives end-to-end milestone roadmaps, cuts legacy deadweight, anchors single-command E2E proofs, and decomposes active milestones into 3–6 atomic task contracts (< 300 line diffs).
   - **Advisory Invariant Reference:** consult `pi/openai-codex/gpt-6-astra` via `/skill:paseo-advisor` for supplementary reference on domain invariant boundaries and state-machine transitions. Astra acts strictly as an advisory consult, not as a mandatory blocking gatekeeper.
4. **Tactical Orchestration (Tier 1 Root & Tier 2 Domain Leads):**
   - Use `pi/deepseek-official/deepseek-flash` (native Pi provider).
   - Operates with a native 1M (`1000000`) context window. Capitalizes on asymmetric causal architecture and high prefix-caching hit rates. Delivers concise task contracts, rapid re-planning, and strict definition-of-done gates without hallucinating unrequested edge cases.
5. **Hardcore Troubleshooting & Deadlock Breaking:**
   - Consult `pi/openai-codex/gpt-6-astra` (thinking: `high`) via `/skill:paseo-advisor` as a focused read-only advisor for deep concurrency races, protocol subtleties, or irreducible deadlocks. The tactical lead retains full orchestration control throughout without transferring ownership or handing off the task.
6. **Copywriting, Marketing, Product Documentation & Research:**
   - Use `pi/antigravity/gemini-3.8-flash` (routed through Pi's Antigravity extension; thinking: `medium` for copy, `high` for PRD and literature research).
   - Natural phrasing, zero code-defense bias, and high synthesis throughput across large document sets.
7. **Code Implementation & Local Refactoring:**
   - Use `pi/openai-codex/gpt-6.1-terra` (thinking: `high`) or `pi/deepseek-official/deepseek-flash`.
   - Focus on vertical slice TDD, happy-path primacy, and clean-room ephemeral sandboxes.
8. **Gateway Limitation Boundary:**
   - Third-party model packaging via multi-tenant proxy gateways (such as multi-tenant IDE AI suites) often truncates context windows to 16k–32k tokens and applies lossy background compression. Do not assign gateway-proxied third-party models as global orchestrators or multi-file planners; reserve them for localized single-file edits.

## Delegation Default Matrix

| Delegated Work | Default Model | Reasoning Effort | Guidance |
| --- | --- | --- | --- |
| Top-level architecture | `pi/openai-codex/gpt-6-astra` | `high` | Model core schemas, state machine enums, and invariants. Defaults to `high`; reserve `xhigh` for hardcore deadlocks. |
| Architecture review | `pi/antigravity/gemini-3.8-flash` | `high` | Review Astra drafts across global context; prune speculative defenses and accidental complexity. |
| Development planning | `pi/deepseek-official/deepseek-flash` | `high` | Drive milestone roadmaps, happy-path slices (< 300 lines), and single-command E2E. DeepSeek fallback. |
| Plan advisory consult | `pi/openai-codex/gpt-6-astra` | `high` | Optional advisory consult on invariant boundaries via `/skill:paseo-advisor`; non-blocking. |
| Tactical task decomposition | `pi/deepseek-official/deepseek-flash` | `high` | Slice current milestone into 3–6 atomic task contracts (< 300 lines) under single-command E2E. |
| Tactical orchestration | `pi/deepseek-official/deepseek-flash` | `high` | Dispatch micro-waterfall slices, enforce definition of done, and perform rapid re-planning without bloat. |
| Hardcore troubleshooting | `pi/openai-codex/gpt-6-astra` | `high` | Consult via `/skill:paseo-advisor` for read-only second opinions on deep concurrency and deadlocks without transferring orchestration control. |
| Copywriting & marketing | `pi/antigravity/gemini-3.8-flash` | `medium` | Natural human tone, engaging copy, and zero code-defense boilerplate. |
| Product docs & PRDs | `pi/antigravity/gemini-3.8-flash` | `high` | Synthesize user journeys, feature specifications, and clear acceptance boundaries. |
| Research & literature | `pi/antigravity/gemini-3.8-flash` | `high` | Macro-survey across long documents and web evidence; consult `chatgpt-chat` when extensive online search is required. |
| Code implementation | `pi/openai-codex/gpt-6.1-terra` | `high` | Implement happy path first under single-command E2E constraints. |
| Small tasks & metadata | `pi/openai-codex/gpt-6.1-terra` | `low` | Bounded single-file edits, commit messages, and metadata updates. |
