import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const skill = readFileSync(resolve(root, "SKILL.md"), "utf8");

test("normal use stays on the public CLI seam", () => {
  assert.match(skill, /正常路径/);
  assert.match(skill, /不要读取实现、研究或测试/);
  assert.match(skill, /command -v chatgpt-chat/);
  assert.match(skill, /缺失.*COMMAND_MISSING/s);
});

test("browser diversity and reconnect are hidden behind one workflow", () => {
  assert.match(skill, /优先使用唯一连接的 Edge Profile/);
  assert.match(skill, /没有 Edge.*Chrome Profile/s);
  assert.match(skill, /自动等待扩展重连.*有限重试/s);
  assert.match(skill, /不猜测账号/);
});

test("normal use retains governed conversations and project sources", () => {
  assert.match(skill, /source-list/);
  assert.match(skill, /source-add/);
  assert.match(skill, /source-remove/);
  assert.match(skill, /confirm-project-source-delete/);
  assert.match(skill, /response_path/);
});

test("low-frequency detail is disclosed only for a matching failure", () => {
  assert.match(skill, /仅在失败时/);
  assert.match(skill, /references\/troubleshooting\.md/);
  assert.ok(skill.length < 3_000, `SKILL.md is too large for progressive disclosure: ${skill.length}`);
});
