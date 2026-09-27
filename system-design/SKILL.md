---
name: system-design
description: Design or review cross-module ownership, dependencies and system boundaries. Local renames and routine edits do not need structural review.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# System Structure Design

The goal is for a change to touch only the parts that should change, while making critical business facts, dependency direction, and side-effect boundaries immediately visible.

Apply the project's documented architecture. Do not invent layers for absent responsibilities; a local edit alone does not require redesign. The constraints below remain the shared architecture baseline unless a project explicitly documents an exception.

## Workflow

1. **Identify axes of change:** list what this requirement changes, what must remain, and which external systems, data, and side effects it affects.
2. **Identify Owners:** give every business fact exactly one authoritative writer; mark caches, indexes, projections, and Read Models as rebuildable derivatives.
3. **Map boundaries and dependencies:** mark Domain, Application, driving adapters, infrastructure adapters, and the composition root. Source dependencies point toward more stable business policy, and the graph must remain acyclic.
4. **Check interface depth:** a boundary should hide a cohesive body of knowledge or external complexity, and make common operations as simple and safe as possible. Remove pass-through layers without semantic translation, Ports that mirror concrete implementations, and giant Resolvers.
5. **Check runtime boundaries:** state who owns transactions, consistency, concurrency, configuration, trust verification, and external side effects.
6. **Check evolution cost:** walk one representative change through the dependency graph and record the Owners, components, and deployment units that must change together.

## Non-Negotiable Constraints

- Layers are dependency constraints, not directory templates. Do not create an empty shell layer or formal Port when the corresponding responsibility does not exist.
- Domain and Application import no database, transport protocol, framework, or concrete adapter. Control flow may point outward, but source dependencies still point inward.
- Entry points perform only protocol parsing, authentication and authorization, validation, use-case invocation, serialization, and error mapping. Concrete implementation selection, construction, and lifecycle management belong only in the composition root.
- A consumer expresses an external capability through a minimal Port. An anticorruption layer must actually translate models, semantics, errors, and protocols.
- Separate authoritative write boundaries when lifecycle, transaction, consistency or concurrency semantics differ. A responsible team or domain can own several such boundaries; caches and projections remain derivatives.
- Read and validate external configuration at startup; business code receives read-only values split by capability. A project with explicit hot-reload requirements must define its validation and atomic activation boundary rather than letting business logic read arbitrary environment state.
- Record requested or pending external actions separately from confirmed outcomes. Do not record success before the external result is confirmed. Preserve observable errors, bounded recovery and idempotent retries.

- Keep external DTOs and internal persistence errors behind translating boundaries. Do not bypass dependencies with `sys.path`, import fallbacks, service locators or uncontrolled dynamic imports.
- Do no external I/O during module import. Catch broadly only at observable top-level, task-isolation or cleanup boundaries; retain the cause and make initialization failure, retries and degradation explicit.

- A page shell only composes the page. Each business feature owns its queries, state and mutations; do not centralize orchestration across business domains in a global page or data module.

## Delivery Evidence

Cover these points in the smallest useful artifact; a table and walkthrough may suffice:

- **Owner inventory:** authoritative facts, writers, and derivatives.
- **Dependency graph:** direction, boundaries, composition root, and exceptions.
- **Representative change walkthrough:** the modules, components, and deployment units that would change.
- **Risk inventory:** transactions, trust, side effects, migration, and anything still unverified.

## Read on Demand

- To decide component aggregation, dependency stability, or diagnose with the main sequence, read [COMPONENTS.md](COMPONENTS.md).
- For structural review or to identify shallowness, leakage, temporal decomposition, and related problems, read [REVIEW.md](REVIEW.md).
- For cross-version migration or runtime coupling, switch to `arch-evolve`.
- To encode constraints in CI, switch to `arch-guard`.
