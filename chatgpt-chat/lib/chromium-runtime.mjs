import { spawn } from "node:child_process";
import {
  accessSync,
  closeSync,
  constants,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";

function codedError(code, message) {
  return Object.assign(new Error(message), { code });
}

function executable(path) {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function resolveBrowserRuntime({
  environment = process.env,
  home = homedir(),
  isExecutable = executable,
  pathExists = existsSync,
} = {}) {
  const override = environment.CHATGPT_CHAT_BROWSER_EXECUTABLE;
  const candidates = override
    ? [override]
    : [
        "/usr/bin/microsoft-edge",
        "/usr/bin/microsoft-edge-stable",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/opt/google/chrome/google-chrome",
      ];
  const browserExecutable = candidates.find(isExecutable);
  if (!browserExecutable) {
    throw codedError("BROWSER_START_FAILED", "No supported Microsoft Edge or Google Chrome executable is installed");
  }
  const name = basename(browserExecutable).toLowerCase();
  const family = name.includes("edge") ? "edge" : "chrome";
  const legacyEdgeProfile = join(home, ".local/share/chatgpt_chat/edge-profile");
  const defaultProfile = family === "edge"
    ? legacyEdgeProfile
    : join(home, ".local/share/chatgpt_chat/chrome-profile");
  const profileDirectory = environment.CHATGPT_CHAT_BROWSER_PROFILE
    || (family === "edge" && pathExists(legacyEdgeProfile) ? legacyEdgeProfile : defaultProfile);
  return { executable: browserExecutable, family, profileDirectory };
}

function endpointFromFile(profileDirectory) {
  try {
    const [port] = readFileSync(join(profileDirectory, "DevToolsActivePort"), "utf8").trim().split(/\r?\n/);
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

export async function closeBrowserEndpoint(endpoint, {
  fetchImpl = fetch,
  WebSocketImpl = WebSocket,
  timeoutMilliseconds = 5_000,
} = {}) {
  const response = await fetchImpl(`${endpoint}/json/version`, {
    signal: AbortSignal.timeout(timeoutMilliseconds),
  });
  if (!response.ok) throw new Error("Dedicated browser endpoint is unavailable during shutdown");
  const { webSocketDebuggerUrl } = await response.json();
  if (!/^ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\//.test(webSocketDebuggerUrl ?? "")) {
    throw new Error("Dedicated browser returned an invalid shutdown endpoint");
  }
  await new Promise((resolve, reject) => {
    const socket = new WebSocketImpl(webSocketDebuggerUrl);
    const timer = setTimeout(() => reject(new Error("Dedicated browser shutdown timed out")), timeoutMilliseconds);
    const settle = (callback) => {
      clearTimeout(timer);
      if (socket.readyState === WebSocketImpl.OPEN) socket.close();
      callback();
    };
    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ id: 1, method: "Browser.close" }));
    });
    socket.addEventListener("message", (event) => {
      try {
        if (JSON.parse(String(event.data))?.id === 1) settle(resolve);
      } catch {}
    });
    socket.addEventListener("close", () => settle(resolve));
    socket.addEventListener("error", () => settle(() => reject(new Error("Dedicated browser shutdown failed"))));
  });
}

function availableDisplaySockets(displaySockets) {
  if (displaySockets) return displaySockets;
  try { return readdirSync("/tmp/.X11-unix"); } catch { return []; }
}

