import importlib.util
import sys
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts/checks/check_bilingual_docs.py"
SPEC = importlib.util.spec_from_file_location("check_bilingual_docs", MODULE_PATH)
CHECK = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = CHECK
SPEC.loader.exec_module(CHECK)


class BilingualStructureTest(unittest.TestCase):
    def test_repository_pairs_pass(self):
        self.assertEqual(0, CHECK.main())

    def test_structure_detects_protected_token_drift(self):
        english = CHECK.structure("# Title\n\nRun `safe-refactor`.\n", "en")
        chinese = CHECK.structure("# 标题\n\n运行 `system-design`。\n", "zh")
        self.assertNotEqual(english.protected_tokens, chinese.protected_tokens)

    def test_structure_ignores_translated_heading_text(self):
        english = CHECK.structure("# Title\n\n## Scope\n", "en")
        chinese = CHECK.structure("# 标题\n\n## 范围\n", "zh")
        self.assertEqual(english.heading_levels, chinese.heading_levels)

    def test_untranslated_english_prose_is_detected_outside_code(self):
        text = "# 中文\n\nThis entire instruction was accidentally left in English and should be translated before merging.\n"
        self.assertEqual(1, len(CHECK.untranslated_english_lines(text)))

    def test_technical_terms_in_chinese_are_not_flagged(self):
        text = "# 中文\n\n使用 Agent、Owner、Port 和 Project 维护同一份契约。\n"
        self.assertEqual((), CHECK.untranslated_english_lines(text))


if __name__ == "__main__":
    unittest.main()
