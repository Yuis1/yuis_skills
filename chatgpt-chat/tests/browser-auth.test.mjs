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
function authenticationPage({ modern = true, account = true, login = false } = {}) {
  function locator(count) {
    return {
      count: async () => count,
      nth() { return this; }, first() { return this; },
      isVisible: async () => count > 0,
      waitFor: async () => { if (!count) throw new Error('not visible'); },
      or(other) { return locator(count + other.size); },
      size: count,
    };
  }
  return {
    goto: async () => {}, waitForTimeout: async () => {},
    locator(selector) {
      return locator(selector.includes('#prompt-textarea') && !modern ? 1 : 0);
    },
    getByRole(role, { name }) {
      const matches = text => typeof name === 'string' ? name === text : name.test(text);
      return locator(role === 'textbox' && modern && matches('Ask ChatGPT') ? 1
        : role === 'button' && account && matches('Open profile menu') ? 1
        : role === 'button' && login && matches('Log in') ? 1 : 0);
    },
  };
}

test('authenticates the current home textbox and legacy conversation composer', async () => {
  const { requireAuthentication } = await import('../lib/browser-workflow.mjs');
  await requireAuthentication(authenticationPage());
  await requireAuthentication(authenticationPage({ modern: false }));
});

test('a current home textbox alone does not prove authentication', async () => {
  const { requireAuthentication } = await import('../lib/browser-workflow.mjs');
  await assert.rejects(requireAuthentication(authenticationPage({ account: false })), { code: 'AUTH_UNVERIFIED' });
  await assert.rejects(requireAuthentication(authenticationPage({ login: true })), { code: 'AUTH_REQUIRED' });
});
