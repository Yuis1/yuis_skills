import assert from "node:assert/strict";
import test from "node:test";

import {
  ensureBestInteraction,
  findMappedProject,
} from "../lib/browser-workflow.mjs";

function visibleLocator({ count = 1, text = "", checked = "false", onClick = null } = {}) {
  return {
    count: async () => count,
    first() { return this; },
    last() { return this; },
    filter() { return this; },
    getByRole() { return this; },
    waitFor: async () => {},
    isVisible: async () => count > 0,
    click: async () => onClick?.(),
    innerText: async () => text,
    getAttribute: async (name) => name === "aria-checked" ? checked : null,
    or(other) { return count > 0 ? this : other; },
  };
}

test("selects the new Advanced model and effort submenus", async () => {
  const actions = [];
  const choices = [
    visibleLocator({ text: "GPT-5.5" }),
    visibleLocator({ text: "GPT-5.6 Sol" }),
    visibleLocator({ text: "o3" }),
  ];
  const modelChoices = {
    count: async () => choices.length,
    nth: (index) => choices[index],
  };
  const modelMenu = {
    getByRole(role, options = {}) {
      if (role !== "menuitemradio") throw new Error(`unexpected role ${role}`);
      if (!options.name) return modelChoices;
      return visibleLocator({ checked: "false", onClick: () => actions.push(`model:${options.name}`) });
    },
  };
  const effortMenu = {
    getByRole(role, options = {}) {
      assert.equal(role, "menuitemradio");
      return visibleLocator({ checked: "false", onClick: () => actions.push(`effort:${options.name}`) });
    },
  };
  const rootMenu = {
    getByRole(role, options) {
      assert.equal(role, "menuitem");
      return visibleLocator({ onClick: () => actions.push(options.name.source.includes("Model") ? "open-model" : "open-effort") });
    },
  };
  let lastMenu = modelMenu;
  const trigger = visibleLocator({ onClick: () => actions.push("open-picker") });
  const page = {
    locator(selector) {
      if (selector === "main form") return { getByRole: () => trigger };
      if (selector === '[data-testid="composer-intelligence-picker-content"]') return visibleLocator();
      if (selector === '[data-testid="modal-conversation-history-rate-limit"]') return visibleLocator({ count: 0 });
      throw new Error(`unexpected selector ${selector}`);
    },
    getByRole(role, options) {
      if (role === "menuitem" && options?.name === "Show advanced options") return visibleLocator({ onClick: () => actions.push("advanced") });
      if (role !== "menu") throw new Error(`unexpected role ${role}`);
      if (options?.name) {
        if (String(options.name).includes("Model")) return modelMenu;
        if (String(options.name).includes("Effort")) return effortMenu;
      }
      return { first: () => rootMenu, last: () => lastMenu };
    },
  };
  rootMenu.getByRole = (role, options) => visibleLocator({ onClick: () => {
    if (options.name.source.includes("Model")) {
      actions.push("open-model");
      lastMenu = modelMenu;
    } else {
      actions.push("open-effort");
      lastMenu = effortMenu;
    }
  } });

  const result = await ensureBestInteraction(page);

  assert.deepEqual(result, { mode: "chat", effort: "Pro", model: "GPT-5.6 Sol" });
  assert.deepEqual(actions, [
    "open-picker", "advanced", "open-model", "model:GPT-5.6 Sol",
    "open-picker", "advanced", "open-effort", "effort:Pro",
  ]);
});

test("opens a project by clicking its exact-name project button", async () => {
  const actions = [];
  const project = visibleLocator({ onClick: () => actions.push("project") });
  const page = {
    goto: async () => {},
    getByRole(role, options = {}) {
      if (role === "button" && options.name === "sample-project") return project;
      if (role === "link" && options.name === "sample-project") return visibleLocator({ count: 0 });
      if (role === "button" && options.name instanceof RegExp) return visibleLocator({ count: 0 });
      throw new Error(`unexpected ${role}`);
    },
    getByText: () => visibleLocator(),
    waitForURL: async () => {},
    url: () => "https://chatgpt.com/g/g-p-example/project",
    locator: () => visibleLocator(),
  };

  const result = await findMappedProject(page, "sample-project", async () => {});

  assert.equal(result, "https://chatgpt.com/g/g-p-example/project");
  assert.deepEqual(actions, ["project"]);
});
