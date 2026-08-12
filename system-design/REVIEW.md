[English](REVIEW.md) | [简体中文](REVIEW.zh-CN.md)

# System Structure Review Checklist

Read this only for structural review or when locating the source of complexity. Tie every finding to an actual call, dependency, or representative change; do not convict by terminology alone.

## Evidence of Complexity

- **Change amplification:** a small requirement demands changes in many places.
- **Cognitive load:** using a module requires understanding many internal details.
- **Unknown dependencies:** a maintainer cannot reliably determine who a change will affect.

Lines of code, file count, function length, cyclomatic complexity, and Diff size are risk signals only. Crossing a threshold should trigger review, not mechanical decomposition.

## Structural Warning Signs

- **Shallow module:** interface complexity approaches implementation complexity, so the module hides no important knowledge.
- **Information leakage:** one design decision is scattered across modules and must be changed in several places.
- **Temporal decomposition:** code is organized by execution order instead of shared knowledge and reasons for change.
- **Overexposure:** common use requires understanding rare configuration and internal details.
- **Pass-through layer:** a method forwards the same parameters to the next layer without translating semantics, policy, or errors.
- **General-purpose and special-purpose code mixed together:** specific business rules contaminate a general capability, or general details are scattered across business features.
- **Entangled modules:** understanding or changing one requires reading the other's internal implementation.
- **Hard to name, describe, or understand:** often indicates a poorly chosen responsibility or abstraction boundary.

Duplication is not automatic grounds for refactoring. First determine whether the duplicate code carries the same knowledge and must change together; inappropriate sharing can create stronger coupling than local duplication.

## Architecture Warning Signs

- Top-level directories expose framework layers but not business capabilities.
- Services deploy separately but share a database, synchronous UI, or central orchestration, so they must change together in practice.
- The database becomes a public interface across domains, and consumers depend directly on internal table structure.
- A Port mirrors a vendor or database API, leaving the business layer controlled by external semantics.
- An anticorruption layer forwards without translating models, semantics, errors, and protocols.
- Tests depend directly on extensive internal structure, causing structural changes to trigger widespread unrelated failures.

## Review Output

For each issue, record the affected Owner, the real change that exposes the problem, the leaked knowledge, proposed boundary, migration cost, and verifiable completion criteria.
