[English](bilingual-agent-skills.md) | [简体中文](bilingual-agent-skills.zh-CN.md)

# Bilingual and multilingual Agent Skills repositories

**Research date:** 2026-08-12. This note uses the current local Pi 0.83.0 documentation and the first-party documentation for the Agent Skills specification, Codex CLI 0.146.0, Claude Code 2.1.220, and OpenCode 1.18.9.

## Decision summary

Use **one skill identity and one discovered entry point**. Keep the language-neutral identity in an ASCII directory name and in exactly one `SKILL.md`; keep translations as supporting files in that same skill directory.

```text
skill-name/
├── SKILL.md                    # the only discovered entry point
├── references/
│   └── zh-CN.md                # translated supporting document; not a skill
├── scripts/                    # optional, shared by all languages
└── assets/                     # optional, shared by all languages
```

The repository's existing `SKILL.zh-CN.md` naming is also safe **when it stays inside the canonical skill directory**. `references/zh-CN.md` is the more explicit Agent Skills layout. In either form, do not add a second `SKILL.md`, a `foo-zh` skill directory, or a localized `name` field.

Language selection is a **post-discovery, model-level choice**, not a skill-discovery feature: the canonical body can say that an explicitly requested language takes precedence, otherwise the language of the user's latest request selects the corresponding reference. The selected reference changes presentation language only; it does not change the skill name, scope, tools, safety rules, or workflow. None of the reviewed standards defines a portable `language`, `locale`, translation relation, or locale-negotiation field.

Mechanical checks can prove discovery safety, mirror coverage, structural alignment, and preservation of high-risk literals and normative markers. They cannot prove that two natural-language documents have exactly the same meaning. Bilingual human review and paired behavioral evaluations remain required.

## What the primary sources establish

| Source | Relevant contract | Consequence for bilingual skills |
|---|---|---|
| [Agent Skills specification][spec] | A skill is a directory with `SKILL.md`; `name` and `description` are required; `name` must match the directory; other files and `references/` are allowed; loading is progressive. | A translation belongs among supporting resources, not beside the skill as a second entry point. Keep the identity fields only in the canonical file. |
| [Agent Skills client-integration guide][integration] | Clients normally scan directories containing a file named exactly `SKILL.md`, disclose only name/description first, and must handle name collisions deterministically. | A second discovered file is a second catalog candidate. The client standard has no language-selection step to merge it back into the first skill. |
| [Pi skills documentation][pi] | Pi scans `.agents/skills` and other locations for directories containing `SKILL.md` recursively; direct root `.md` files are a special case only in Pi-native roots. Missing descriptions are not loaded, unknown frontmatter is ignored, and same-name collisions warn and keep the first skill. | A non-`SKILL.md` translation nested inside the skill directory is not a second entry under the documented shared layout. Do not flatten it into a Pi-native root or create a nested `SKILL.md`. |
| [Codex build-skills documentation][codex] | Codex scans `.agents/skills` at repository/user/admin/system scopes, supports symlinked skill folders, uses descriptions for implicit invocation, and does not merge same-name skills. `agents/openai.yaml` is optional UI/policy metadata. | One shared folder can be exposed to Codex. A Chinese display label can live in Codex-only UI metadata, but that metadata is not a portable locale selector. |
| [Claude Code skills documentation][claude] | Project/personal skills use `<skill-name>/SKILL.md`; supporting files are loaded on demand; directory names determine ordinary command names; nested duplicate names can become directory-qualified variants. Claude-specific frontmatter extends the standard, while nonstandard fields can fail packaging outside Claude Code. | Keep the canonical frontmatter to the standard intersection for portability. A translation must be a referenced supporting file, not another Claude skill/command. |
| [OpenCode Agent Skills documentation][opencode] | OpenCode searches `skills/*/SKILL.md` in `.opencode`, `.claude`, and `.agents` locations; it requires name-directory equality, lists skills by name/description, and tells users to keep names unique. | Do not rely on an extra nested `SKILL.md` being ignored by every client, and do not expose the same identity through multiple OpenCode search roots unless the resolved catalog has been checked. |

The specification's `skills-ref validate` tool validates the skill directory and frontmatter; its reference implementation does not compare translated prose or supporting files. See the [reference library][skills-ref], especially its [`validator.py`][validator].

## Safest layout and identity rules

### Recommended repository shape

