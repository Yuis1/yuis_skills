import assert from "node:assert/strict";
import test from "node:test";

import { classifyAuthenticationEvidence } from "../lib/browser-cdp-adapter.mjs";

test("recognizes the authenticated UI observed on a first-use host", () => {
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 0,
    composer: 1,
    projectsHeading: 1,
    profileControl: 2,
    challengeFrame: 0,
  }), "authenticated");
});

test("recognizes the previously verified named project control", () => {
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 0,
    composer: 1,
    newProjectControl: 1,
    projectsHeading: 0,
    profileControl: 0,
    challengeFrame: 0,
  }), "authenticated");
});

test("visible login controls require dedicated-profile authentication", () => {
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 1,
    composer: 1,
    projectsHeading: 0,
    profileControl: 0,
    challengeFrame: 0,
  }), "required");
});

test("ambiguous or challenged pages fail closed", () => {
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 0,
    composer: 1,
    projectsHeading: 0,
    profileControl: 0,
    challengeFrame: 0,
  }), "unverified");
  assert.equal(classifyAuthenticationEvidence({
    loginControl: 0,
    composer: 1,
    projectsHeading: 1,
    profileControl: 1,
    challengeFrame: 1,
  }), "challenge");
});
