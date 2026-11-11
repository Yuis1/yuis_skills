---
name: iac-control-plane
description: Establish, scaffold, change, and govern Infrastructure-as-Code (IaC) control planes, multi-cloud resources, machine configurations, and operational policies. Use for IaC scaffolding, playbook structure, safe change boundaries, secret isolation, or human-machine co-reading infrastructure documentation.
---

[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# Infrastructure as Code Control Plane Governance

Establish and govern infrastructure repositories as reproducible control planes. Declarative code specifies target intent, live operational health requires fresh evidence, and changes remain bounded by strict blast-radius controls.

## Entry Gate

- Boundary establishment or expansion (new repository, cloud tenant, or IaC root): read [SCAFFOLD.md](SCAFFOLD.md) for topology, variable hierarchy, and secret scaffolding.
- Mutating within established boundaries: follow the operational lifecycle workflow below for changes, maintenance, and verification.
- Adopting existing resources or recovering unconfirmed state: reconcile live facts and state before generating a plan.

## Operational Lifecycle Workflow

1. **Classify Scope and Route by Boundary:** Map the operational intent to its authoritative source: declarative configs, machine inventories, host standards, cloud runbooks, state policies, or secret boundaries. Never maintain a duplicate copy of operational policy or live host state.
2. **Inspect Callers and Preconditions:** Distinguish target configuration from dated observations. Inspect existing maintenance backlogs for unresolved defects before editing. Isolate target changes, preserve existing worktree modifications without unapproved cleanups, and verify environment capabilities and authorizations.
3. **Isolate Secrets and Contain Blast Radius:** Scope mutating playbooks through narrowed inventories with explicit `--limit` target flags and batching via `serial`. Isolate multi-cloud OpenTofu/Terraform roots by trust boundary. Keep credentials within local or secret-manager boundaries.
4. **Preflight and Context-Bound Minimal Changes:** Run syntax checks (`--syntax-check`) and bind read-only plan files (`tofu plan -out=tfplan`). Plan files contain sensitive data; store them privately, exclude via `.gitignore`, record `plan_sha256` in evidence, and apply strictly against the bound digest, target identity, and state location.
5. **Verify Direct Evidence and Close Backlog:** Capture native exit codes, `stdout`, and `stderr`, verifying `PLAY RECAP` with zero unreachable and zero failed hosts. Verify idempotence on convergent tasks without replaying one-off operations. If execution aborts with unknown state, reconcile remote reality before retrying. Redact sensitive output in shared records. Update the single maintenance backlog, closing resolved entries upon gate pass. Remove disposable files using `trash-cli`.

## Non-Negotiable Invariants

- **Co-Reading Single Truth:** Humans and agents read the exact same canonical documentation. Front-load actionable conclusions and commands; place connected architectural prose, tradeoffs, and failure rationales in following sections. Never maintain duplicate agent-only instructions. Link to authoritative code and variables rather than copying volatile parameter tables.
- **Configuration vs. Reality Decoupling:** Declarative code and variables describe target configuration, not proof of live service health; state files record managed metadata, not verified runtime facts. Operational claims require fresh, timestamped probe evidence with defined validity windows.
- **Destructive Operation Gates:** Treat delete, destroy, disk removal, bucket deletion, account closure, and broad inventory mutation as destructive. Require an explicit affected-resource plan, digest-bound confirmation, and user approval before execution. Distinguish state changes (`stop`/`start`) from permanent deletion.
- **Anti-Lockout and Recovery Continuity:** For network, firewall, or remote access changes that risk severing administrative connectivity, ensure an out-of-band recovery path exists. Arm an automated timed rollback before applying connectivity changes, cancelling the timer only after independent verification passes.
- **Dual-Layer Guardrail Adherence:** Respect controller-side safety hooks such as Destructive Command Guard (`dcg`) without bypass or unapproved overrides. Combine controller hooks with target-side safety gates, including `--check` dry-runs and explicit execution tags for destructive operations.
- **Three-Tier Secret Boundary:** Plaintext secrets, cloud service account keys, private SSH keys, and live `.env` files must never be committed. Keep controller secrets in `.local-secrets/` (`.gitignore` excluded with tracked `*.example` templates), runtime secrets in encrypted vaults, and cloud automation on `OIDC` / `WIF`. Separate human, automation, and break-glass keys.
- **State Baseline and Conditional Backend:** Keep OpenTofu/Terraform state local, private, and ignored by default when a state has a single active writer; backup state before mutating operations; commit `.terraform.lock.hcl` to ensure deterministic provider resolution. Introduce remote locking backends under evaluated multi-operator concurrency or audit needs; never combine backend migration with apply or destroy automation in the same change.
- **CI Read-Only Evidence Boundary:** Continuous integration workflows produce verification evidence only and must not constitute merge or production apply authorization. Forbid automated apply or destroy workflows.
- **Single Backlog Ledger:** Track unresolved infrastructure defects, pending migrations, and hardware overrides in a single maintenance backlog. Every entry must declare an owner, current state, observable evidence, and next acceptance gate. Once the acceptance gate passes, remove the closed entry immediately rather than accumulating completed manifests.
- **Trash-Based Asset Disposition:** Use `trash-cli` for ordinary file removal. Emptying Trash is permanent deletion and requires separate, explicit authorization after listing affected paths and sizes. Reclaim intermediate worktrees and ephemeral test nodes upon task integration or abandonment.

## Delivery Evidence

- **Authoritative Diff:** the exact configuration, playbook, or policy changes.
- **Preflight Evidence:** syntax check, dry-run, or plan output demonstrating expected changes within declared scope.
- **Execution Proof:** native command output with exit code `0` and timestamped verification.
- **Residual Disposition:** updated backlog state, evidence artifact location, and verified cleanup.

## Read on Demand

- For repository topology, OpenTofu independent root separation, two-tier playbook structure with symlinked vars, or scaffolding a new IaC control plane, read [SCAFFOLD.md](SCAFFOLD.md).
- To automate architecture constraints as CI gates or lint rules, switch to `arch-guard`.
- To plan breaking data or protocol migrations, switch to `arch-evolve`.
- For risk-tiered independent verification, switch to `review-evidence`.
