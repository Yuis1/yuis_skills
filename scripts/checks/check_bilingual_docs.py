#!/usr/bin/env python3
"""Check structural parity for the repository's bilingual documentation."""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILL_DIRS = tuple(
    path.parent
    for path in sorted(ROOT.glob("*/SKILL.md"))
    if path.parent.name != "chatgpt-chat"
)
PAIRS = (
    (ROOT / "README.md", ROOT / "README.zh-CN.md"),
    (ROOT / "AGENTS.md", ROOT / "AGENTS.zh-CN.md"),
    (ROOT / "docs/bilingual-maintenance.md", ROOT / "docs/bilingual-maintenance.zh-CN.md"),
    (ROOT / "docs/research/bilingual-agent-skills.md", ROOT / "docs/research/bilingual-agent-skills.zh-CN.md"),
    *((directory / "SKILL.md", directory / "SKILL.zh-CN.md") for directory in SKILL_DIRS),
    (ROOT / "system-design/COMPONENTS.md", ROOT / "system-design/COMPONENTS.zh-CN.md"),
    (ROOT / "system-design/REVIEW.md", ROOT / "system-design/REVIEW.zh-CN.md"),
    (ROOT / "test-evidence/LEGACY.md", ROOT / "test-evidence/LEGACY.zh-CN.md"),
)
INLINE_CODE_PATTERN = re.compile(r"`([^`\n]+)`")
URL_PATTERN = re.compile(r"https?://[^\s)>]+")
PATH_PATTERN = re.compile(r"(?<![A-Za-z0-9_-])(?:\.{1,2}/)[A-Za-z0-9_.~*'\"${}-]+(?:/[A-Za-z0-9_.~*'\"${}-]+)*")
CODE_FENCE_PATTERN = re.compile(r"^```([^\s`]*)", re.MULTILINE)
STRUCTURAL_PATTERN = re.compile(r"^(\s*)(?:([-*])|(\d+)\.)\s+", re.MULTILINE)
HAN_PATTERN = re.compile(r"[\u3400-\u9fff]")
LATIN_WORD_PATTERN = re.compile(r"\b[A-Za-z]{2,}\b")


@dataclass(frozen=True)
class Structure:
    heading_levels: tuple[int, ...]
    list_markers: tuple[tuple[int, str], ...]
    code_fences: tuple[str, ...]
    code_blocks: tuple[str, ...]
    protected_tokens: frozenset[str]


def body(text: str) -> str:
    if text.startswith("---\n"):
        _, _, remainder = text.partition("\n---\n")
        return remainder
    return text


def structure(text: str, language: str) -> Structure:
    del language  # Structure is language-independent by design.
    content = body(text)
    fenced = re.findall(r"```([^\n`]*)\n(.*?)```", content, re.DOTALL)
    inline_code = {
        token
        for token in INLINE_CODE_PATTERN.findall(content)
        if not re.search(r"[\u3400-\u9fff]", token)
        and (re.fullmatch(r"[A-Za-z0-9_.~*'\"${}/:=+|<> -]+", token) is not None)
    }
    protected_tokens = inline_code | set(URL_PATTERN.findall(content)) | set(PATH_PATTERN.findall(content))
    return Structure(
        heading_levels=tuple(len(match.group(1)) for match in re.finditer(r"^(#+)\s", content, re.MULTILINE)),
        list_markers=tuple(
            (len(match.group(1)), "bullet" if match.group(2) else "ordered")
            for match in STRUCTURAL_PATTERN.finditer(content)
        ),
        code_fences=tuple(language for language, _ in fenced),
        code_blocks=tuple(block for language, block in fenced if language in {"bash", "sh", "shell"}),
        protected_tokens=frozenset(protected_tokens),
    )


def relative(path: Path) -> str:
    return str(path.relative_to(ROOT))


def prose_without_code(text: str) -> str:
    content = body(text)
    content = re.sub(r"```.*?```", "", content, flags=re.DOTALL)
    content = INLINE_CODE_PATTERN.sub("", content)
    content = URL_PATTERN.sub("", content)
    return content


def untranslated_english_lines(text: str) -> tuple[str, ...]:
    suspicious: list[str] = []
    for raw_line in prose_without_code(text).splitlines():
        line = re.sub(r"^[#>*\-\d.\s]+", "", raw_line).strip()
        if len(line) < 40 or HAN_PATTERN.search(line):
            continue
        if len(LATIN_WORD_PATTERN.findall(line)) >= 6:
            suspicious.append(raw_line.strip())
    return tuple(suspicious)


def main() -> int:
    errors: list[str] = []
    for english, chinese in PAIRS:
        if not english.is_file():
            errors.append(f"missing English document: {relative(english)}")
            continue
        if not chinese.is_file():
            errors.append(f"missing Chinese mirror: {relative(chinese)}")
            continue
        en_text = english.read_text(encoding="utf-8")
        zh_text = chinese.read_text(encoding="utf-8")
        en = structure(en_text, "en")
        zh = structure(zh_text, "zh")
        label = f"{relative(english)} <-> {relative(chinese)}"
        if en.heading_levels != zh.heading_levels:
            errors.append(f"heading hierarchy differs: {label}")
        if en.list_markers != zh.list_markers:
            errors.append(f"list structure differs: {label}")
        if en.code_fences != zh.code_fences:
            errors.append(f"code-fence sequence differs: {label}")
        if en.code_blocks != zh.code_blocks:
            errors.append(f"code-block content differs: {label}")
        if en.protected_tokens != zh.protected_tokens:
            missing = sorted(en.protected_tokens - zh.protected_tokens)
            extra = sorted(zh.protected_tokens - en.protected_tokens)
            errors.append(f"protected tokens differ: {label}; missing={missing}; extra={extra}")
        if "[English](" not in en_text or "[简体中文](" not in en_text:
            errors.append(f"language navigation missing from {relative(english)}")
        if "[English](" not in zh_text or "[简体中文](" not in zh_text:
            errors.append(f"language navigation missing from {relative(chinese)}")
        untranslated = untranslated_english_lines(zh_text)
        if untranslated:
            errors.append(f"possible untranslated English prose in {relative(chinese)}: {list(untranslated)}")

    localized_skill = ROOT / "chatgpt-chat/SKILL.zh-CN.md"
    if localized_skill.exists():
        errors.append("chatgpt-chat is the English-only exception and must not have SKILL.zh-CN.md")

    if errors:
        print("Bilingual documentation checks failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Bilingual documentation checks passed ({len(PAIRS)} mirrored pairs; chatgpt-chat English-only).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
