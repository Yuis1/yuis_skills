---
name: system-design
description: Map business owners, dependency direction, isolation boundaries, and lifecycle ownership. Use for module design, interface boundaries, or structural review.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# System Structure Design

The goal is for a change to touch only the parts that should change, while making critical business facts, dependency direction, and side-effect boundaries immediately visible.

Apply the project's documented architecture. Instantiate layers only for active responsibilities; a local edit alone does not require structural redesign. The constraints below remain the shared architecture baseline unless a project explicitly documents an exception.

## Workflow

1. **Identify axes of change:** list what this requirement changes, what must remain, and which external systems, data, and side effects it affects.
2. **Identify Owners:** give every business fact exactly one authoritative writer; mark caches, indexes, projections, and Read Models as rebuildable derivatives.
3. **Map boundaries and dependencies:** mark Domain, Application, driving adapters, infrastructure adapters, and the composition root. Source dependencies point toward more stable business policy, and the graph must remain acyclic.
4. **Check interface depth:** a boundary should hide a cohesive body of knowledge or external complexity, and make common operations simple and safe. Remove pass-through layers without semantic translation, Ports that mirror concrete implementations, and oversized Resolvers.
5. **Check runtime and lifecycle boundaries:** state who owns transactions, consistency, concurrency, configuration, process lifecycles, and external side effects. For multi-process or system interactions, mandate controlled isolation rather than uncoordinated host-wide observation.
6. **Check evolution cost:** walk one representative change through the dependency graph and record the Owners, components, and deployment units that must change together.

## Non-Negotiable Constraints

- Layers represent dependency boundaries rather than directory templates. Instantiate layers and formal Ports only when distinct responsibilities exist.
- Domain and Application remain pure business logic, depending only on domain models and abstractions while keeping frameworks and concrete adapters external.
- Entry points perform only protocol parsing, authentication and authorization, validation, use-case invocation, serialization, and error mapping. Concrete implementation selection, construction, and lifecycle management belong only in the composition root.
- Consumers express external capabilities through minimal Ports. Anticorruption layers must actively translate models, semantics, errors, and transport protocols.
- Authoritative write boundaries separate whenever lifecycle, transaction, consistency, or concurrency semantics differ. One responsible domain may own multiple write boundaries; caches and projections remain derivatives.
- Validate external configuration at startup boundaries; business code receives immutable values split by capability. Hot-reload requirements require explicit validation and atomic activation boundaries rather than letting business logic read ambient environment state.
- Track requested or pending external actions separately from confirmed outcomes; record success only upon positive confirmation. Preserve observable errors, bounded recovery, and idempotent retries.
- Isolate process and resource lifecycles within controlled boundaries. Verify behavior through dedicated sandboxes or supervised trees rather than heuristic polling across shared host resources.
- Keep external DTOs and persistence errors behind translating boundaries. Declare dependencies explicitly without bypassing them via `sys.path`, fallback imports, service locators, or uncontrolled dynamic loading.
- Keep module imports side-effect-free, deferring external I/O and lifecycle activation to composition root execution. Catch exceptions broadly only at observable top-level, task-isolation, or cleanup boundaries, preserving the original cause.
- Page shells compose layout and navigation only. Each feature owns its queries, state, and mutations, keeping domain orchestration decentralized.

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
