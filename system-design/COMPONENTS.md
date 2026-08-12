[English](COMPONENTS.md) | [简体中文](COMPONENTS.zh-CN.md)

# Component Decomposition and Dependency Diagnosis

Read this only when deciding which code should be released and changed together, or when diagnosing component dependencies.

## Establish What a Component Is

A component is an independently deployable code artifact, such as a JAR, DLL, package, or collection of binaries. It is not an arbitrary directory, nor is it the same as a business boundary or a runtime-coupling unit.

Component structure evolves with reuse patterns and reasons for change. Do not draw a fixed component map before understanding what changes together and what is actually used together.

## Cohesion Principles

- **Reuse/Release Equivalence Principle (REP):** content reused together should be releasable together under a shared version.
- **Common Closure Principle (CCP):** place classes that change for the same reason and at the same time together. Most business systems prioritize reducing the maintenance change surface.
- **Common Reuse Principle (CRP):** do not force consumers to depend on content they do not need.

These principles are in tension: REP and CCP favor larger components, while CRP favors smaller ones. Trade off according to current evidence about change and reuse rather than seeking a permanent decomposition.

## Dependency Principles

- **Acyclic Dependencies Principle (ADP):** the component dependency graph must be a DAG. Break a cycle by inverting a dependency or extracting a new component for the concepts genuinely shared by both sides.
- **Stable Dependencies Principle (SDP):** dependencies point toward components in more stable positions. A component frequently pulled by external change should not become a prerequisite for many stable components.
- **Stable Abstractions Principle (SAP):** a component in a stable position should provide extensible abstractions; an unstable component should remain concrete and easy to change.

Stability describes dependency position, not frequency of change.

## Diagnostic Metrics

- `Fan-in`: the number of dependencies from types in external components to types inside this component.
- `Fan-out`: the number of dependencies from types inside this component to types in external components.
- Instability `I = Fan-out / (Fan-in + Fan-out)`, ranging from 0 to 1.
- Abstractness `A = number of abstract types / total number of types`, ranging from 0 to 1.
- Distance from the main sequence `D = |A + I - 1|`, ranging from 0 to 1.

A component with `D` near 1 merits review:

- stable and concrete: difficult to change and extend;
- unstable and highly abstract: abstractions with no consumers.

These values only locate risk and must not drive decomposition on their own. Prefer validation through a representative change: how many components would one real requirement modify, rebuild, and redeploy?

## Make Boundaries Enforceable

- Use language visibility, module systems, or source-tree isolation to enforce boundaries instead of making every type public.
- Top-level organization should expose business intent, not only framework layer names.
- Isolate infrastructure along business boundaries so delivery code in one area cannot bypass business rules and connect directly to another area's database.
