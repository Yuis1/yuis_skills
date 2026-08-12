[English](AGENTS.md) | [简体中文](AGENTS.zh-CN.md)

## Responsibilities

- This file defines only stable cross-project principles, standing safety constraints, and global tool preferences.
- The relevant Skill or project documentation owns procedures, review-package formats, test scope, baselines, thresholds, tool versions, and commands.
- Project-specific quality entry points, runtime environments, and exceptions must be documented in the project documentation or a project Skill.

## 1. Architecture and Governance

> Use `system-design` for system boundaries, dependencies, and business Owners; `codebase-design` for single-module interface design; `arch-evolve` for evolution and breaking migrations; and `arch-guard` for automated enforcement.

### Complexity and Boundaries

- Assess complexity by change amplification, cognitive load, and unknown dependencies. Lines of code, file counts, function length, cyclomatic complexity, and Diff size are only risk signals and must not drive decomposition on their own.
- Project thresholds trigger design review only. Do not mechanically split files, compress formatting, combine unrelated statements, hide assembly parameters, or extract tightly coupled Helpers merely to stay under a threshold.
- A module must hide a cohesive body of business knowledge or external complexity. Its interface should be markedly simpler than its implementation and make the common path the shortest and safest. Do not create semantically empty forwarding layers, Ports that mirror concrete implementations, or giant Resolvers.
- Each business fact must have exactly one authoritative write Owner. Caches, indexes, projections, and Read Models are rebuildable derivatives. Do not place state with different lifecycle, transaction, consistency, or concurrency semantics under the same Owner.
- Entry points are responsible only for protocol parsing, authentication and authorization, validation, use-case invocation, serialization, and error mapping. Concrete implementation selection, construction, and lifecycle management belong only in the composition root.

### Dependency Direction and Anticorruption

- Source dependencies point inward and remain acyclic: outer layers implement minimal Ports defined by inner layers, while business policy imports no database, protocol, framework, or concrete adapter. Control flow may point outward, but source dependencies still point toward the more stable policy.
- Layers are dependency constraints, not directory templates. When a responsibility does not exist, do not create an empty shell layer, a semantically empty forwarder, or a Port that exists only for formal completeness.
- Do not use `sys.path`, import fallbacks, service locators, or uncontrolled dynamic imports to bypass boundaries.
- Domains depend only on one another's public contracts. An anticorruption layer must actually translate models, semantics, errors, and protocols; external DTOs, ORM entities, and internal error types must not cross directly into the domain.

### State, Trust, and Side Effects

- Read and validate external configuration only at the startup boundary. Business code receives read-only configuration split by capability.
- Do not swallow exceptions. Broad catches are allowed only at top-level error boundaries, task-isolation boundaries, or resource-cleanup paths, and they must preserve the original cause and observable signals.
- Do not perform external I/O during module import. Fallbacks, retries, and degradation must be explicit, bounded, configurable, and testable; initialization or import failure must not trigger them implicitly.
- Treat external input as untrusted. If identity, authorization, policy, or a critical identifier cannot be verified, do not allow by default, relax constraints, or write an authoritative fact.
- Decisions affecting access, money, approval, or irreversible side effects must rely only on explicit, structured, auditable, authoritative facts, never on implicit inference from free text.
- Transaction, consistency, and concurrency boundaries must be explicit. The data layer enforces uniqueness, and retryable operations must be idempotent.
- Separate external side effects from internal facts. Provide queryable status, correlation identifiers, and explicit retry, recovery, or compensation paths; do not write a final fact until the result is confirmed.

### Contracts and Governance

- Cross-process data, long-lived persisted data, and machine output from models must have a single authoritative, versioned Schema. Unknown, missing, or invalid input must not pass by default.
- Data and protocol changes must be verifiable and migratable, with an explicit compatibility strategy, recovery path, and statement of whether rollback is possible. Temporary compatibility must have an Owner, deadline, and deletion condition.
- Put only high-value, stable, low-false-positive, reasonably maintainable rules into blocking CI. Do not disguise complex judgment as precise automation.
- Local Preflight and CI must share the same decision implementation. Legacy projects use a baseline ratchet that blocks only new or worsened violations.
- Every exemption must be versioned with its reason, scope, Owner, risk, review date, and retirement condition. Unexplained global ignores are forbidden.

## 2. Execution

Use first-principles reasoning when solving problems, fixing defects, designing architecture, or improving productivity workflows.

### Align Before Acting

- Align first on the objective, terminology, Owner, acceptance criteria, and non-goals. Non-code work may use `grill-me`; complex decisions that require user participation, such as PRDs, technical architecture, and domain modeling, use `grill-with-docs` and keep CONTEXT and ADRs synchronized. When using a `grill-*` Skill, ask 3–6 questions at a time.
- Use `prototype` for disposable validation of uncertain design questions. For large tasks, use `to-spec`, `to-tickets`, or `wayfinder` as needed; use `implement` when executing an established specification.
- Provide an implementation plan before changes involving a new dependency, public contract, persisted data, multiple Owners, multiple deployable units, a security boundary, or an irreversible side effect. Low-risk, reversible, local changes may proceed directly.

### Documentation Writing

- Use `chatgpt-chat` to supplement retrieval and research depth for: 1) overall planning and review before and after project initialization; 2) complex, deep, specialized, or broad information gathering, market research, and architecture evaluation; and 3) major decisions.
- MRDs, BRDs, PRDs, and technical architecture documents must use natural prose to explain the TL;DR, background, pain points, research, and decision rationale rather than presenting lists alone. Develop the overall argument progressively, explain terms absent from CONTEXT.md, and write in professional, idiomatic, coherent language.
- Specifications, development plans, and test plans may be more structured and use little prose.

