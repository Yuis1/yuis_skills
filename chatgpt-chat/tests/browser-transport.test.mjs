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

test("treats a Playwriter isError page closure as recoverable for inspect", async () => {
  const calls = [];
  let attempts = 0;
  const client = {
    async createSession() { return { id: "42" }; },
    async execute() {
      attempts += 1;
      if (attempts === 1) {
        return { isError: true, text: "page.waitForTimeout: Target page, context or browser has been closed" };
      }
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
  assert.equal(attempts, 2);
  assert.deepEqual(calls, [["wait", edge.key], ["reset", "42"]]);
  await closeBrowserTransport(transport);
});

test("retries ask once when failure is explicitly before submit", async () => {
  let attempts = 0;
  const client = {
    async createSession() { return { id: "42" }; },
    async execute() {
      attempts += 1;
      if (attempts === 1) {
        return {
          isError: true,
          text: 'CHATGPT_CHAT_ERROR:{"phase":"pre_submit","message":"Extension connection closed"}',
        };
      }
      return { isError: false, text: '[log] CHATGPT_CHAT_RESULT:{"status":"recovered"}' };
    },
    async resetSession() {},
    async waitForBrowser() {},
    async deleteSession() {},
  };
  const transport = await openBrowserTransport({ command: "ask" }, {
    discover: async () => ({ browsers: [edge], client }),
  });
  assert.equal(attempts, 2);
  assert.deepEqual(transport.result, { status: "recovered" });
  await closeBrowserTransport(transport);
});

test("resumes response observation without resending after confirmed ask submission", async () => {
  const programs = [];
  const client = {
    async createSession() { return { id: "42" }; },
    async execute(id, code) {
      programs.push(code);
      if (programs.length === 1) {
        return {
          isError: true,
          text: 'CHATGPT_CHAT_ERROR:{"phase":"submitted_confirmed","conversationUrl":"https://chatgpt.com/g/g-p-example/c/turn","message":"Extension connection closed"}',
        };
      }
      return { isError: false, text: '[log] CHATGPT_CHAT_RESULT:{"status":"recovered"}' };
    },
    async resetSession() {},
    async waitForBrowser() {},
    async deleteSession() {},
  };
  const transport = await openBrowserTransport({ command: "ask", prompt: "do not resend" }, {
    discover: async () => ({ browsers: [edge], client }),
  });
  assert.equal(programs.length, 2);
  assert.doesNotMatch(programs[0], /resumeConversationUrl/);
  assert.match(programs[1], /resumeConversationUrl/);
  assert.match(programs[1], /https:\/\/chatgpt\.com\/g\/g-p-example\/c\/turn/);
  await closeBrowserTransport(transport);
});

test("reports the selected browser as unavailable when it does not reconnect", async () => {
  const client = {
    async createSession() { return { id: "42" }; },
    async execute() { throw new Error("Extension connection closed"); },
    async waitForBrowser() { throw Object.assign(new Error("gone"), { code: "BROWSER_NOT_CONNECTED" }); },
    async resetSession() { throw new Error("must not reset"); },
    async deleteSession() {},
  };
  await assert.rejects(
    openBrowserTransport({ command: "inspect" }, {
      discover: async () => ({ browsers: [edge], client }),
    }),
    (error) => {
      assert.equal(error.code, "BROWSER_NOT_CONNECTED");
      assert.equal(error.diagnostics.recovery_attempted, true);
      return true;
    },
  );
});

test("returns a relay code when session reset itself fails", async () => {
  const client = {
    async createSession() { return { id: "42" }; },
    async execute() { throw new Error("Extension connection closed"); },
    async waitForBrowser() {},
    async resetSession() { throw new Error("reset failed"); },
    async deleteSession() {},
  };
  await assert.rejects(
    openBrowserTransport({ command: "inspect" }, {
      discover: async () => ({ browsers: [edge], client }),
    }),
    (error) => {
      assert.equal(error.code, "RELAY_DISCONNECTED");
      assert.match(error.diagnostics.diagnostic_id, /^[0-9a-f-]{36}$/);
      return true;
    },
  );
});

test("never retries ask when submission state is unknown", async () => {
  let attempts = 0;
  const client = {
    async createSession() { return { id: "42" }; },
    async execute() {
      attempts += 1;
      return { isError: true, text: "Target page, context or browser has been closed" };
    },
    async resetSession() { throw new Error("must not reset"); },
    async waitForBrowser() { throw new Error("must not wait"); },
    async deleteSession() {},
  };

  await assert.rejects(
    openBrowserTransport({ command: "ask" }, {
      cwd: "/repo",
      discover: async () => ({ browsers: [edge], client }),
    }),
    (error) => {
      assert.equal(error.code, "ASK_SUBMISSION_UNKNOWN");
      return true;
    },
  );
  assert.equal(attempts, 1);
});

test("does not close a browser context or pre-existing tab", async () => {
  const calls = [];
  const client = {
    async createSession() { return { id: "42" }; },
    async execute(id, code) {
      calls.push(code);
      return { isError: false, text: '[log] CHATGPT_CHAT_RESULT:{"status":"ok"}' };
    },
    async deleteSession() {},
  };
  const transport = await openBrowserTransport({ command: "inspect" }, {
    discover: async () => ({ browsers: [edge], client }),
  });
  const program = calls[0];
  assert.match(program, /const ownedPage = await context\.newPage\(\)/);
  assert.match(program, /if \(!ownedPage\.isClosed\(\)\) await ownedPage\.close/);
  assert.doesNotMatch(program, /context\.close\(|browser\.close\(|context\.pages\(\)/);
  await closeBrowserTransport(transport);
});
