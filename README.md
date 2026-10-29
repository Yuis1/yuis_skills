[English](README.md) | [简体中文](README.zh-CN.md)

# yuis_skills

## Overview

> **Goal:** Make coding agents effective in large, complex engineering projects through a continuous cycle of requirements alignment → architectural decisions → agent-team implementation → adversarial review and refinement → quality checks → human feedback → lessons incorporated into rules.

This project distills the practical failure modes I have encountered while using AI to develop complex systems over an extended period:

- **Code decay and uncontrolled complexity:** giant files, rising cyclomatic complexity, accumulated regexes and patches, speculative abstractions, excessive defensive code, and orphaned legacy code
- **Architectural antipatterns:** overloaded entry points, unclear ownership of business facts, uncontrolled dependency direction, shallow modules, complex interfaces, and all-at-once refactoring across architectural layers
- **False completion and test cheating:** tests made to fail merely to satisfy a test-first ritual, softening assertions or injecting skips to fake passing tests, and bug fixes that sacrifice user experience
- **Context rot and coordination overhead:** sprawling multi-hour sessions, unmanaged accumulation of dozens of branches and worktrees, interface drift across parallel teams, and orchestrators reduced to bloated communication bottlenecks
- **Governance bureaucracy and meta-work sprawl:** agents getting trapped in nested administrative ceremonies—generating hundreds of ritualistic tracking files, sample dumps, closeout manifests, and review loops, burning hundreds of millions of tokens on self-review bureaucracy while consecutive commits fail to touch core product code paths
- **Test harness quagmire and trial-and-error spirals:** sub-agents reinventing fragile test runners, fighting port collisions, TIME_WAIT false alarms, and leaked zombie child processes, or accidentally deleting shared test databases during cleanup
- **Slice-only false completion and async verification races:** declaring features complete when decoupled backend unit tests and frontend component mocks pass individually, while the unmocked end-to-end user flow remains broken; asserting persistence against transient in-flight UI states before network requests settle, or using read-only GET probes to falsely certify write-verb readiness before heavy multi-tier runs
- **Unsystematic feedback:** failure to align before implementation, missing architecture enforcement and code-quality gates, weak design judgment, and failure to persist bug evidence
- **Prompt and documentation defects:** exposing internal reasoning, lacking narrative structure, and using terminology without a shared understanding

The project systematizes those lessons as a user-level `AGENTS.md` and a collection of Skills that Agents can discover automatically, load on demand, execute independently, and compose.

`AGENTS.md` carries stable cross-project principles, safety constraints, and global workflow preferences. Concrete procedures live in focused Skills for architecture design, architecture evolution, automated enforcement, safe refactoring, test evidence, complex-task review, Agent-product governance, multi-Agent collaboration, and related scenarios.

## Use Cases

| Scenario | Skill | What it addresses |
|---|---|---|
| Design or review system structure | `system-design` | Establish business Owners, boundaries, and components; verify dependency direction, side-effect ownership, and contract-first schema locks |
| Automate architecture rules | `arch-guard` | Design architecture tests, CI Gates, baseline ratchets, and exception handling |
| Evolve services, data, or protocols | `arch-evolve` | Analyze architectural quanta and runtime coupling; plan Expand-Contract migrations and irreversible points |
| Execute cross-module refactoring | `safe-refactor` | Replace old paths through working vertical slices, retiring intermediate slice branches and worktrees to avoid big-bang accumulation |
| Accept complex or high-risk work | `review-evidence` | Tier review evidence by risk; freeze candidate versions and produce unified machine manifests without manual copying |
| Determine whether verification truly proves a claim | `test-evidence` | Distinguish behavioral, static, and non-code evidence; enforce preflight probes, failure observability, and immutable test targets |
| Develop or improve Agent products | `agent-dev` | Govern Prompts, models, Schemas, tools, orchestration, and evaluations through deterministic tooling and behavioral benchmarks |
| Organize parallel multi-Agent work | `agent-team` | Coordinate two-tier domain leads, bounded task contracts, worktree/branch retirement, and root digest isolation |
| Reframe and rewrite constrained prompts | `ambitious-prompt-rewrite` | Elevate routine tasks across altitude, depth, and range into professional, durable directives |
| Research a frontier or difficult question separable from repository files that needs extensive online literature | `chatgpt-chat` | Consult ChatGPT Web through the user's existing Edge/Chrome Profile |

Common combinations:

- System decomposition: `system-design` → `arch-evolve` → `arch-guard`
- Large-scale refactoring: `safe-refactor` + `test-evidence`; add `review-evidence` for a high-risk candidate
- Agent behavior changes: `agent-dev` + `test-evidence`

### Prompt Elevation with `ambitious-prompt-rewrite`

Inspired by Felix Rieseberg's essay [*How to be more ambitious: A tutorial for humans with models*](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/) (13 October 2026), `ambitious-prompt-rewrite` bridges the persistent "ambition gap" between human prompts and frontier model capabilities. Humans routinely constrain models to mundane, local, single-turn tasks. This skill elevates drafts across three orthogonal axes:

- **Altitude:** elevates the goal beyond the immediate task, turning one-off manual fixes into durable, self-sustaining loops that take humans out of routine execution;
- **Depth:** demands instruments of top domain experts (raw ASTs, native profilers, statistical models) and enforces an independent, external judge rather than in-loop narrative self-evaluation;
- **Range:** maps underlying verbs to orthogonal professional disciplines (forensic accountants, short sellers, motion designers) to inject rigor without cosmetic role-playing.

After installation, an Agent can select Skills from the task and their descriptions, or you can name a Skill explicitly in your Prompt. Do not preload the entire collection before every task.

Examples:

- “Use `system-design` to review the boundary between ordering and payments, and provide an Owner map and dependency graph.”
- “Use `ambitious-prompt-rewrite` to elevate this routine crash-fix request into a durable, multi-angle engineering prompt.”
- “Use `safe-refactor` to divide this platform replacement into independently verifiable vertical slices.”
- “Use `review-evidence` to freeze acceptance scope and prepare review evidence for this high-risk change.”

> `agent-team` includes Paseo session and worktree rules for environments that use Paseo to orchestrate multiple Agents.

## Companion User-Level `AGENTS.md`

> Every sentence in this file is written in the blood of a real production mishap.

The repository-root [`AGENTS.md`](./AGENTS.md) contains the user-level rules that accompany these Skills. It is both the project rule set for maintaining this repository and the authoritative source distributed to Coding Agents. Publish it in one direction from the repository through Ansible or another configuration-management system; do not maintain the repository and user-directory copies manually in parallel.

Only cross-project principles and hard constraints stay in persistent context; concrete skills load on demand. The file is therefore not a complete standalone prompt. Install the following Skill groups alongside it:

| Source | Skills used by `AGENTS.md` | Purpose |
|---|---|---|
| This repository | `system-design`, `arch-guard`, `arch-evolve`, `safe-refactor`, `review-evidence`, `test-evidence`, `agent-dev`, `agent-team`, `ambitious-prompt-rewrite`, `chatgpt-chat` | System architecture, evolution, automated enforcement, refactoring, evidence, Agent collaboration, and prompt elevation |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | `codebase-design`, `grill-me`, `grill-with-docs`, `prototype`, `to-spec`, `to-tickets`, `wayfinder`, `implement`, `ask-matt`, `research`, `code-review`, `tdd`, `diagnosing-bugs`, `improve-codebase-architecture`, `pr`, `retro`, `to-questionnaire`, `wait-what`, `wizard` | Requirements alignment, planning, implementation, testing, diagnosis, code review, PR authoring, and session retrospectives |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) | `design-taste-frontend` | Anti-slop art direction, macro layout variance, and real-browser inspection for web pages and app screens |
| [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max` | Offline BM25 vertical domain palettes, typography systems, and interaction guidelines |
| [`emilkowalski/skills`](https://github.com/emilkowalski/skills) | `emil-design-eng`, `animate`, `review-animations` | Micro-interaction ergonomics, physical spring tuning, 150–250ms feedback latency caps, and reduced-motion compliance |
| [`Nutlope/hallmark`](https://github.com/Nutlope/hallmark) | `hallmark` | Defensive anti-slop quality gates, 16 Floor rules, and automated `sloplint.mjs` static inspection |

`agent-team` also depends on the `paseo-advisor` and `paseo-committee` capabilities provided by a Paseo environment. If you do not use Paseo, do not install `agent-team`, and remove the corresponding Skill guidance from `AGENTS.md`.

If a Skill group is absent, the principles written directly in `AGENTS.md` remain in force, but the Agent cannot load the referenced workflow. You may also remove Skill references and tool constraints that do not apply to your environment; do not retain names that cannot be resolved or have never been installed.

This is a reference configuration with a deliberate, personal workflow bias—not a universal security baseline. Review each rule before adopting the collection, especially Paseo integration, local reference paths, model selection, and reporting preferences.

## Bilingual Maintenance

English and Simplified Chinese are equal-authority mirrors. Contributors may start with the version in their native language, but every change must update the paired document in the same change set without altering meaning, obligation strength, examples, or scope.

- English is the default discoverable form: `README.md`, `AGENTS.md`, and each `SKILL.md`.
- Simplified Chinese mirrors use `.zh-CN.md`, such as `README.zh-CN.md`, `AGENTS.zh-CN.md`, and `SKILL.zh-CN.md`.
- A Skill keeps both languages in the same directory so scripts, assets, references, installation paths, and Skill identity remain shared.
- The only discoverable Skill entry is `SKILL.md`. A localized mirror is reference documentation, not a second Skill, which avoids duplicate-name discovery and divergence between two installed packages.
- Each `SKILL.md` and its Chinese mirror provide reciprocal language links.
- `chatgpt-chat` is intentionally English-only because its normal workflow does not ask the user to write a Prompt. It is the sole documented exception.
- Structural checks detect missing mirrors and drift-prone differences in headings, code blocks, links, paths, commands, and normative markers. Human or semantic review remains responsible for linguistic quality and meaning equivalence.

Neither language is a translation branch or a secondary source. If a proposed edit cannot be mirrored without changing meaning, stop and resolve the underlying content decision before merging. See the [bilingual maintenance contract](docs/bilingual-maintenance.md) for the editing workflow and validation boundary.

The [September 2026 maintenance record](docs/optimization-2026-09-23.md) explains the current trigger and authorization boundaries.

## Installation

[Codex](https://developers.openai.com/codex/build-skills), [Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md), and [OpenCode](https://opencode.ai/docs/skills/) read `~/.agents/skills`; [Claude Code](https://code.claude.com/docs/en/agent-sdk/skills) reads `~/.claude/skills`.

### This Skill Collection

```bash
git clone https://github.com/Yuis1/yuis_skills.git
cd yuis_skills

skills=(
  system-design arch-guard arch-evolve safe-refactor
  review-evidence test-evidence agent-dev agent-team
  ambitious-prompt-rewrite chatgpt-chat
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
| [`mattpocock/skills`](https://github.com/mattpocock/skills/tree/59db609eb1e18aaf59b63284d0e52255aff0c63c) | `59db609eb1e18aaf59b63284d0e52255aff0c63c` |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill/tree/12af471f627f866411b4bd785b19646d3672784c) | `12af471f627f866411b4bd785b19646d3672784c` |
| [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/28b3b8dee8c976df4fa3e94aed4e092ad43fcb03) | `28b3b8dee8c976df4fa3e94aed4e092ad43fcb03` |
| [`emilkowalski/skills`](https://github.com/emilkowalski/skills/tree/a81dbca07f2217b7103e510c0f13f8d5b017afc9) | `a81dbca07f2217b7103e510c0f13f8d5b017afc9` |
| [`Nutlope/hallmark`](https://github.com/Nutlope/hallmark/tree/8f6969f8922caabde9de1784959eae11ddf68073) | `8f6969f8922caabde9de1784959eae11ddf68073` |

```bash
git clone https://github.com/mattpocock/skills.git ../mattpocock-skills
git -C ../mattpocock-skills checkout --detach 59db609eb1e18aaf59b63284d0e52255aff0c63c
git clone https://github.com/Leonxlnx/taste-skill.git ../taste-skill
git -C ../taste-skill checkout --detach 12af471f627f866411b4bd785b19646d3672784c
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git ../ui-ux-pro-max-skill
git -C ../ui-ux-pro-max-skill checkout --detach 28b3b8dee8c976df4fa3e94aed4e092ad43fcb03
git clone https://github.com/emilkowalski/skills.git ../emilkowalski-skills
git -C ../emilkowalski-skills checkout --detach a81dbca07f2217b7103e510c0f13f8d5b017afc9
git clone https://github.com/Nutlope/hallmark.git ../hallmark
git -C ../hallmark checkout --detach 8f6969f8922caabde9de1784959eae11ddf68073

npx skills@latest add ../mattpocock-skills/skills/engineering --global --skill '*'
npx skills@latest add ../mattpocock-skills/skills/productivity --global --skill '*'
npx skills@latest add ../mattpocock-skills/skills/misc --global --skill '*'
npx skills@latest add ../taste-skill --global --skill design-taste-frontend
npx skills@latest add ../ui-ux-pro-max-skill --global --skill ui-ux-pro-max
npx skills@latest add ../emilkowalski-skills --global \
  --skill emil-design-eng animate review-animations
npx skills@latest add ../hallmark --global --skill hallmark
```

The original `gpt-taste` skill is excluded from the managed install set because it requests simulated execution and unconditional marketing layouts. Select the remaining visual skills only when the product brief fits; preserve existing design systems and functionality.

### User-Level Rules

| Tool | Publication path for `AGENTS.md` |
|---|---|
| [Codex](https://developers.openai.com/codex/guides/agents-md) | `~/.codex/AGENTS.md` |
| [Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/usage.md#context-files) | `~/.pi/agent/AGENTS.md` |
| [OpenCode](https://opencode.ai/docs/rules/) | `~/.config/opencode/AGENTS.md` |
| [Claude Code](https://code.claude.com/docs/en/memory#agentsmd) | `~/.claude/CLAUDE.md` |

Publish one way from this repository through Ansible or another configuration-management system. Claude Code uses the same content under the filename `CLAUDE.md`.

## Security

Agent Skills influence an Agent's judgment and actions; read them before installation. Except for `chatgpt-chat`, the Skills in this repository contain instructions and metadata only. `chatgpt-chat` controls the user's existing Edge/Chrome Profile through the Playwriter extension so it can reuse the authenticated session. The extension has broad page-control capability; although the skill workflow operates only on ChatGPT tabs that it creates, review its credential boundary separately before installation and enablement.

We also recommend combining `trash-cli`, [DCG](https://github.com/Dicklesworthstone/destructive_command_guard), BTRFS snapshots, and off-site backups as a defense-in-depth safety foundation.

## License

[Apache License 2.0](LICENSE)