1. Store the skill once in a source tree. Install or link that same folder into the discovery root required by each client; do not maintain English and Chinese copies in separate install trees.
2. Put the mirror at `SKILL.zh-CN.md` in the same skill directory. This repository chooses that explicit same-directory convention; `references/zh-CN.md` is also safe under the standard but is not used here. The mirror is a normal Markdown resource and should not contain a second Agent Skills frontmatter block. A short title, backlink, and machine-readable HTML comment are sufficient.
3. Keep `SKILL.md` under the recommended size and link the mirror with a relative path. The spec and Pi both resolve supporting resources relative to the skill root; the spec recommends shallow references.
4. Use an ASCII identity such as `agent-dev`, not `agent-dev-zh` and not a Chinese directory/name. The specification permits lowercase alphanumeric characters and hyphens, while OpenCode documents the stricter ASCII regex. ASCII is the safe intersection.
5. Keep canonical frontmatter to the cross-client fields: `name`, `description`, `license`, `compatibility`, and `metadata`. Do not invent a top-level `language` or `locale` field. The spec's `allowed-tools` and each client's invocation-control fields have uneven support; use client-specific adapters when such behavior is necessary.
6. Keep executable code, paths, option names, environment variables, URLs, and assets shared. A translation must not fork operational artifacts.

