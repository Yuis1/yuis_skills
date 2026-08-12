#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = SKILL_ROOT / "scripts/project_state.py"
SKILL = SKILL_ROOT / "SKILL.md"


class ProjectStateTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.home = Path(self.temp.name) / "home"
        self.project = Path(self.temp.name) / "sample-project"
        self.home.mkdir()
        self.project.mkdir()
        subprocess.run(["git", "init", "-q", str(self.project)], check=True)
        self.env = {**os.environ, "HOME": str(self.home)}

    def tearDown(self) -> None:
        self.temp.cleanup()

    def run_script(self, *arguments: str, check: bool = True) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(SCRIPT), *arguments],
            check=check,
            capture_output=True,
            text=True,
            env=self.env,
        )

    def test_resolve_bind_record_and_artifact_directory(self) -> None:
        resolved = json.loads(self.run_script("resolve", "--cwd", str(self.project)).stdout)
        self.assertEqual(resolved["local_name"], "sample-project")
        self.assertIsNone(resolved["mapping"])

        project_url = "https://chatgpt.com/g/g-p-example/project"
        self.run_script(
            "bind-project", "--cwd", str(self.project), "--url", project_url,
            "--memory-scope", "project-only",
        )
        conversation_url = "https://chatgpt.com/c/12345678"
        self.run_script(
            "record-conversation",
            "--cwd", str(self.project),
            "--url", conversation_url,
            "--title", "Architecture review",
            "--topic", "Review the current project architecture.",
        )
        mapping = json.loads(self.run_script("resolve", "--cwd", str(self.project)).stdout)["mapping"]
        self.assertEqual(mapping["project_url"], project_url)
        self.assertEqual(mapping["memory_scope"], "project-only")
        self.assertEqual(mapping["conversations"][0]["url"], conversation_url)
        self.assertEqual((self.home / ".local/state/chatgpt_chat/projects.json").stat().st_mode & 0o777, 0o600)

        artifact = Path(self.run_script("artifact-dir", "--cwd", str(self.project)).stdout.strip())
        self.assertTrue(artifact.is_dir())
        self.assertEqual(artifact.stat().st_mode & 0o777, 0o700)

    def test_rejects_non_chatgpt_urls(self) -> None:
        result = self.run_script(
            "bind-project", "--cwd", str(self.project), "--url", "https://example.com/project", check=False
        )
        self.assertNotEqual(result.returncode, 0)

    def test_skill_keeps_critical_fail_closed_contracts(self) -> None:
        text = SKILL.read_text(encoding="utf-8")
        for phrase in (
            "existing Profile owns authentication",
            "Project-only Memory",
            "Chat",
            "Pro",
            "latest visible flagship GPT",
            "only its own ChatGPT tab",
            "emit cookies",
            "do not execute them",
        ):
            self.assertIn(phrase, text)


if __name__ == "__main__":
    unittest.main()
