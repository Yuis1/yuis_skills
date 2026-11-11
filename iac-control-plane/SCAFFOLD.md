[English](SCAFFOLD.md) | [简体中文](SCAFFOLD.zh-CN.md)

# IaC Control Plane Repository Scaffolding

Use for repository establishment and boundary expansion. Return to [SKILL.md](SKILL.md) for operational workflows and invariants. Scaffold and organize Infrastructure-as-Code control plane repositories for modularity, safety, and operational clarity without boilerplate bloat.

## Repository Topology Invariants

- **Root Minimalism:** Track only global orchestrators (`site.yml` for convergence, `audit.yml` for state inspection), shared baseline configuration (`ansible.cfg`, `ansible.local.cfg.example`), documentation (`README.md`, `CHANGELOG.md`), and safety templates (`.vault_pass.txt.example`).
- **Two-Tier Playbook Topology:** For Ansible automation, flatten specialized task playbooks under `playbooks/`. Maintain variables uniquely at the repository root (`group_vars/` and `host_vars/`), exposing them inside `playbooks/` via relative symlinks (`playbooks/group_vars -> ../group_vars`, `playbooks/host_vars -> ../host_vars`) to preserve a Single Source of Truth (`SSOT`). Non-Ansible stacks avoid artificial playbook or symlink structures.
- **Reusable Roles Foundation:** House reusable tasks, handlers, default variables, and templates under `roles/<role_name>/`. Keep playbooks thin by restricting their contents to host mapping, role invocation, execution ordering, and explicit overrides.
- **Multi-Cloud Root Isolation:** Isolate cloud environments into independent OpenTofu/Terraform roots under `infra/envs/<environment>/`. Each root maintains dedicated local or remote state, variables, and trust boundaries. Avoid monolithic global state files.
- **Target Registry Model:** Maintain a structured, machine-verifiable target registry (such as `infra/policies/cloud-targets.yml` and its checker `check_cloud_targets.sh`) mapping cloud providers, accounts, projects, environment directories, guardrail profiles, and allowed workflows. Allow declaring planned target names while forbidding premature provider-assigned IDs for uncreated resources, and scan the registry to forbid plaintext secret fields.
- **Inventory Segregation:** Strictly separate active mutating inventories (such as `inventory/production.ini` and `inventory/development.ini`) from descriptive discovery catalogs (such as `inventory/catalog.ini`). Mutating execution mandates explicit `--limit` target flags.
- **Local Secret Isolation:** Provide `.local-secrets/` for local credentials. Track only `README.md` and `*.example` templates; exclude all live secret files via `.gitignore`.
- **Domain-Bounded Scripts:** Group automation and verification scripts under `scripts/<domain>/` (such as `scripts/checks/`, `scripts/ansible/`, `scripts/cloud/`). Keep `scripts/` top-level free of executable scripts.

## Progressive Scaffolding Wizard

1. **Identify Operational Requirements:** Identify target infrastructure (bare-metal nodes, cloud providers, container runtimes, or edge devices) and select the minimal necessary tooling (`Ansible`, `OpenTofu`, or `Docker Compose`).
2. **Instantiate Active Roots Only:** Create only the directories and files required for the selected scope. Strictly prohibit speculative directory skeletons for unused cloud providers or dormant environments.
3. **Establish Variable Hierarchy and Path Anchors:** When using Ansible, create root `group_vars/all/main.yml`, configure dynamic repository root resolution `ops_repo_root`, resolve local secrets via `ops_local_secrets_root` to support linked worktrees, and create relative symlinks inside `playbooks/`.
4. **Deploy Local Secret Boundary:** Generate `.local-secrets/` with `.gitignore`, initial `*.example` files, and `.vault_pass.txt.example`.
5. **Install Baseline Verification Checks:** Provide offline checks (such as `check_repository_structure.sh`, documentation link checker, and playbook syntax validation). Guardrail scripts must explicitly declare their capability boundaries and include negative regression fixtures proving they reject violations.

## Execution Wrapper Pattern

Wrap automation execution to enforce environment context and configuration selection:

```bash
scripts/ansible/with_ansible_config.sh ansible-playbook -i inventory/development.ini playbooks/example.yml --limit hostname --syntax-check
```

- **Context Selection:** Prioritize explicit caller `ANSIBLE_CONFIG`, fall back to root `ansible.local.cfg`, and default to `ansible.cfg`. Note that `ansible.local.cfg` replaces `ansible.cfg` rather than merging with it.
- **Wrapper Boundary:** Select configuration context without broadcasting or synthesizing plaintext credentials.
- **Syntax-First Discipline:** Verify syntax and variable resolution locally before initiating remote execution.
