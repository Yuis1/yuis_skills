import assert from "node:assert/strict";
import test from "node:test";

import { classifyAuthenticationEvidence } from "../lib/browser-workflow.mjs";

test("recognizes the authenticated ChatGPT UI in the connected browser", () => {
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 0,
    composer: 1,
    accountControl: 2,
    challengeFrame: 0,
  }), "authenticated");
});

test("visible login controls require connected-profile authentication", () => {
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 1,
    composer: 1,
    accountControl: 0,
    challengeFrame: 0,
  }), "required");
});

test("ambiguous or challenged pages fail closed", () => {
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 0,
    composer: 1,
    accountControl: 0,
    challengeFrame: 0,
  }), "unverified");
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 0,
    composer: 1,
    accountControl: 1,
    challengeFrame: 1,
  }), "challenge");
});

// Browser-boundary fixture: the October home UI exposes a named textbox,
// while existing conversation pages still expose #prompt-textarea.
function authenticationPage({ modern = true, account = true, login = false, collapsed = false, suggestion = false, pending = false } = {}) {
  let sidebarOpen = !collapsed;
  let focused = false;
  function locator(count, hiddenFirst = false) {
    return {
      count: async () => count,
      filter: () => locator(hiddenFirst ? count - 1 : count),
      nth(index) { return hiddenFirst ? locator(index === 0 ? 0 : 1) : this; },
      first() { return this.nth(0); },
      isVisible: async () => count > 0,
      waitFor: async () => { if (!count) throw new Error('not visible'); },
      click: async () => { throw new Error('Pointer actions stall in a background tab'); },
      focus: async () => { focused = true; },
      or(other) { return locator(count + other.size, hiddenFirst); },
      size: count,
    };
  }
  return {
    goto: async () => {}, waitForTimeout: async () => {},
    keyboard: { press: async key => { if (focused && key === 'Enter') sidebarOpen = true; } },
    locator(selector) {
      return locator(selector.includes('#pending-home-input') && pending ? 1
        : selector.includes('#prompt-textarea') && !modern ? 1
        : selector.includes('Open profile menu') && account && sidebarOpen ? 1 : 0);
    },
    getByRole(role, { name }) {
      const matches = text => typeof name === 'string' ? name === text : name.test(text);
      if (role === 'button' && !sidebarOpen && matches('Show sidebar')) return locator(2, true);
      return locator(role === 'textbox' && modern && !pending && matches('Ask ChatGPT') ? 1
        : role === 'button' && account && sidebarOpen && matches('Open profile menu') ? 1
        : role === 'button' && !sidebarOpen && matches('Show sidebar') ? 1
        : role === 'button' && login && matches('Log in') ? 1
        : role === 'link' && suggestion && matches('帮我解决登录问题') ? 1 : 0);
    },
  };
}

test('authenticates the current home textbox and legacy conversation composer', async () => {
  const { requireAuthentication } = await import('../lib/browser-workflow.mjs');
  await requireAuthentication(authenticationPage());
  await requireAuthentication(authenticationPage({ modern: false }));
  await requireAuthentication(authenticationPage({ collapsed: true, pending: true, suggestion: true }));
});

test('a current home textbox alone does not prove authentication', async () => {
  const { requireAuthentication } = await import('../lib/browser-workflow.mjs');
  await assert.rejects(requireAuthentication(authenticationPage({ account: false })), { code: 'AUTH_UNVERIFIED' });
  await assert.rejects(requireAuthentication(authenticationPage({ login: true })), { code: 'AUTH_REQUIRED' });
});
