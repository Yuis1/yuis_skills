import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const skill = readFileSync(resolve(root, "SKILL.md"), "utf8");

test("normal use stays on the public CLI seam", () => {
  assert.match(skill, /正常路径/);
  assert.match(skill, /不要读取.*references\/research\.md/s);
  assert.match(skill, /不要读取.*lib\/.*scripts\//s);
  assert.match(skill, /command -v chatgpt-chat/);
  assert.match(skill, /未安装.*停止/s);
});

test("authentication guidance uses the dedicated profile without improvising cookie migration", () => {
  assert.match(skill, /专用 Profile.*Cookie/s);
  assert.match(skill, /AUTH_REQUIRED.*chatgpt-chat login/s);
  assert.match(skill, /等待用户.*完成/);
  assert.match(skill, /不得.*Cookie.*迁移/s);
});

test("low-frequency detail is disclosed only for a matching failure", () => {
  assert.match(skill, /仅在失败时/);
  assert.match(skill, /references\/troubleshooting\.md/);
  assert.ok(skill.length < 5_000, `SKILL.md is too large for progressive disclosure: ${skill.length}`);
});
