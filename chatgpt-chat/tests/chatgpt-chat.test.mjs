import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, symlinkSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { pathToFileURL } from "node:url";

const skillRoot = resolve(import.meta.dirname, "..");
const cli = join(skillRoot, "scripts", "chatgpt-chat.mjs");

function fixture(adapterBody) {
  const root = mkdtempSync(join(tmpdir(), "chatgpt-chat-cli-"));
  const project = join(root, "sample-project");
  mkdirSync(project);
  const adapter = join(root, "adapter.mjs");
  writeFileSync(
    adapter,
    adapterBody ?? `export async function inspect(input) {
      return {
        schema_version: 1,
        command: "inspect",
        local_project: { name: "sample-project", root: input.cwd },
        web_project: { name: "sample-project", url: "https://chatgpt.com/g/example/project", memory_scope: "project-only" },
        interaction: { mode: "chat", effort: "Pro", model: "GPT-5.6 Sol" },
        conversations: []
      };
    }\n`,
  );
  return { root, project, adapter };
}

test("login opens the dedicated profile through the CLI seam", () => {
  const { project, adapter } = fixture(`export async function login({ cwd }) {
    return { schema_version: 1, command: "login", status: "login_window_open", local_project: cwd };
  }\n`);
  const result = spawnSync(process.execPath, [cli, "login", "--cwd", project], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    schema_version: 1,
    command: "login",
    status: "login_window_open",
    local_project: project,
  });
  assert.equal(result.stdout.trim().split("\n").length, 1);
});

test("inspect emits one compact JSON result through the CLI seam", () => {
  const { project, adapter } = fixture();
  const result = spawnSync(process.execPath, [cli, "inspect", "--cwd", project], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  assert.deepEqual(JSON.parse(result.stdout), {
    schema_version: 1,
    command: "inspect",
    local_project: { name: "sample-project", root: project },
    web_project: {
      name: "sample-project",
      url: "https://chatgpt.com/g/example/project",
      memory_scope: "project-only",
    },
    interaction: { mode: "chat", effort: "Pro", model: "GPT-5.6 Sol" },
    conversations: [],
  });
  assert.ok(result.stdout.length < 600);
});

test("inspect fails closed when the browser adapter cannot prove project-only Chat Pro", () => {
  const { project, adapter } = fixture(`export async function inspect(input) {
    return {
      schema_version: 1,
      command: "inspect",
      local_project: { name: "sample-project", root: input.cwd },
      web_project: { name: "sample-project", url: "https://chatgpt.com/g/example/project", memory_scope: "default" },
      interaction: { mode: "work", effort: "High", model: "GPT-5.5" },
      conversations: []
    };
  }\n`);
  const result = spawnSync(process.execPath, [cli, "inspect", "--cwd", project], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /browser contract not satisfied/);
  assert.doesNotMatch(result.stderr, /https:\/\//);
});

test("ask reads the prompt file and requires an explicit conversation choice", () => {
  const { project, adapter, root } = fixture(`export async function ask(input) {
    return {
      schema_version: 1,
      command: "ask",
      status: "completed",
      conversation_url: "https://chatgpt.com/c/example",
      verification: { project: "sample-project", memory_scope: "project-only", mode: "chat", effort: "Pro", model: "GPT-5.6 Sol" },
      response_path: input.prompt === "Review this repository.\\n" ? "/artifacts/response.md" : "wrong-prompt",
      attachments: []
    };
  }\n`);
  const promptFile = join(root, "prompt.txt");
  writeFileSync(promptFile, "Review this repository.\n");

  const result = spawnSync(
    process.execPath,
    [cli, "ask", "--cwd", project, "--prompt-file", promptFile, "--new"],
    {
      encoding: "utf8",
      env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    schema_version: 1,
    command: "ask",
    status: "completed",
    conversation_url: "https://chatgpt.com/c/example",
    verification: { project: "sample-project", memory_scope: "project-only", mode: "chat", effort: "Pro", model: "GPT-5.6 Sol" },
    response_path: "/artifacts/response.md",
    attachments: [],
  });

  const ambiguous = spawnSync(
    process.execPath,
    [cli, "ask", "--cwd", project, "--prompt-file", promptFile],
    {
      encoding: "utf8",
      env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
    },
  );
  assert.notEqual(ambiguous.status, 0);
  assert.match(ambiguous.stderr, /exactly one of --new or --conversation-url/);
});

test("ask accepts repeated review attachments through the public CLI seam", () => {
  const root = mkdtempSync(join(tmpdir(), "chatgpt-chat-attachments-"));
  const project = join(root, "sample-project");
  mkdirSync(project);
  const promptFile = join(root, "prompt.txt");
  const archive = join(root, "module-review.zip");
  const notes = join(root, "context.md");
  writeFileSync(promptFile, "Review the attached module.\n");
  writeFileSync(archive, "zip fixture");
  writeFileSync(notes, "# Context\n");
  const adapter = join(root, "adapter.mjs");
  writeFileSync(adapter, `export async function ask(input) {
    if (JSON.stringify(input.attachmentPaths) !== ${JSON.stringify(JSON.stringify([archive, notes]))}) {
      throw new Error("attachments were not forwarded");
    }
    return {
      schema_version: 1,
      command: "ask",
      status: "completed",
      conversation_url: "https://chatgpt.com/c/example",
      verification: { project: "sample-project", memory_scope: "project-only", mode: "chat", effort: "Pro", model: "GPT-5.6 Sol" },
      response_path: "/artifacts/response.md",
      uploaded_attachments: [{ name: "module-review.zip", bytes: 11 }, { name: "context.md", bytes: 10 }],
      attachments: []
    };
  }\n`);

  const result = spawnSync(process.execPath, [
    cli, "ask", "--cwd", project, "--prompt-file", promptFile,
    "--attachment", archive, "--attachment", notes, "--new",
  ], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).uploaded_attachments, [
    { name: "module-review.zip", bytes: 11 },
    { name: "context.md", bytes: 10 },
  ]);
});

test("ask rejects symlinked review attachments before opening the browser", () => {
  const { project, adapter, root } = fixture(`export async function ask() {
    throw new Error("browser adapter must not be called");
  }\n`);
  const promptFile = join(root, "prompt.txt");
  const archive = join(root, "module-review.zip");
  const link = join(root, "linked-review.zip");
  writeFileSync(promptFile, "Review the attached module.\n");
  writeFileSync(archive, "zip fixture");
  symlinkSync(archive, link);

  const result = spawnSync(process.execPath, [
    cli, "ask", "--cwd", project, "--prompt-file", promptFile,
    "--attachment", link, "--new",
  ], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });

  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /attachment must be a regular file and not a symbolic link/);
});