### Occam's Razor

- Zero speculative code: do not implement features, extension points, configuration, or compatibility branches without a current requirement or validating evidence. Defensive handling required by external input, I/O, side effects, or an explicit error contract is not speculative code.
- Do not create an abstraction merely because it might be reused later. A single-implementation abstraction may exist when it serves a domain boundary, side-effect isolation, or an external-capability Port.
- Use the smallest complete closed loop—not the fewest files or lines—as the unit of change. Directly related tests, migrations, contracts, observability, documentation, and removal of the old path are all in scope.
- Clean up only imports, variables, and functions orphaned by the current change. Track historical dead code separately.

**Check: Can this change be reverted independently without entangling unrelated business behavior? Does every new structure have a current requirement or supporting evidence?**

### Information and Completion Evidence

- Repository state, version behavior, interface contracts, command results, and diagnostic conclusions must be supported by current retrieval or execution evidence; memory is not evidence.
- Preferred order: repository documentation, code, and tests → pinned local references under `~/dev/refs/` → project Skills and tools → official primary documentation → other sources. Use `research` for systematic investigation.
- Claim completion only from the actual Diff, fresh acceptance results, and remaining-risk assessment. If execution is interrupted, checks are skipped, or evidence is missing, report the work as incomplete or unproven.
- Separate runtime diagnostics, business audit records, and user errors. Logs, Traces, and multimedia evidence must be correlatable and reproducible, and must be redacted before persistence.
- Issues that span sessions, require repeated feedback, affect users, or may regress must enter a persistent source of truth and be deduplicated. Reopen the original record when the same issue recurs.

### Organizing Parallel Development (Root Agent Only)

- Use the `agent-team` Skill.

### Review

- Use `code-review` when a routine Diff needs review.
- Use `review-evidence` only for complex, high-risk work or when an independent adversarial review is required; do not turn a complete evidence package into a mandatory ritual for every task.

## 3. Development

### Frontend

- Write copy from the user's perspective. Unless the product is for developers, do not expose engineering terminology.
- Use `gpt-taste` to improve frontend taste with ChatGPT models and `design-taste-frontend` with other models; combine either with `redesign-existing-projects` when modernizing an existing project.
- A Page Shell only composes the page. Each business Feature owns its queries, state, and Mutations; do not centralize orchestration across multiple business domains in one page or global data module.

### Agent Development

- Use `agent-dev` when adding or changing Prompts, models, Schemas, tools, orchestration, or evaluations.

### Third-Party Integrations

- Read official documentation first, prefer public supported capabilities and best practices, and minimize custom adaptation.
- Do not depend on a provider's unpublished protocols or internal identifiers.
- When a third-party defect is found, check official Issues, release notes, and community solutions first. Temporary patches must be reversible and track the upstream fix.

### Comments

- Comments explain reasons, invariants, intent, and decision context that the code cannot express itself; they do not restate the code.
- Interface comments must let consumers use the interface correctly without reading its implementation. Do not pollute interface documentation with implementation details.
- Maintain comments with the code; correct or remove stale and misleading comments.
- Domain terminology in comments must match the authoritative names in code and documentation so it remains searchable.

## 4. Testing and Fixes

### Testing and Verification

- Production behavior changes use `tdd` by default, advancing one vertical slice at a time. Reproducible defects require regression tests.
- Before the target behavior is implemented, the test should fail because that behavior is absent—not merely because a filename, source string, or internal structure changed.
- Use `test-evidence` to select evidence for configuration, documentation, dependencies, CLI behavior, infrastructure, static boundaries, or legacy-test migrations; do not add sham tests merely to manufacture a “red first” stage.
- Before completion, provide fresh evidence tied to the current change. If it cannot run in a supported environment, report the evidence gap, actual result, and remaining risk; do not mark it as passed.

### Defect Fixes

- Use `diagnosing-bugs`: reproduce the problem and locate its root cause before making the smallest complete fix and verifying the regression.
- Do not fix a defect by sacrificing user experience. If the fix would change user experience, evaluate alternatives and obtain user approval first.

## 5. Refactoring

- Use `improve-codebase-architecture` to identify and assess refactoring opportunities; use `safe-refactor` to execute cross-module refactoring.
- Advance refactoring in working vertical slices. Allow only one active structural transition on a dependency chain; every slice must be independently verifiable, stoppable, and recoverable.
- Do not start multiple horizontal transformations that wait on one another. “The new framework exists, but the old path has not shrunk” is not progress.

## 6. Reporting

Use terminology from CONTEXT.md wherever possible and explain the work clearly enough for someone who has not read the code.

- If a term does not appear in CONTEXT.md, explain it before using it.
- Keep reports compact: do not restate the problem or pile up background.

Report in this order:

1. Business change
2. Affected pages or modules
3. Modified files
4. Evidence, risks, and follow-ups

## Runtime Constraints

- Spend time thinking; you do not need to use the commentary channel to report progress to me.
- DO NOT send optional commentary. If a higher-level instruction requires progress updates, output only one necessary status line—no fragments of reasoning, repeated plans, or optional commentary.
- Use `trash-cli` to delete files. Permanent deletion, `git reset`, `git restore`, `git clean`, and other dangerous operations require the user's explicit approval first.
- Resolve merge or rebase conflicts with `resolving-merge-conflicts`, hunk by hunk according to both sides' original intent; do not use `--abort`.
