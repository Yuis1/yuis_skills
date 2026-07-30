import assert from "node:assert/strict";
import test from "node:test";

import { resolveBrowserRuntime } from "../lib/chromium-runtime.mjs";

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