test("ask accepts only review-document and archive attachment types", () => {
  const { project, adapter, root } = fixture(`export async function ask() {
    throw new Error("browser adapter must not be called");
  }\n`);
  const promptFile = join(root, "prompt.txt");
  const executable = join(root, "review.exe");
  writeFileSync(promptFile, "Review the attachment.\n");
  writeFileSync(executable, "not allowed");

  const result = spawnSync(process.execPath, [
    cli, "ask", "--cwd", project, "--prompt-file", promptFile,
    "--attachment", executable, "--new",
  ], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });

  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /unsupported attachment type: \.exe/);
});

test("ask rejects review attachments larger than 100 MiB", () => {
  const { project, adapter, root } = fixture(`export async function ask() {
    throw new Error("browser adapter must not be called");
  }\n`);
  const promptFile = join(root, "prompt.txt");
  const archive = join(root, "oversized.zip");
  writeFileSync(promptFile, "Review the attachment.\n");
  writeFileSync(archive, "x");
  truncateSync(archive, 100 * 1024 * 1024 + 1);

  const result = spawnSync(process.execPath, [
    cli, "ask", "--cwd", project, "--prompt-file", promptFile,
    "--attachment", archive, "--new",
  ], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });

  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /attachment exceeds 100 MiB limit/);
});

test("an unauthenticated dedicated profile returns one actionable safe error", () => {
  const { project, adapter } = fixture(`export async function inspect() {
    throw Object.assign(new Error("internal browser detail"), { code: "AUTH_REQUIRED" });
  }\n`);
  const result = spawnSync(process.execPath, [cli, "inspect", "--cwd", project], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /^AUTH_REQUIRED: .*chatgpt-chat login/);
  assert.doesNotMatch(result.stderr, /Edge/);
});

test("a missing managed browser runtime returns an action instead of inviting self-install", () => {
  const { project, adapter } = fixture(`export async function inspect() {
    throw Object.assign(new Error("internal module path"), { code: "RUNTIME_MISSING" });
  }\n`);
  const result = spawnSync(process.execPath, [cli, "inspect", "--cwd", project], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /^RUNTIME_MISSING: .*managed deployment/);
  assert.doesNotMatch(result.stderr, /npm install|internal module path/);
});

test("adapter failures do not expose signed URLs or receipt data", () => {
  const { project, adapter, root } = fixture(`export async function inspect() {
    throw new Error("request failed https://chatgpt.com/backend-api/file?sig=secret x-oai-is-receipt: private");
  }\n`);
  const result = spawnSync(process.execPath, [cli, "inspect", "--cwd", project], {
    encoding: "utf8",
    env: { ...process.env, HOME: root, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "browser operation failed; inspect local diagnostics for details\n");
  const diagnostic = readFileSync(join(root, ".local/state/chatgpt_chat/driver.log"), "utf8");
  assert.match(diagnostic, /request failed https:\/\/chatgpt.com\/backend-api\/file\?\[redacted\]/);
  assert.doesNotMatch(diagnostic, /secret|private|x-oai-is-receipt/i);
});

test("ask refuses to report completion without a verified browser contract", () => {
  const { project, adapter, root } = fixture(`export async function ask() {
    return { schema_version: 1, command: "ask", status: "completed", conversation_url: "https://chatgpt.com/c/example", response_path: "/tmp/reply", attachments: [] };
  }\n`);
  const promptFile = join(root, "prompt.txt");
  writeFileSync(promptFile, "Question\n");
  const result = spawnSync(process.execPath, [cli, "ask", "--cwd", project, "--prompt-file", promptFile, "--new"], {
    encoding: "utf8",
    env: { ...process.env, CHATGPT_CHAT_ADAPTER_MODULE: pathToFileURL(adapter).href },
  });
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /browser contract not satisfied/);
});
