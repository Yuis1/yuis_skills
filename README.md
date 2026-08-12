[English](README.md) | [简体中文](README.zh-CN.md)

# yuis_skills

## Overview

> **Goal:** Make Coding Agents genuinely effective in large, complex engineering environments by continuously improving a loop of requirements alignment → architectural decisions → Agent-team implementation → adversarial refinement → quality enforcement → human feedback → rule consolidation.

This project distills the practical failure modes I have encountered while using AI to develop complex systems over an extended period:

- **Code decay and uncontrolled complexity:** giant files, rising cyclomatic complexity, accumulated regexes and patches, speculative abstractions, excessive defensive code, and orphaned legacy code
- **Architectural antipatterns:** god entry points, unclear Owners for business facts, uncontrolled dependency direction, shallow modules, complex interfaces, and horizontal big-bang refactoring
- **False completion:** ceremonial red tests and bug fixes that sacrifice user experience
- **Unsystematic feedback:** failure to align before implementation, missing architecture enforcement and code-quality gates, mediocre taste, and failure to persist bug evidence
- **Prompt and documentation defects:** exposing internal reasoning, lacking narrative structure, and using terminology that has not been aligned

The project systematizes those lessons as a user-level `AGENTS.md` and a collection of Skills that Agents can discover automatically, load on demand, execute independently, and compose.

`AGENTS.md` carries stable cross-project principles, safety constraints, and global workflow preferences. Concrete procedures live in focused Skills for architecture design, architecture evolution, automated enforcement, safe refactoring, test evidence, complex-task review, Agent-product governance, multi-Agent collaboration, and related scenarios.

## Use Cases

| Scenario | Skill | What it addresses |
|---|---|---|
| Design or review system structure | `system-design` | Establish business Owners, boundaries, and components; verify dependency direction and side-effect ownership |
| Automate architecture rules | `arch-guard` | Design architecture tests, CI Gates, baseline ratchets, and exception handling |
| Evolve services, data, or protocols | `arch-evolve` | Analyze architectural quanta and runtime coupling; plan Expand-Contract migrations and irreversible points |
| Execute cross-module refactoring | `safe-refactor` | Replace old paths through working vertical slices, avoiding big-bang refactoring and prolonged interlocks |
| Accept complex or high-risk work | `review-evidence` | Freeze acceptance scope and produce reproducible evidence tied to a candidate version |
| Determine whether verification truly proves a claim | `test-evidence` | Distinguish behavioral, static, and non-code evidence; migrate legacy tests safely |
| Develop or improve Agent products | `agent-dev` | Govern Prompts, models, Schemas, tools, orchestration, and evaluations through versioning |
| Organize parallel multi-Agent work | `agent-team` | Control delegation cost, session reuse, worktrees, and Writer/Reviewer permissions |
| Consult an authenticated ChatGPT Web session | `chatgpt-chat` | Manage Projects, long-form responses, and attachments through the user's existing Edge/Chrome Profile |

Common combinations:

- System decomposition: `system-design` → `arch-evolve` → `arch-guard`
- Large-scale refactoring: `safe-refactor` + `test-evidence`; add `review-evidence` for a high-risk candidate
- Agent behavior changes: `agent-dev` + `test-evidence`

After installation, an Agent can select Skills from the task and their descriptions, or you can name a Skill explicitly in your Prompt. Do not preload the entire collection before every task.

Examples:

- “Use `system-design` to review the boundary between ordering and payments, and provide an Owner map and dependency graph.”
- “Use `safe-refactor` to divide this platform replacement into independently verifiable vertical slices.”
- “Use `review-evidence` to freeze acceptance scope and prepare review evidence for this high-risk change.”

> `agent-team` includes Paseo session and worktree rules for environments that use Paseo to orchestrate multiple Agents.

## Companion User-Level `AGENTS.md`

> Every sentence in this file is written in the blood of a real production mishap.

The repository-root [`AGENTS.md`](./AGENTS.md) contains the user-level rules that accompany these Skills. It is both the project rule set for maintaining this repository and the authoritative source distributed to Coding Agents. Publish it one way from the repository through Ansible or another configuration-management system; do not maintain the repository and user-directory copies manually in parallel.

The file deliberately keeps only cross-project principles and hard constraints permanently in context while loading concrete Skills on demand, so it is not a complete standalone Prompt. Install the following three Skill groups alongside it:

| Source | Skills used by `AGENTS.md` | Purpose |
|---|---|---|
| This repository | `system-design`, `arch-guard`, `arch-evolve`, `safe-refactor`, `review-evidence`, `test-evidence`, `agent-dev`, `agent-team` | System architecture, evolution, automated enforcement, refactoring, evidence, and Agent collaboration |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | `codebase-design`, `grill-me`, `grill-with-docs`, `prototype`, `to-spec`, `to-tickets`, `wayfinder`, `implement`, `ask-matt`, `research`, `code-review`, `tdd`, `diagnosing-bugs`, `improve-codebase-architecture`, `resolving-merge-conflicts` | Requirements alignment, planning, implementation, testing, diagnosis, code review, and module design |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) | `gpt-taste`, `design-taste-frontend`, `redesign-existing-projects` | New frontend design and modernization of existing interfaces |