export function resolveDesktopEnvironment({
  environment = process.env,
  home = homedir(),
  uid = process.getuid(),
  displaySockets = null,
} = {}) {
  const sockets = availableDisplaySockets(displaySockets);
  const detectedDisplays = sockets
    .map((name) => name.match(/^X(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number)
    .sort((left, right) => right - left);
  return {
    DISPLAY: environment.DISPLAY || (detectedDisplays.length ? `:${detectedDisplays[0]}` : ":0"),
    XAUTHORITY: environment.XAUTHORITY || join(home, ".Xauthority"),
    XDG_RUNTIME_DIR: environment.XDG_RUNTIME_DIR || `/run/user/${uid}`,
    DBUS_SESSION_BUS_ADDRESS: environment.DBUS_SESSION_BUS_ADDRESS || `unix:path=/run/user/${uid}/bus`,
  };
}

export function resolveBrowserLaunch({
  environment = process.env,
  home = homedir(),
  uid = process.getuid(),
  displaySockets = null,
} = {}) {
  const sockets = availableDisplaySockets(displaySockets);
  const hasGraphicalSession = Boolean(environment.DISPLAY || environment.WAYLAND_DISPLAY || sockets.length);
  if (!hasGraphicalSession) {
    const headlessEnvironment = { ...environment };
    delete headlessEnvironment.DISPLAY;
    delete headlessEnvironment.WAYLAND_DISPLAY;
    return {
      headless: true,
      arguments: ["--headless=new", "--disable-gpu"],
      environment: headlessEnvironment,
    };
  }
  return {
    headless: false,
    arguments: ["--new-window"],
    environment: {
      ...environment,
      ...resolveDesktopEnvironment({ environment, home, uid, displaySockets: sockets }),
    },
  };
}

export async function startBrowser(startUrl = "https://chatgpt.com/", { interactive = false } = {}) {
  const home = homedir();
  const runtime = resolveBrowserRuntime({ home });
  const launch = resolveBrowserLaunch({ environment: process.env, home });
  if (interactive && launch.headless) {
    throw codedError("LOGIN_DISPLAY_REQUIRED", "Interactive ChatGPT login requires a graphical session");
  }
  const stateRoot = join(home, ".local/state/chatgpt_chat");
  mkdirSync(runtime.profileDirectory, { recursive: true, mode: 0o700 });
  mkdirSync(stateRoot, { recursive: true, mode: 0o700 });
  const existing = endpointFromFile(runtime.profileDirectory);
  if (await endpointIsLive(existing)) return { ...runtime, endpoint: existing, started: false };

  const child = spawn(runtime.executable, [
    `--user-data-dir=${runtime.profileDirectory}`,
    "--remote-debugging-port=0",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-session-crashed-bubble",
    ...launch.arguments,
    startUrl,
  ], {
    detached: true,
    env: launch.environment,
    stdio: "ignore",
  });
  child.unref();

  for (let attempt = 0; attempt < 120; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const endpoint = endpointFromFile(runtime.profileDirectory);
    if (endpoint && await endpointIsLive(endpoint)) return { ...runtime, endpoint, started: true };
  }
  throw codedError("BROWSER_START_FAILED", `Dedicated ${runtime.family} browser did not expose a CDP endpoint`);
}

function acquireLock(stateRoot, allowStaleRecovery = true) {
  const lockFile = join(stateRoot, "browser-driver.lock");
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
      return acquireLock(stateRoot, false);
    }
    throw codedError("BROWSER_BUSY", "Another ChatGPT browser operation is active");
  }
}

export async function withBrowserPage(operation) {
  const home = homedir();
  const release = acquireLock(join(home, ".local/state/chatgpt_chat"));
  let browser = null;
  let endpoint = null;
  try {
    ({ endpoint } = await startBrowser());
    const playwrightEntry = join(
      home,
      ".local/lib/node_modules/playwriter/node_modules/@xmorse/playwright-core/index.js",
    );
    if (!existsSync(playwrightEntry)) {
      throw codedError("RUNTIME_MISSING", "The managed Playwright runtime is not installed");
    }
    let playwright;
    try {
      playwright = await import(pathToFileURL(playwrightEntry).href);
    } catch (error) {
      if (error?.code === "ERR_MODULE_NOT_FOUND") {
        throw codedError("RUNTIME_MISSING", "The managed Playwright runtime is incomplete");
      }
      throw error;
    }
    browser = await playwright.default.chromium.connectOverCDP(endpoint);
    const context = browser.contexts()[0];
    if (!context) throw new Error("Dedicated browser exposed no browser context");
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
      try { await closeBrowserEndpoint(endpoint); } catch {}
      browser._connection.close();
    }
    release();
  }
}

export function authRequired() {
  return codedError("AUTH_REQUIRED", "Dedicated browser profile is not authenticated to ChatGPT");
}
