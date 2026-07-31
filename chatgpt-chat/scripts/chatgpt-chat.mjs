#!/usr/bin/env node

import { appendFileSync, chmodSync, mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

class PublicError extends Error {}

function publicError(message) {
  return new PublicError(message);
}

function parseArguments(argv) {
  const [command, ...rest] = argv;
  if (!new Set(["login", "inspect", "ask"]).has(command)) {
    throw publicError("usage: chatgpt-chat <login|inspect|ask> [options]");
  }
  const input = { command, cwd: process.cwd(), promptFile: null, newConversation: false, conversationUrl: null };
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === "--cwd" && rest[index + 1]) {
      input.cwd = resolve(rest[++index]);
      continue;
    }
    if (command === "ask" && argument === "--prompt-file" && rest[index + 1]) {
      input.promptFile = resolve(rest[++index]);
      continue;
    }
    if (command === "ask" && argument === "--new") {
      input.newConversation = true;
      continue;
    }
    if (command === "ask" && argument === "--conversation-url" && rest[index + 1]) {
      input.conversationUrl = rest[++index];
      continue;
    }
    throw publicError(`unknown argument: ${argument}`);
  }
  if (command === "ask") {
    if (!input.promptFile) throw publicError("--prompt-file is required");
    if (Number(input.newConversation) + Number(Boolean(input.conversationUrl)) !== 1) {
      throw publicError("exactly one of --new or --conversation-url is required");
    }
  }
  return input;
}

function validateResult(input, result) {
  if (!result || result.schema_version !== 1 || result.command !== input.command) {
    throw publicError("browser adapter returned an invalid result");
  }
  if (input.command === "login") {
    if (result.status !== "login_window_open") throw publicError("browser adapter returned an invalid login result");
    return result;
  }
  const contract = input.command === "inspect"
    ? {
        memoryScope: result.web_project?.memory_scope,
        mode: result.interaction?.mode,
        effort: result.interaction?.effort,
        model: result.interaction?.model,
      }
    : {
        memoryScope: result.verification?.memory_scope,
        mode: result.verification?.mode,
        effort: result.verification?.effort,
        model: result.verification?.model,
      };
  if (!(input.command === "inspect" && result.status === "project_missing")) {
    const valid = contract.memoryScope === "project-only"
      && contract.mode === "chat"
      && contract.effort === "Pro"
      && /^GPT-\d/.test(contract.model ?? "");
    if (!valid) throw publicError("browser contract not satisfied");
  }
  return result;
}

function recordDiagnostic(error) {
  const path = join(homedir(), ".local/state/chatgpt_chat/driver.log");
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const source = String(error?.stack ?? error);
  const redacted = source
    .replace(/https:\/\/[^\s]+/g, (value) => {
      try {
        const url = new URL(value);
        return `${url.origin}${url.pathname}${url.search ? "?[redacted]" : ""}`;
      } catch {
        return "[redacted-url]";
      }
    })
    .replace(/\s*x-oai-is-[^\n]*/gi, "")
    .slice(0, 8_000);
  appendFileSync(path, `${new Date().toISOString()} ${redacted}\n`, { mode: 0o600 });
  chmodSync(path, 0o600);
}

async function main() {
  const input = parseArguments(process.argv.slice(2));
  const adapterUrl = process.env.CHATGPT_CHAT_ADAPTER_MODULE
    ?? new URL("../lib/browser-cdp-adapter.mjs", import.meta.url).href;
  const adapter = await import(adapterUrl);
  const result = input.command === "login"
    ? await adapter.login({ cwd: input.cwd })
    : input.command === "inspect"
      ? await adapter.inspect({ cwd: input.cwd })
      : await adapter.ask({
        cwd: input.cwd,
        prompt: await readFile(input.promptFile, "utf8"),
        conversationUrl: input.conversationUrl,
        newConversation: input.newConversation,
      });
  process.stdout.write(`${JSON.stringify(validateResult(input, result))}\n`);
}

main().then(
  () => process.exit(0),
  (error) => {
    const safeAdapterMessages = {
      AUTH_REQUIRED: "AUTH_REQUIRED: run `chatgpt-chat login --cwd \"$PWD\"`, wait for the user to finish in the dedicated profile, then retry",
      AUTH_UNVERIFIED: "AUTH_UNVERIFIED: visible ChatGPT controls could not prove authentication; use the matching troubleshooting entry",
      CHALLENGE_REQUIRED: "CHALLENGE_REQUIRED: let the user complete the visible ChatGPT challenge, then retry",
      RUNTIME_MISSING: "RUNTIME_MISSING: request the managed deployment; do not install browser dependencies ad hoc",
      BROWSER_START_FAILED: "BROWSER_START_FAILED: the dedicated ChatGPT browser could not be started; use the matching troubleshooting entry",
      BROWSER_BUSY: "BROWSER_BUSY: another ChatGPT browser operation is active; wait for it to finish",
    };
    if (!(error instanceof PublicError) && !safeAdapterMessages[error?.code]) recordDiagnostic(error);
    const message = error instanceof PublicError
      ? error.message
      : safeAdapterMessages[error?.code]
        ?? "browser operation failed; inspect local diagnostics for details";
    process.stderr.write(`${message}\n`);
    process.exit(1);
  },
);
