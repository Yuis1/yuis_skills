---
name: arch-evolve
description: Plan breaking data or protocol migrations and changes that require coordinated deployment or recovery.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Architecture Evolution

Evolution does not replace an architecture all at once. Keep the system operable and verifiable at every stage, and identify exactly when an irreversible change occurs.

## Find the Real Coupling First

First identify what must change, deploy or recover together. An architectural quantum names such a runtime-coupled deployment unit; it is a diagnostic concept, not a reason to add coupling.

Do not judge evolutionary capacity from labels such as “monolith” or “microservices.” Enumerate:

- **Static dependencies:** source code, contracts, libraries, operating systems, and databases.
- **Dynamic interactions:** synchronous or asynchronous.
- **Consistency:** atomic transactions or eventual consistency.
- **Coordination:** central orchestration or service choreography.
- **Connascence:** when one part changes, which other parts must change with it to preserve correctness.

A shared database, orchestrator or synchronous UI can require coordinated changes. Check version compatibility, failure propagation and actual deployment requirements before concluding that services form one unit.

## Plan a Safe Migration

By default, split breaking data or protocol changes into three phases:

1. **Expand:** add the new structure or contract, retain the old path, and establish any necessary synchronization or compatibility mechanism.
2. **Migrate:** switch consumers one at a time; verify every step independently and continuously observe whether the old path is still in use.
3. **Contract:** remove the old structure and path only after every consumer has moved, the compatibility window has ended, and the evidence is complete.

If no concurrent consumers need compatibility and an authorized maintenance window is acceptable, a validated offline cutover can be simpler than dual writes.

This approach supports safe roll-forward; it does not guarantee that rollback is possible. Mark irreversible points—such as dropping tables or columns, discarding data, and retiring an old protocol—individually. Rollback capability must be proven item by item.

## Migration Discipline

- Version-control database changes. Add migrations; do not modify migrations that have already run.
- When separating a shared database, establish the data Owner first, migrate readers and writers next, and remove shared access last.
- Synchronization and dual writes require an explicit Owner, validation method, deadline, and deletion condition.
- Protect correctness, compatibility, and observability throughout the migration. Do not excuse current inconsistency by saying that the migration will eventually finish.
- Longer cycle time is a diagnostic signal: distinguish coupling from environment, requirement and review delays before changing the design.

## Delivery Evidence

One migration table can cover affected consumers, phases, acceptance checks, irreversible points, recovery and old-path exit conditions. See `system-design` for static structure, `safe-refactor` for migrating old code paths in verifiable slices, and `arch-guard` for continuous enforcement.
