[English](bilingual-maintenance.md) | [简体中文](bilingual-maintenance.zh-CN.md)

# Bilingual Maintenance Contract

English and Simplified Chinese documents in this repository are equal-authority semantic mirrors. A contributor may begin in either language, but the paired document must be updated in the same change set. Neither language is generated output, a translation branch, or a fallback source of truth.

## Layout

- Default, discoverable files use English: `README.md`, `AGENTS.md`, and `SKILL.md`.
- Chinese mirrors append `.zh-CN.md` in the same directory.
- A localized Skill mirror remains reference documentation rather than a second discoverable Skill, so both languages share one Skill identity, installation path, scripts, assets, and references.
- `chatgpt-chat` is the sole English-only exception because its normal workflow does not ask the user to write a Prompt.

## Editing Workflow

1. Edit either language in the contributor's native language.
2. Update the paired document before merging. Preserve every requirement, prohibition, default, exception, example, command, link, and scope boundary.
3. Run:

   ```bash
   python3 scripts/checks/check_bilingual_docs.py
   python3 -m unittest tests/test_bilingual_docs.py
   ```

4. Obtain semantic review from a reviewer fluent in both languages or a strong bilingual model. Structural checks do not prove translation quality.
5. If the two languages cannot be reconciled without changing policy, stop and treat the disagreement as a source-content decision rather than choosing one language silently.

## What Automation Proves

The checker proves that required pairs exist and that their heading hierarchy, list shape, fenced code, protected inline identifiers, URLs, relative paths, and navigation links remain aligned. It deliberately does not compare prose with keywords or machine translation: those methods would create false confidence about semantics.

Semantic review remains responsible for omissions, changes in obligation strength, terminology drift, unnatural wording, and accidental scope changes.