The current repository policy in [`README.md`](../../README.md#bilingual-maintenance) already states the key invariants: same directory, one discoverable `SKILL.md`, paired links, same-change-set updates, and structural checks followed by human semantic review. The paired [`agent-dev` files](../../agent-dev/SKILL.md) demonstrate the entry-point-to-mirror link. The Codex-specific [`agents/openai.yaml`](../../agent-dev/agents/openai.yaml) demonstrates a separate UI metadata layer; it does not create another skill identity.

### Why a second `SKILL.md` is unsafe

The same pair of files can behave differently across clients:

- Pi keeps the first same-name skill after warning.
- Codex leaves both same-name skills available rather than merging them.
- Claude can override a skill at another scope or expose a nested variant under a qualified name.
- OpenCode requires names to be unique across its searched locations.

Thus `skill-name/SKILL.md` plus `skill-name-zh/SKILL.md` is not a translation pair to the clients; it is two skills with potentially conflicting instructions. A nested `skill-name/zh-CN/SKILL.md` is also unsafe because Pi's recursive discovery can find it even if another client happens not to. A mirror named `SKILL.zh-CN.md` is safe only as a non-entry file inside the canonical directory; it is not safe to copy it flat into a discovery root where Pi's native-root `.md` rule may apply.

Symlinks solve source duplication, not identity duplication. Codex and Claude document symlink support, and Claude explicitly deduplicates the same target reached from multiple locations. OpenCode's documentation instead asks for unique names across all locations. Therefore, when one process scans both `.agents/skills` and `.claude/skills`, expose each real skill through only one of those paths unless that client's actual catalog proves real-path deduplication.

## Portable language selection

No reviewed client negotiates a skill locale. The portable approach is:

1. Let the normal catalog discover `skill-name` from the English `SKILL.md` description.
2. In the canonical body, state the selector in English so every client can follow it:
   - an explicit request for Chinese selects `SKILL.zh-CN.md`;
   - otherwise the language of the latest user request selects an available mirror;
   - if no mirror exists, use the canonical English instructions;
   - the mirror is a translation of the same contract, not an override; on conflict, stop and resolve the mirror rather than choosing the weaker rule.
3. Keep the skill command/mention unchanged (`/skill-name`, `$skill-name`, or the client's equivalent). Do not ask users to invoke a language-suffixed skill.
4. If a client has a separate presentation layer, localize that layer there. For example, Codex's optional `agents/openai.yaml` can provide a Chinese display name or default prompt, but it does not alter discovery or create locale semantics.

The canonical `description` should remain concise, describe what the skill does and when to use it, and contain trigger terms. If Chinese-only users need stronger implicit discovery, add a small set of Chinese trigger terms to that same description; do not add a second localized description as another catalog record. This follows the specification, Pi, and Codex guidance that descriptions drive activation.

A repository may let either language be edited first, but both files must change in one reviewable change set. Treat the shared unit IDs, commands, paths, and normative markers as the contract. This preserves the repository's equal-authority mirror policy without pretending that a client can discover two language variants as one object.

## What CI can validate

A small repository checker should run in addition to the standard validator. The following checks are deterministic and appropriate for a blocking gate:

### 1. Discovery and identity

- Find every intended canonical skill directory and assert exactly one uppercase `SKILL.md`.
- Parse canonical frontmatter and run `skills-ref validate`; additionally require the stricter cross-client ASCII name regex and name-directory equality.
- Assert that no mirror directory contains `SKILL.md`, that no mirror is installed as a sibling skill directory, and that no mirror has a second discoverable frontmatter entry.
- Resolve the configured discovery roots and assert one effective skill identity per client. Report same-name collisions rather than relying on first-found order.
- Check that every mirror path is inside the canonical skill directory, every link target exists, and all relative paths remain valid.

### 2. Bidirectional mirror coverage

Give every normative section or instruction unit a stable opaque ID, for example:

```markdown
<!-- mirror-unit id=external-side-effects kind=prohibition severity=high -->
...
<!-- /mirror-unit -->
```

The same IDs must occur exactly once in `SKILL.md` and in each mirror. The checker should require:

```text
IDs(SKILL.md) == IDs(zh-CN.md)
```

and, for each ID, the same unit kind, severity, order (if order is behaviorally relevant), and mirror revision. This is genuinely bidirectional: it detects both an English unit missing from Chinese and a Chinese-only unit that was added without an English counterpart. A sidecar manifest can hold these IDs if HTML comments are undesirable, but it must describe the contract rather than duplicate the prose.

### 3. High-value structural and literal parity

For each paired unit, compare:

- heading and unit structure, list/step counts, and code-fence language;
- code blocks byte-for-byte, unless a deliberate, reviewed exception is recorded;
- link destinations, relative file paths, URLs, environment-variable names, command names, flags, placeholders, regular expressions, identifiers, and numeric thresholds;
- machine-readable normative markers such as `must`, `must-not`, `may`, `should`, `prohibition`, and `side-effect` represented by stable tags rather than translated words;
- the set of referenced scripts, assets, and other resources.

Do not compare raw Markdown hashes or line-by-line prose: correct translations necessarily differ in words and line wrapping. Do not use keyword counts as a proof of meaning. The local rules likewise caution against disguising decisions requiring language semantics as regex or fixed-phrase decisions; use deterministic checks only for protocols, identifiers, and hard constraints ([`AGENTS.md`](../../AGENTS.md)).

### 4. Behavior and human review

Maintain paired English/Chinese prompts with the same inputs and expected action-level assertions: allowed or forbidden action, required artifact, command/path, and error behavior. Run them in fresh sessions with the same skill version. Compare structured outputs and side effects where possible, not translated prose. The Agent Skills evaluation guide recommends realistic varied prompts, edge cases, concrete assertions, isolated with-skill/baseline runs, and human review of qualities that assertions cannot express ([evaluation guide][evaluation]).

A mechanical pass therefore means **structural and contract parity**, not proven semantic equivalence. A bilingual reviewer must still inspect every change to safety rules, permissions, irreversible actions, tool use, and exception handling. If the two texts disagree, fail the review rather than silently selecting the more permissive language.

## Practical gate

For each pull request touching a skill or mirror, the preflight/CI gate should be:

1. `skills-ref validate <skill-directory>`.
2. The discovery/identity checks above.
3. Mirror-unit set equality and revision checks.
4. Literal, link, path, command, and normative-marker parity checks.
5. Paired English/Chinese evaluation for behaviorally significant changes.
6. Human bilingual review for meaning, security, and usability.

This yields one discoverable skill to all five clients, a predictable language choice after activation, and useful automated drift detection without claiming that a parser can certify translation quality.

## Primary sources

- [Agent Skills specification][spec]
- [Agent Skills client implementation guide][integration]
- [Agent Skills evaluation guide][evaluation]
- [Agent Skills `skills-ref` README][skills-ref] and [validator implementation][validator]
- [Pi skills documentation (upstream)][pi] — also checked at `/home/yuis/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/skills.md` for installed Pi 0.83.0
- [OpenAI Codex: Build skills][codex]
- [Claude Code: Extend Claude with skills][claude]
- [OpenCode: Agent Skills][opencode]

[spec]: https://agentskills.io/specification.md
[integration]: https://agentskills.io/client-implementation/adding-skills-support.md
[evaluation]: https://agentskills.io/skill-creation/evaluating-skills.md
[skills-ref]: https://github.com/agentskills/agentskills/tree/main/skills-ref
[validator]: https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py
[pi]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md
[codex]: https://developers.openai.com/codex/build-skills.md
[claude]: https://code.claude.com/docs/en/skills.md
[opencode]: https://opencode.ai/docs/skills.md
