---
name: system-design
description: Design or review system structure. Use for boundaries, dependency direction, business Owners, or component decomposition.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# System Structure Design

The goal is for a change to touch only the parts that should change, while making critical business facts, dependency direction, and side-effect boundaries immediately visible.

## Workflow

1. **Identify axes of change:** list what this requirement changes, what must remain, and which external systems, data, and side effects it affects.
2. **Identify Owners:** give every business fact exactly one authoritative writer; mark caches, indexes, projections, and Read Models as rebuildable derivatives.
3. **Map boundaries and dependencies:** mark Domain, Application, driving adapters, infrastructure adapters, and the composition root. Source dependencies point toward more stable business policy, and the graph must remain acyclic.
4. **Check interface depth:** a boundary should hide a cohesive body of knowledge or external complexity, and make common use shortest and safest. Remove pass-through layers without semantic translation, Ports that mirror concrete implementations, and giant Resolvers.
5. **Check runtime boundaries:** state who owns transactions, consistency, concurrency, configuration, trust verification, and external side effects.
6. **Check evolution cost:** walk one representative change through the dependency graph and record the Owners, components, and deployment units that must change together.

## Non-Negotiable Constraints

- Layers are dependency constraints, not directory templates. Do not create an empty shell layer or formal Port when the corresponding responsibility does not exist.
- Domain and Application import no database, transport protocol, framework, or concrete adapter. Control flow may point outward, but source dependencies still point inward.
- Entry points perform only protocol parsing, authentication and authorization, validation, use-case invocation, serialization, and error mapping. Concrete implementation selection, construction, and lifecycle management belong only in the composition root.
- A consumer expresses an external capability through a minimal Port. An anticorruption layer must actually translate models, semantics, errors, and protocols.
- State with different lifecycle, transaction, consistency, or concurrency semantics must not share one Owner.
- Read and validate external configuration only at the startup boundary. Business code receives read-only configuration split by capability.
- Separate external side effects from internal facts. Do not write a final fact until the result is confirmed.

## Delivery Evidence

Produce at least:

- **Owner inventory:** authoritative facts, writers, and derivatives.
- **Dependency graph:** direction, boundaries, composition root, and exceptions.
- **Representative change walkthrough:** the modules, components, and deployment units that would change.
- **Risk inventory:** transactions, trust, side effects, migration, and anything still unverified.

## Read on Demand

- To decide component aggregation, dependency stability, or diagnose with the main sequence, read [COMPONENTS.md](COMPONENTS.md).
- For structural review or to identify shallowness, leakage, temporal decomposition, and related problems, read [REVIEW.md](REVIEW.md).
- For cross-version migration or runtime coupling, switch to `arch-evolve`.
- To encode constraints in CI, switch to `arch-guard`.
