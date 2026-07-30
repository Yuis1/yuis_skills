#!/usr/bin/env python3
"""Maintain a credential-free local index for ChatGPT Web Projects."""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from typing import Any
from urllib.parse import urlparse

STATE_PATH = Path.home() / ".local/state/chatgpt_chat/projects.json"
ARTIFACT_ROOT = Path.home() / ".local/share/chatgpt_chat/artifacts"
SCHEMA_VERSION = 1


def project_identity(cwd: str) -> tuple[str, str]:
    candidate = Path(cwd).expanduser().resolve()
    try:
        result = subprocess.run(
            ["git", "-C", str(candidate), "rev-parse", "--show-toplevel"],
            check=True,
            capture_output=True,
            text=True,
        )
        root = Path(result.stdout.strip()).resolve()
    except (subprocess.CalledProcessError, FileNotFoundError):
        root = candidate
    return str(root), root.name or "root"


def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        return {"schema_version": SCHEMA_VERSION, "projects": {}}
    data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    if data.get("schema_version") != SCHEMA_VERSION or not isinstance(data.get("projects"), dict):
        raise SystemExit(f"Unsupported ChatGPT project index schema: {STATE_PATH}")
    return data


def save_state(data: dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    STATE_PATH.parent.chmod(0o700)
    temporary = STATE_PATH.with_suffix(".json.new")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.chmod(0o600)
    os.replace(temporary, STATE_PATH)


def validate_chatgpt_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme != "https" or parsed.hostname not in {"chatgpt.com", "www.chatgpt.com"}:
        raise argparse.ArgumentTypeError("URL must be an https://chatgpt.com URL")
    return value


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def entry_for(data: dict[str, Any], root: str, name: str) -> dict[str, Any]:
    return data["projects"].setdefault(
        root,
        {"local_name": name, "project_url": None, "conversations": [], "updated_at": now()},
    )


def safe_component(name: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip(".-")
    return normalized[:80] or "project"


def command_resolve(args: argparse.Namespace) -> None:
    root, name = project_identity(args.cwd)
    data = load_state()
    print(json.dumps({"local_root": root, "local_name": name, "mapping": data["projects"].get(root)}, ensure_ascii=False, indent=2))


def command_bind_project(args: argparse.Namespace) -> None:
    root, name = project_identity(args.cwd)
    data = load_state()
    entry = entry_for(data, root, name)
    entry["local_name"] = name
    entry["project_url"] = args.url
    entry["memory_scope"] = args.memory_scope
    entry["updated_at"] = now()
    save_state(data)
    print(args.url)


def command_record_conversation(args: argparse.Namespace) -> None:
    root, name = project_identity(args.cwd)
    data = load_state()
    entry = entry_for(data, root, name)
    conversations = entry["conversations"]
    existing = next((item for item in conversations if item.get("url") == args.url), None)
    record = existing if existing is not None else {}
    record.update({"url": args.url, "title": args.title, "topic": args.topic, "last_used_at": now()})
    if existing is None:
        conversations.append(record)
    conversations.sort(key=lambda item: item.get("last_used_at", ""), reverse=True)
    del conversations[50:]
    entry["updated_at"] = now()
    save_state(data)
    print(json.dumps(record, ensure_ascii=False))


def command_artifact_dir(args: argparse.Namespace) -> None:
    root, name = project_identity(args.cwd)
    suffix = hashlib.sha256(root.encode("utf-8")).hexdigest()[:10]
    destination = ARTIFACT_ROOT / f"{safe_component(name)}-{suffix}"
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    destination.chmod(0o700)
    print(destination)


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    subparsers = result.add_subparsers(dest="command", required=True)

    resolve = subparsers.add_parser("resolve")
    resolve.add_argument("--cwd", default=os.getcwd())
    resolve.set_defaults(handler=command_resolve)

    bind = subparsers.add_parser("bind-project")
    bind.add_argument("--cwd", default=os.getcwd())
    bind.add_argument("--url", required=True, type=validate_chatgpt_url)
    bind.add_argument("--memory-scope", required=True, choices=("project-only",))
    bind.set_defaults(handler=command_bind_project)

    record = subparsers.add_parser("record-conversation")
    record.add_argument("--cwd", default=os.getcwd())
    record.add_argument("--url", required=True, type=validate_chatgpt_url)
    record.add_argument("--title", required=True)
    record.add_argument("--topic", required=True)
    record.set_defaults(handler=command_record_conversation)

    artifact = subparsers.add_parser("artifact-dir")
    artifact.add_argument("--cwd", default=os.getcwd())
    artifact.set_defaults(handler=command_artifact_dir)
    return result


def main() -> int:
    args = parser().parse_args()
    args.handler(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
