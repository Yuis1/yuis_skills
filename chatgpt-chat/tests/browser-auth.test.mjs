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
