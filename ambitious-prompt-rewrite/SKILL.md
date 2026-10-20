---
name: ambitious-prompt-rewrite
description: Reframe and rewrite shallow, constrained prompts into ambitious, professional-grade directives using Altitude, Depth, and Range.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Ambitious Prompt Rewrite

The goal is to eliminate the ambition gap between human requests and model capabilities. Humans routinely constrain models to mundane tasks because of self-efficacy limits. This skill transforms shallow, task-oriented drafts into high-leverage prompts that operate across `Altitude`, `Depth`, and `Range`.

Use this skill when you have a prompt, task draft, or feature request that feels routine, local, or artificially constrained, and you want to unlock its highest-value formulation before execution.

## Rewriting Pipeline

1. **Deconstruct nouns into verbs:**
   - Strip away surface deliverables such as presentation decks, shell scripts, or database tables.
   - Extract the active verb, the causal story to prove, the behavioral shift required, and the decision to make under uncertainty.
2. **Elevate altitude (outcome over task):**
   - Identify the goal beyond the immediate goal: ask what must happen next.
   - Shift from asking the model to perform a single manual repair to designing a durable, self-sustaining loop that takes the human out of routine execution.
   - Specify the autonomous infrastructure the model needs to independently verify outcomes, such as reproduction environments, mapping tables, and raw trace access.
3. **Plunge into depth (expert instruments and outside judge):**
   - **Instruments of the best:** replace digested summaries or toy artifacts like Markdown tables with the rawest source material, statistical models, AST engines, or native profilers that field-leading experts use.
   - **Unreasonable goals made reasonable:** set aggressive performance or quality targets, such as sub-200ms latency, zero-crash guarantees, or full automated reproduction, and frame them as solvable constraints.
   - **Challenge assumptions:** instruct the model to adversarially verify common beliefs against raw data.
   - **Mandate an outside judge:** strictly prohibit in-loop self-evaluation. Where mechanical validation exists through test suites, compilers, or profilers, mandate it; where tasks lack mechanical quantification, bind evaluation to an independent judge such as an external script, human review criteria, or a separate model in an isolated evaluation session.
4. **Expand range (assemble the crew by methodology):**
   - Map the deconstructed verbs to orthogonal disciplines such as short sellers, forensic accountants, motion designers, or investigative journalists.
   - Demand their specific investigative methods and evidentiary standards, never superficial tone or role-playing jargon.
5. **Synthesize the rewritten prompt:**
   - Compile the elevated directives into a complete, self-contained prompt draft.

## Non-Negotiable Constraints

- The rewrite must produce higher leverage, not speculative complexity. Do not ask for empty frameworks, unneeded abstractions, or bloated microservices under the banner of ambition.
- Every rewritten prompt must mandate an outside judge. Prohibit in-loop self-evaluation; evaluation must come from an external tool, an explicit acceptance test, or an independent evaluator session.
- Strictly ban cosmetic role-playing. When bringing in multidisciplinary angles, mandate concrete tools and methodologies, not persona dialogue.
- Deliver only the ambition delta and the rewritten prompt without forcing premature downstream workflow dispatch.

## Delivery Format

Always deliver:

1. **Ambition Delta:**
   - *Core verbs:* the underlying action replacing the surface noun.
   - *Altitude shift:* the durable loop or outcome replacing the single task.
   - *Depth and outside judge:* the expert tools, raw data, and outside judge defined.
   - *Range addition:* the orthogonal disciplines and methodologies injected.
2. **Rewritten Prompt:**
   - Provide a clean, copy-ready prompt block containing the complete, elevated prompt.
