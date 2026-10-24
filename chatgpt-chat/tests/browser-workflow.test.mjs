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
    nth() { return this; },
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
      if (role === "button") return visibleLocator({ count: 0 });
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
  let sidebarOpen = false;
  const project = visibleLocator({ onClick: () => actions.push("project") });
  project.isVisible = async () => sidebarOpen;
  const page = {
    goto: async () => {},
    getByRole(role, options = {}) {
      if (role === "button" && options.name === "sample-project") return project;
      if (role === "link" && options.name === "sample-project") return visibleLocator({ count: 0 });
      if (role === "button" && options.name instanceof RegExp) return {
        ...visibleLocator(), focus: async () => {},
      };
      throw new Error(`unexpected ${role}`);
    },
    getByText: () => ({ first() { return this; }, waitFor: async () => assert.equal(sidebarOpen, true) }),
    waitForTimeout: async () => {},
    keyboard: { press: async key => { assert.equal(key, 'Enter'); sidebarOpen = true; actions.push('sidebar'); } },
    waitForURL: async () => {},
    url: () => "https://chatgpt.com/g/g-p-example/project",
    locator: () => visibleLocator({ count: 0 }),
  };

  const result = await findMappedProject(page, "sample-project", async () => {});

  assert.equal(result, "https://chatgpt.com/g/g-p-example/project");
  assert.deepEqual(actions, ["sidebar", "project"]);
});

test('current model picker verifies Pro power and the selected flagship', async () => {
  let power = 0;
  let focused = '';
  const levels = ['Instant', 'Medium', 'High', 'Extra High', 'Pro'];
  const trigger = {
    isVisible: async () => true,
    focus: async () => { focused = 'trigger'; },
    innerText: async () => levels[power],
  };
  const menu = {
    waitFor: async () => {},
    getByRole(role, options = {}) {
      if (role === 'status') return { innerText: async () => `${levels[power]}, ${power + 1} of 5.` };
      if (role === 'menuitem') return { focus: async () => { focused = options.name; } };
      if (role === 'menuitemradio') {
        const items = ['GPT-6', 'GPT-5.6 Sol'].map(label => ({
          innerText: async () => label,
          isVisible: async () => true,
          getAttribute: async name => name === 'aria-checked' ? String(label === 'GPT-6') : null,
        }));
        if (options.name) return items[options.name === 'GPT-6' ? 0 : 1];
        return { count: async () => 2, nth: i => items[i] };
      }
      throw new Error(`Unexpected role ${role}`);
    },
  };
  const page = {
    locator(selector) {
      if (selector === '[data-testid="modal-conversation-history-rate-limit"]') return visibleLocator({ count: 0 });
      throw new Error('Legacy-only picker cannot operate the current UI');
    },
    getByRole(role) { return role === 'button' ? trigger : menu; },
    keyboard: { press: async key => { if (key === 'ArrowRight' && focused === 'Power') power = Math.min(4, power + 1); } },
  };
  assert.deepEqual(await ensureBestInteraction(page), { mode: 'chat', effort: 'Pro', model: 'GPT-6' });
});

test('project prompt controls support current accessible names without matching another project', async () => {
  const { getPromptControls } = await import('../lib/browser-workflow.mjs');
  const loc = count => ({ count: async () => count, size: count, or(other) { return loc(count + other.size); } });
  let pendingHome = false;
  const page = {
    locator: selector => loc(pendingHome && selector.includes('#pending-home-input') ? 1 : 0),
    getByRole: (role, { name, exact }) => loc(exact && (
      role === 'textbox' && name === 'New chat in yuis_ops' || role === 'button' && name === 'Send'
    ) ? 1 : 0),
  };
  assert.equal(await getPromptControls(page, 'yuis_ops').textbox.count(), 1);
  assert.equal(await getPromptControls(page, 'yuis_ops').send.count(), 1);
  assert.equal(await getPromptControls(page, 'another-project').textbox.count(), 0);
  pendingHome = true;
  assert.equal(await getPromptControls(page, 'another-project').textbox.count(), 1);
});

test('collects the current completed assistant response without requiring legacy message attributes', async () => {
  const { waitForCompletedResponse } = await import('../lib/browser-workflow.mjs');
  const turn = {};
  const empty = { count: async () => 0, first() { return this; }, last() { return this; }, isVisible: async () => false };
  const content = { count: async () => 1, last() { return this; }, innerText: async () => 'CHATGPT_CHAT_REPAIR_OK_20261015', locator: () => turn };
  const page = {
    locator: selector => selector === '[data-markdown-text-style="assistant-message"]' ? content : empty,
    getByRole: role => role === 'status'
      ? { filter: () => ({ ...empty, isVisible: async () => true }) } : empty,
    waitForTimeout: async () => { throw new Error('Completed current response was missed'); },
  };
  const result = await waitForCompletedResponse(page);
  assert.equal(result.text, 'CHATGPT_CHAT_REPAIR_OK_20261015');
  assert.equal(result.turn, turn);
});


test('reads a completed conversation after reload when its live-region announcement is empty', async () => {
  const { waitForCompletedResponse } = await import('../lib/browser-workflow.mjs');
  const turn = {};
  const empty = { count: async () => 0, first() { return this; }, last() { return this; }, filter() { return this; }, isVisible: async () => false };
  const content = { count: async () => 1, last() { return this; }, innerText: async () => 'SAVED_REPLY', locator: () => turn };
  const page = {
    locator: selector => selector === '[data-markdown-text-style="assistant-message"]' ? content : empty,
    getByRole: (role, options) => role === 'button' && options?.name === 'Regenerate response'
      ? { ...empty, isVisible: async () => true } : empty,
    waitForTimeout: async ms => { if (ms !== 2000) throw new Error('Missed completed saved reply'); },
  };
  assert.equal((await waitForCompletedResponse(page)).text, 'SAVED_REPLY');
});
