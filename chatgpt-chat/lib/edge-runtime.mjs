import { spawn } from "node:child_process";
import { closeSync, mkdirSync, openSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const stateRoot = join(homedir(), ".local/state/chatgpt_chat");
export const profileDirectory = join(homedir(), ".local/share/chatgpt_chat/edge-profile");
const activePortFile = join(profileDirectory, "DevToolsActivePort");
const lockFile = join(stateRoot, "edge-driver.lock");
const playwrightEntry = join(
  homedir(),
  ".local/lib/node_modules/playwriter/node_modules/@xmorse/playwright-core/index.js",
);

function codedError(code, message) {
  return Object.assign(new Error(message), { code });
}

function endpointFromFile() {
  try {
    const [port] = readFileSync(activePortFile, "utf8").trim().split(/\r?\n/);
    if (!/^\d+$/.test(port)) return null;
    return `http://127.0.0.1:${port}`;
  } catch {
    return null;
  }
}

async function endpointIsLive(endpoint) {
  if (!endpoint) return false;
  try {
    const response = await fetch(`${endpoint}/json/version`, { signal: AbortSignal.timeout(1_000) });
    return response.ok;
  } catch {
    return false;
  }
}

function desktopEnvironment() {
  const uid = process.getuid();
  return {
    ...process.env,
    DISPLAY: process.env.DISPLAY || ":0",
    XAUTHORITY: process.env.XAUTHORITY || join(homedir(), ".Xauthority"),
    XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || `/run/user/${uid}`,
    DBUS_SESSION_BUS_ADDRESS: process.env.DBUS_SESSION_BUS_ADDRESS || `unix:path=/run/user/${uid}/bus`,
  };
}

export async function startEdge(startUrl = "https://chatgpt.com/") {
  mkdirSync(profileDirectory, { recursive: true, mode: 0o700 });
  mkdirSync(stateRoot, { recursive: true, mode: 0o700 });
  const existing = endpointFromFile();
  if (await endpointIsLive(existing)) return { endpoint: existing, started: false };

  const startedAt = Date.now();
  const child = spawn("/usr/bin/microsoft-edge", [
    `--user-data-dir=${profileDirectory}`,
    "--remote-debugging-port=0",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-session-crashed-bubble",
    "--new-window",
    startUrl,
  ], {
    detached: true,
    env: desktopEnvironment(),
    stdio: "ignore",
  });
  child.unref();

  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const endpoint = endpointFromFile();
    if (endpoint && await endpointIsLive(endpoint)) return { endpoint, started: true, startedAt };
  }
  throw codedError("EDGE_START_FAILED", "Dedicated Edge did not expose a CDP endpoint");
}

function acquireLock(allowStaleRecovery = true) {
  mkdirSync(stateRoot, { recursive: true, mode: 0o700 });
  try {
    const descriptor = openSync(lockFile, "wx", 0o600);
    writeFileSync(descriptor, `${process.pid}\n`);
    closeSync(descriptor);
    return () => { try { unlinkSync(lockFile); } catch {} };
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const owner = Number.parseInt(readFileSync(lockFile, "utf8"), 10);
    let active = Number.isInteger(owner);
    if (active) {
      try { process.kill(owner, 0); } catch (signalError) {
        if (signalError?.code === "ESRCH") active = false;
        else throw signalError;
      }
    }
    if (!active && allowStaleRecovery) {
      unlinkSync(lockFile);
      return acquireLock(false);
    }
    throw codedError("EDGE_BUSY", "Another ChatGPT browser operation is active");
  }
}

export async function withEdgePage(operation) {
  const release = acquireLock();
  let browser = null;
  try {
    const { endpoint } = await startEdge();
    const playwright = await import(pathToFileURL(playwrightEntry).href);
    const chromium = playwright.default.chromium;
    browser = await chromium.connectOverCDP(endpoint);
    const context = browser.contexts()[0];
    if (!context) throw new Error("Dedicated Edge exposed no browser context");
    let page = context.pages().find((candidate) => candidate.url().startsWith("https://chatgpt.com/"));
    page ??= context.pages()[0] ?? await context.newPage();
    for (const candidate of context.pages()) {
      if (candidate !== page) await candidate.close();
    }
    return await operation(page);
  } catch (error) {
    if (error?.code === "AUTH_REQUIRED" && browser) {
      browser._connection.close();
      browser = null;
    }
    throw error;
  } finally {
    if (browser) {
      try {
        const session = await browser.newBrowserCDPSession();
        await session.send("Browser.close");
      } catch {}
      browser._connection.close();
    }
    release();
  }
}

export function authRequired() {
  return codedError("AUTH_REQUIRED", "Dedicated Edge profile is not authenticated to ChatGPT");
}
