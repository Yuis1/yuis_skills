import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const RESULT_MARKER = "CHATGPT_CHAT_RESULT:";
const ERROR_MARKER = "CHATGPT_CHAT_ERROR:";

function codedError(code, message, diagnostics = {}, cause = undefined) {
  return Object.assign(new Error(message, cause ? { cause } : undefined), {
    code,
    diagnostics: { diagnostic_id: randomUUID(), ...diagnostics },
  });
}

export function parseBrowserList(output) {
  const lines = output.split(/\r?\n/);
  const separator = lines.findIndex((line) => /^-{4,}$/.test(line.trim()));
  if (separator < 1) return [];
  const headers = [...lines[separator - 1].matchAll(/\S+/g)].map((match) => ({
    name: match[0].toLowerCase(),
    start: match.index,
  }));
  return lines.slice(separator + 1)
    .filter((line) => line.trim() && !line.startsWith("Use with:") && !line.startsWith("Tip:"))
    .map((line) => Object.fromEntries(headers.map(({ name, start }, index) => [
      name,
      line.slice(start, headers[index + 1]?.start).trim(),
    ])))
    .filter((entry) => entry.type === "extension" && /^(Edge|Chrome)$/i.test(entry.browser));
}

export function chooseConnectedBrowser(browsers) {
  for (const family of ["Edge", "Chrome"]) {
    const matches = browsers.filter((browser) => browser.browser.toLowerCase() === family.toLowerCase());
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      throw codedError(
        "BROWSER_PROFILE_AMBIGUOUS",
        `Multiple ${family} Profiles are connected; keep exactly one intended Profile connected`,
      );
    }
  }
  throw codedError("BROWSER_NOT_CONNECTED", "No Playwriter-connected Microsoft Edge or Google Chrome Profile is available");
}

export function parseSessionId(output) {
  const id = output.match(/Session\s+(\d+)\s+created/)?.[1];
  if (!id) throw new Error("Playwriter returned no session ID");
  return id;
}

function parseWorkflowResult(output) {
  const marked = output.split(/\r?\n/).find((line) => line.includes(RESULT_MARKER));
  if (!marked) throw new Error("Browser workflow returned no result marker");
  return JSON.parse(marked.slice(marked.indexOf(RESULT_MARKER) + RESULT_MARKER.length));
}

function operationTimeout(input) {
  if (input.command !== "ask") return 600_000;
  const poll = Number(process.env.CHATGPT_CHAT_POLL_MILLISECONDS || 600_000);
  return Math.max(3_600_000, Number.isFinite(poll) ? poll * 12 : 7_200_000);
}

function workflowProgram(input) {
  const workflowUrl = new URL(`./browser-workflow.mjs?version=${Date.now()}`, import.meta.url).href;
  return `
const ownedPage = await context.newPage();
let phase = "pre_submit";
let phaseDetail = {};
try {
  const { runWorkflow } = await globalThis.import(${JSON.stringify(workflowUrl)});
  const result = await runWorkflow(ownedPage, ${JSON.stringify(input)}, {
    onPhase(nextPhase, detail = {}) { phase = nextPhase; phaseDetail = detail; },
  });
  console.log(${JSON.stringify(RESULT_MARKER)} + JSON.stringify(result));
} catch (error) {
  console.log(${JSON.stringify(ERROR_MARKER)} + JSON.stringify({
    phase,
    ...phaseDetail,
    message: String(error?.message ?? error),
  }));
  throw error;
} finally {
  if (!ownedPage.isClosed()) await ownedPage.close().catch(() => {});
}
`;
}

function parseWorkflowError(output) {
  const marked = String(output).split(/\r?\n/).find((line) => line.includes(ERROR_MARKER));
  if (!marked) return null;
  try {
    return JSON.parse(marked.slice(marked.indexOf(ERROR_MARKER) + ERROR_MARKER.length));
  } catch {
    return null;
  }
}

function classifyBrowserError(error, input, { attempts, recoveryAttempted } = {}) {
  const workflow = parseWorkflowError(error?.message ?? error);
  const message = String(workflow?.message ?? error?.message ?? error);
  const phase = workflow?.phase ?? (input.command === "ask" ? "unknown" : input.command);
  const diagnostics = {
    phase,
    recovery_attempted: Boolean(recoveryAttempted),
    attempts: attempts ?? 1,
  };
  if (input.command === "ask" && phase === "submitted_confirmed" && workflow?.conversationUrl) {
    return codedError(
      "ASK_RESPONSE_INTERRUPTED",
      "The response observation was interrupted after submission was confirmed",
      { ...diagnostics, conversation_url: workflow.conversationUrl },
      error,
    );
  }
  if (input.command === "ask" && phase !== "pre_submit") {
    return codedError(
      "ASK_SUBMISSION_UNKNOWN",
      "The browser connection ended after submission may have started",
      diagnostics,
      error,
    );
  }
  if (/Target page, context or browser has been closed|Page closed|page has been closed/i.test(message)) {
    return codedError("PAGE_CLOSED", "The CLI-owned ChatGPT tab closed during the operation", diagnostics, error);
  }
  if (/Extension (?:connection closed|not connected|request timeout)|Browser disconnected|No Playwright pages are available|fetch failed/i.test(message)) {
    return codedError("RELAY_DISCONNECTED", "The Playwriter connection to the selected browser Profile was interrupted", diagnostics, error);
  }
  return error;
}