`agent-team` also depends on the `paseo-advisor` and `paseo-committee` capabilities provided by a Paseo environment. If you do not use Paseo, do not install `agent-team`, and remove the corresponding Skill guidance from `AGENTS.md`.

If a Skill group is absent, the principles written directly in `AGENTS.md` remain in force, but the Agent cannot load the referenced workflow. You may also remove Skill references and tool constraints that do not apply to your environment; do not retain names that cannot be resolved or have never been installed.

This is a reference configuration with a deliberate, personal workflow bias—not a universal security baseline. Review every rule before adoption, especially Paseo integration, local reference paths, model selection, and reporting preferences.

## Bilingual Maintenance

English and Simplified Chinese are equal-authority mirrors. Contributors may maintain either language in their native language, but every change must update the paired document in the same change set without altering meaning, obligation strength, examples, or scope.

- English is the default discoverable form: `README.md`, `AGENTS.md`, and each `SKILL.md`.
- Simplified Chinese mirrors use `.zh-CN.md`, such as `README.zh-CN.md`, `AGENTS.zh-CN.md`, and `SKILL.zh-CN.md`.
- A Skill keeps both languages in the same directory so scripts, assets, references, installation paths, and Skill identity remain shared.
- The only discoverable Skill entry is `SKILL.md`. A localized mirror is reference documentation, not a second Skill, which avoids duplicate-name discovery and divergence between two installed packages.
- Each `SKILL.md` and its Chinese mirror provide reciprocal language links.
- `chatgpt-chat` is intentionally English-only because its normal workflow does not ask the user to write a Prompt. It is the sole documented exception.
- Structural checks detect missing mirrors and drift-prone differences in headings, code blocks, links, paths, commands, and normative markers. Human or semantic review remains responsible for linguistic quality and meaning equivalence.

Neither language is a translation branch or a secondary source. If a proposed edit cannot be mirrored without changing meaning, stop and resolve the underlying content decision before merging. See the [bilingual maintenance contract](docs/bilingual-maintenance.md) for the editing workflow and validation boundary.

## Installation

[Codex](https://developers.openai.com/codex/build-skills), [Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md), and [OpenCode](https://opencode.ai/docs/skills/) read `~/.agents/skills`; [Claude Code](https://code.claude.com/docs/en/agent-sdk/skills) reads `~/.claude/skills`.

### This Skill Collection

```bash
git clone https://github.com/Yuis1/yuis_skills.git
cd yuis_skills

skills=(
  system-design arch-guard arch-evolve safe-refactor
  review-evidence test-evidence agent-dev agent-team chatgpt-chat
)
repo_dir="$(pwd -P)"

link_skills() {
  local root="$1"
  mkdir -p "$root"
  for skill in "${skills[@]}"; do
    [[ -e "$root/$skill" || -L "$root/$skill" ]] ||
      ln -s "$repo_dir/$skill" "$root/$skill"
  done
}

link_skills "$HOME/.agents/skills"
# Claude Code users should also run:
link_skills "$HOME/.claude/skills"
```

### Companion Skills

Dependencies are pinned as follows:

| Repository | Pinned version |
|---|---|
| [`mattpocock/skills`](https://github.com/mattpocock/skills/tree/v1.1.0) | `v1.1.0` (`eabea89380927aadb93abf6e290a19334d249292`) |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill/tree/e988add20dab0fa97d7a76781c48961c8184288e) | `e988add20dab0fa97d7a76781c48961c8184288e` |

```bash
git clone --branch v1.1.0 --depth 1 \
  https://github.com/mattpocock/skills.git ../mattpocock-skills
git clone https://github.com/Leonxlnx/taste-skill.git ../taste-skill
git -C ../taste-skill checkout --detach \
  e988add20dab0fa97d7a76781c48961c8184288e

npx skills@latest add ../mattpocock-skills --global --skill '*'
npx skills@latest add ../taste-skill --global \
  --skill design-taste-frontend gpt-taste redesign-existing-projects
```

### User-Level Rules

| Tool | Publication path for `AGENTS.md` |
|---|---|
| [Codex](https://developers.openai.com/codex/guides/agents-md) | `~/.codex/AGENTS.md` |
| [Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/usage.md#context-files) | `~/.pi/agent/AGENTS.md` |
| [OpenCode](https://opencode.ai/docs/rules/) | `~/.config/opencode/AGENTS.md` |
| [Claude Code](https://code.claude.com/docs/en/memory#agentsmd) | `~/.claude/CLAUDE.md` |

Publish one way from this repository through Ansible or another configuration-management system. Claude Code uses the same content under the filename `CLAUDE.md`.

## Security

Agent Skills influence an Agent's judgment and actions; read them before installation. Except for `chatgpt-chat`, the Skills in this repository contain instructions and metadata only. `chatgpt-chat` controls the user's existing Edge/Chrome Profile through the Playwriter extension so it can reuse the authenticated session. The extension has broad page-control capability; although the business workflow operates only on ChatGPT tabs that it creates, review its credential boundary separately before installation and enablement.

We also recommend combining `trash-cli`, [DCG](https://github.com/Dicklesworthstone/destructive_command_guard), BTRFS snapshots, and off-site backups as a defense-in-depth safety foundation.

## License

[Apache License 2.0](LICENSE)
