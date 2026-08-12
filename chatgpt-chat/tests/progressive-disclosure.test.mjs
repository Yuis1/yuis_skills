import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const skill = readFileSync(resolve(root, "SKILL.md"), "utf8");

test("normal use stays on the public CLI seam", () => {
  assert.match(skill, /Normal Path/);
  assert.match(skill, /Do not read implementation, research, or tests/);
  assert.match(skill, /command -v chatgpt-chat/);
  assert.match(skill, /missing.*COMMAND_MISSING/s);
});

test("browser diversity and reconnect are hidden behind one workflow", () => {
  assert.match(skill, /prefers the only connected Edge Profile/);
  assert.match(skill, /then the only Chrome Profile/);
  assert.match(skill, /reconnection.*bounded retry.*automatic/s);
  assert.match(skill, /rather than guessing an account/);
});

test("normal use retains governed conversations and project sources", () => {
  assert.match(skill, /source-list/);
  assert.match(skill, /source-add/);
  assert.match(skill, /source-remove/);
  assert.match(skill, /confirm-project-source-delete/);
  assert.match(skill, /response_path/);
});

test("low-frequency detail is disclosed only for a matching failure", () => {
  assert.match(skill, /Failure Only/);
  assert.match(skill, /references\/troubleshooting\.md/);
  assert.ok(skill.length < 3_000, `SKILL.md is too large for progressive disclosure: ${skill.length}`);
});
