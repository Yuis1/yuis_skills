import assert from "node:assert/strict";
import test from "node:test";

import {
  closeBrowserEndpoint,
  resolveBrowserLaunch,
  resolveBrowserRuntime,
  resolveDesktopEnvironment,
} from "../lib/chromium-runtime.mjs";

const home = "/home/example";

test("prefers Edge and preserves its existing dedicated profile", () => {
  const runtime = resolveBrowserRuntime({
    environment: {},
    home,
    isExecutable: (path) => path === "/usr/bin/microsoft-edge",
    pathExists: (path) => path.endsWith("/edge-profile"),
  });
  assert.deepEqual(runtime, {
    executable: "/usr/bin/microsoft-edge",
    family: "edge",
    profileDirectory: "/home/example/.local/share/chatgpt_chat/edge-profile",
  });
});

test("uses Google Chrome with its own persistent profile when Edge is absent", () => {
  const runtime = resolveBrowserRuntime({
    environment: {},
    home,
    isExecutable: (path) => path === "/usr/bin/google-chrome-stable",
    pathExists: () => false,
  });
  assert.deepEqual(runtime, {
    executable: "/usr/bin/google-chrome-stable",
    family: "chrome",
    profileDirectory: "/home/example/.local/share/chatgpt_chat/chrome-profile",
  });
});

test("discovers the active X display instead of assuming display zero", () => {
  assert.deepEqual(resolveDesktopEnvironment({
    environment: {},
    home,
    uid: 1000,
    displaySockets: ["X1"],
  }), {
    DISPLAY: ":1",
    XAUTHORITY: "/home/example/.Xauthority",
    XDG_RUNTIME_DIR: "/run/user/1000",
    DBUS_SESSION_BUS_ADDRESS: "unix:path=/run/user/1000/bus",
  });
});

test("keeps an explicit desktop session environment", () => {
  assert.equal(resolveDesktopEnvironment({
    environment: { DISPLAY: ":7", XAUTHORITY: "/run/user/1000/custom-auth" },
    home,
    uid: 1000,
    displaySockets: ["X1"],
  }).DISPLAY, ":7");
});

test("uses a managed virtual display with the persistent profile when no display exists", () => {
  const launch = resolveBrowserLaunch({
    environment: { HOME: home },
    home,
    uid: 1000,
    displaySockets: [],
  });
  assert.equal(launch.virtualDisplay, true);
  assert.ok(!launch.arguments.includes("--headless=new"));
  assert.equal("DISPLAY" in launch.environment, false);
});

test("allows managed verification to force virtual-display mode despite an X socket", () => {
  const launch = resolveBrowserLaunch({
    environment: { HOME: home, CHATGPT_CHAT_VIRTUAL_DISPLAY: "1" },
    home,
    uid: 1000,
    displaySockets: ["X2"],
  });
  assert.equal(launch.virtualDisplay, true);
  assert.ok(!launch.arguments.includes("--headless=new"));
});

test("keeps visible browser operation when an X display is available", () => {
  const launch = resolveBrowserLaunch({
    environment: { HOME: home },
    home,
    uid: 1000,
    displaySockets: ["X2"],
  });
  assert.equal(launch.virtualDisplay, false);
  assert.ok(!launch.arguments.includes("--headless=new"));
  assert.equal(launch.environment.DISPLAY, ":2");
});

test("closes the dedicated browser through the browser CDP endpoint", async () => {
  const sent = [];
  class FakeWebSocket {
    static OPEN = 1;
    readyState = 0;
    listeners = new Map();
    constructor(url) {
      assert.equal(url, "ws://127.0.0.1:9222/devtools/browser/test");
      queueMicrotask(() => {
        this.readyState = FakeWebSocket.OPEN;
        this.emit("open", {});
      });
    }
    addEventListener(name, listener) {
      const listeners = this.listeners.get(name) ?? [];
      listeners.push(listener);
      this.listeners.set(name, listeners);
    }
    emit(name, event) {
      for (const listener of this.listeners.get(name) ?? []) listener(event);
    }
    send(body) {
      sent.push(JSON.parse(body));
      queueMicrotask(() => this.emit("message", { data: JSON.stringify({ id: 1, result: {} }) }));
    }
    close() { this.readyState = 3; }
  }
  await closeBrowserEndpoint("http://127.0.0.1:9222", {
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ webSocketDebuggerUrl: "ws://127.0.0.1:9222/devtools/browser/test" }),
    }),
    WebSocketImpl: FakeWebSocket,
  });
  assert.deepEqual(sent, [{ id: 1, method: "Browser.close" }]);
});

test("accepts explicit browser and profile overrides", () => {
  const runtime = resolveBrowserRuntime({
    environment: {
      CHATGPT_CHAT_BROWSER_EXECUTABLE: "/opt/google/chrome/google-chrome",
      CHATGPT_CHAT_BROWSER_PROFILE: "/srv/private/chatgpt-profile",
    },
    home,
    isExecutable: (path) => path === "/opt/google/chrome/google-chrome",
    pathExists: () => false,
  });
  assert.deepEqual(runtime, {
    executable: "/opt/google/chrome/google-chrome",
    family: "chrome",
    profileDirectory: "/srv/private/chatgpt-profile",
  });
});