function isRecoverableBrowserError(error) {
  return ["PAGE_CLOSED", "RELAY_DISCONNECTED", "ASK_RESPONSE_INTERRUPTED"].includes(error?.code);
}

function canRetry(input, error) {
  if (["doctor", "login", "inspect", "source-list"].includes(input.command)) return true;
  return input.command === "ask" && ["pre_submit", "submitted_confirmed"].includes(error?.diagnostics?.phase);
}

async function defaultDiscovery({ home = homedir() } = {}) {
  const playwriter = join(home, ".local/bin/playwriter");
  if (!existsSync(playwriter)) throw codedError("RUNTIME_MISSING", "The managed Playwriter CLI is not installed");
  const relayUrl = "http://127.0.0.1:19988";
  let output;
  try {
    ({ stdout: output } = await execFileAsync(playwriter, ["browser", "list"], {
      encoding: "utf8",
      timeout: 30_000,
      maxBuffer: 2 * 1024 * 1024,
    }));
  } catch (error) {
    if (error?.code === "ENOENT") throw codedError("RUNTIME_MISSING", "The managed Playwriter CLI is not installed");
    throw error;
  }
  const browsers = parseBrowserList(output);
  return {
    browsers,
    client: {
      async createSession({ browserKey, cwd }) {
        const { stdout } = await execFileAsync(playwriter, ["session", "new", "--browser", browserKey], {
          cwd,
          encoding: "utf8",
          timeout: 30_000,
          maxBuffer: 2 * 1024 * 1024,
        });
        return { id: parseSessionId(stdout) };
      },
      async execute(sessionId, code, timeout) {
        const response = await fetch(`${relayUrl}/cli/execute`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, code, timeout }),
          signal: AbortSignal.timeout(timeout + 30_000),
        });
        if (!response.ok) throw new Error(`Playwriter execute failed with HTTP ${response.status}`);
        return response.json();
      },
      async resetSession(sessionId) {
        await execFileAsync(playwriter, ["session", "reset", sessionId], { encoding: "utf8", timeout: 30_000 });
      },
      async waitForBrowser(browserKey) {
        const deadline = Date.now() + 30_000;
        while (Date.now() < deadline) {
          const { stdout } = await execFileAsync(playwriter, ["browser", "list"], {
            encoding: "utf8",
            timeout: 30_000,
            maxBuffer: 2 * 1024 * 1024,
          });
          if (parseBrowserList(stdout).some((browser) => browser.key === browserKey)) return;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        throw codedError("BROWSER_NOT_CONNECTED", "The browser extension did not reconnect automatically");
      },
      async deleteSession(sessionId) {
        await execFileAsync(playwriter, ["session", "delete", sessionId], { encoding: "utf8", timeout: 30_000 });
      },
    },
  };
}

export async function openBrowserTransport(input, {
  cwd = process.cwd(),
  discover = defaultDiscovery,
} = {}) {
  const runtime = await discover();
  const browser = chooseConnectedBrowser(runtime.browsers);
  const session = await runtime.client.createSession({ browserKey: browser.key, cwd });
  let program = workflowProgram(input);
  const timeout = operationTimeout(input);
  const execute = async (attempts, recoveryAttempted) => {
    try {
      const execution = await runtime.client.execute(session.id, program, timeout);
      if (execution.isError) throw new Error(execution.text);
      return execution;
    } catch (error) {
      throw classifyBrowserError(error, input, { attempts, recoveryAttempted });
    }
  };
  let execution;
  try {
    execution = await execute(1, false);
  } catch (error) {
    if (!isRecoverableBrowserError(error) || !canRetry(input, error)) {
      await runtime.client.deleteSession(session.id).catch(() => {});
      throw error;
    }
    try {
      await runtime.client.waitForBrowser(browser.key);
    } catch (waitError) {
      await runtime.client.deleteSession(session.id).catch(() => {});
      throw codedError(
        "BROWSER_NOT_CONNECTED",
        "The originally selected browser Profile did not reconnect in time",
        { phase: error.diagnostics?.phase ?? "unknown", recovery_attempted: true, attempts: 1 },
        waitError,
      );
    }
    try {
      await runtime.client.resetSession(session.id);
    } catch (resetError) {
      await runtime.client.deleteSession(session.id).catch(() => {});
      throw codedError(
        "RELAY_DISCONNECTED",
        "The Playwriter session could not reconnect to the selected browser Profile",
        { phase: error.diagnostics?.phase ?? "unknown", recovery_attempted: true, attempts: 1 },
        resetError,
      );
    }
    if (error.code === "ASK_RESPONSE_INTERRUPTED") {
      input = { ...input, resumeConversationUrl: error.diagnostics.conversation_url };
      program = workflowProgram(input);
    }
    try {
      execution = await execute(2, true);
    } catch (retryError) {
      await runtime.client.deleteSession(session.id).catch(() => {});
      throw retryError;
    }
  }
  return {
    mode: "extension",
    browser,
    client: runtime.client,
    sessionId: session.id,
    result: parseWorkflowResult(execution.text),
  };
}

export async function closeBrowserTransport(transport) {
  await transport.client.deleteSession(transport.sessionId).catch(() => {});
}

export async function openLoginTransport(input = {}, options = {}) {
  const transport = await openBrowserTransport({ ...input, command: "login" }, options);
  return {
    ...transport,
    family: transport.browser.browser.toLowerCase(),
  };
}
