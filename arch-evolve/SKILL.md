---
name: arch-evolve
description: Plan system evolution and breaking migrations. Use for architectural quanta, service coupling, shared databases, or Expand-Contract.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Architecture Evolution

Evolution does not replace an architecture all at once. Keep the system operable and verifiable at every stage, and identify exactly when an irreversible change occurs.

## Find the Real Coupling First

An architectural quantum is an independently deployable artifact with:

- high functional cohesion;
- high static coupling; and
- synchronous dynamic coupling.

Do not judge evolutionary capacity from labels such as “monolith” or “microservices.” Enumerate:

- **Static dependencies:** source code, contracts, libraries, operating systems, and databases.
- **Dynamic interactions:** synchronous or asynchronous.
- **Consistency:** atomic transactions or eventual consistency.
- **Coordination:** central orchestration or service choreography.
- **Connascence:** when one part changes, which other parts must change with it to preserve correctness.

A shared database, a central orchestrator, or a UI synchronously and tightly coupled to every service often compresses multiple services into one quantum. Independent deployment does not automatically mean independent evolution.

## Plan a Safe Migration

By default, split breaking data or protocol changes into three phases:

1. **Expand:** add the new structure or contract, retain the old path, and establish any necessary synchronization or compatibility mechanism.
2. **Migrate:** switch consumers one at a time; verify every step independently and continuously observe whether the old path is still in use.
3. **Contract:** remove the old structure and path only after every consumer has moved, the compatibility window has ended, and the evidence is complete.

This is safe roll-forward, not a rollback guarantee. Mark irreversible points—such as dropping tables or columns, discarding data, and retiring an old protocol—individually. Rollback capability must be proven item by item.

## Migration Discipline

- Version-control database changes. Add migrations; do not modify migrations that have already run.
- When separating a shared database, establish the data Owner first, migrate readers and writers next, and remove shared access last.
- Synchronization and dual writes require an explicit Owner, validation method, deadline, and deletion condition.
- Protect correctness, compatibility, and observability throughout the migration. Do not excuse current inconsistency by saying that the migration will eventually finish.
- Persistently increasing cycle time indicates slower evolutionary feedback; reduce slice size or coupling.

## Delivery Evidence

Produce a quantum map, coupling inventory, migration phases, acceptance criteria for every phase, irreversible points, recovery strategy, and old-path deletion conditions. See `system-design` for static structure, `safe-refactor` for the execution cadence of code-level old-path migration, and `arch-guard` for continuous enforcement.
