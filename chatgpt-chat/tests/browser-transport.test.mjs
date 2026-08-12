import assert from "node:assert/strict";
import test from "node:test";

import {
  chooseConnectedBrowser,
  closeBrowserTransport,
  openBrowserTransport,
  parseBrowserList,
} from "../lib/browser-transport.mjs";

const edge = {
  key: "install:Edge:abc",
  type: "extension",
  browser: "Edge",
  profile: "person@example.com",
};
const chrome = {
  key: "install:Chrome:def",
  type: "extension",
  browser: "Chrome",
  profile: "Default",
};

test("parses extension-connected Edge and Chrome profiles", () => {
  const browsers = parseBrowserList(`
KEY                         TYPE       BROWSER            PROFILE
------------------------------------------------------------------------
install:Edge:abc            extension  Edge               person@example.com
install:Chrome:def          extension  Chrome             Default
headless                    headless   Chrome (Headless)  -
`);
  assert.deepEqual(browsers, [edge, chrome]);
});

test("prefers the one connected Edge profile and otherwise uses the one Chrome profile", () => {
  assert.deepEqual(chooseConnectedBrowser([chrome]), chrome);
  assert.deepEqual(chooseConnectedBrowser([chrome, edge]), edge);
});

test("fails closed when the preferred browser family has multiple connected profiles", () => {
  assert.throws(() => chooseConnectedBrowser([edge, { ...edge, key: "install:Edge:other" }]), (error) => {
    assert.equal(error.code, "BROWSER_PROFILE_AMBIGUOUS");
    return true;
  });
  assert.throws(() => chooseConnectedBrowser([]), (error) => {
    assert.equal(error.code, "BROWSER_NOT_CONNECTED");
    return true;
  });
});

test("opens the shared workflow in a task-owned tab and deletes only its session", async () => {
  const calls = [];
  const client = {
    async createSession(input) { calls.push(["create", input]); return { id: "42" }; },
    async execute(id, code) {
      calls.push(["execute", id, code]);
      return { isError: false, text: '[log] CHATGPT_CHAT_RESULT:{"status":"ok"}' };
    },
    async deleteSession(id) { calls.push(["delete", id]); },
  };
  const transport = await openBrowserTransport({ command: "inspect" }, {
    cwd: "/repo",
    discover: async () => ({ browsers: [edge], client }),
  });
  assert.deepEqual(transport.result, { status: "ok" });
  assert.match(calls[1][2], /context\.newPage\(\)/);
  assert.match(calls[1][2], /globalThis\.import/);
  assert.match(calls[1][2], /ownedPage\.close\(\)/);
  assert.doesNotMatch(calls[1][2], /context\.pages\(\).*\.close/);
  await closeBrowserTransport(transport);
  assert.deepEqual(calls.at(-1), ["delete", "42"]);
});

test("resets and retries one extension execution failure without human participation", async () => {
  const calls = [];
  let attempts = 0;
  const client = {
    async createSession() { return { id: "42" }; },
    async execute() {
      attempts += 1;
      if (attempts === 1) throw new Error("Extension connection closed");
      return { isError: false, text: '[log] CHATGPT_CHAT_RESULT:{"status":"recovered"}' };
    },
    async resetSession(id) { calls.push(["reset", id]); },
    async waitForBrowser(key) { calls.push(["wait", key]); },
    async deleteSession() {},
  };
  const transport = await openBrowserTransport({ command: "inspect" }, {
    cwd: "/repo",
    discover: async () => ({ browsers: [edge], client }),
  });
  assert.deepEqual(transport.result, { status: "recovered" });
  assert.deepEqual(calls, [["wait", edge.key], ["reset", "42"]]);
  await closeBrowserTransport(transport);
});
