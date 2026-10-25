import assert from "node:assert/strict";
import test from "node:test";
import { runWorkflow } from "../lib/browser-workflow.mjs";

// Browser-boundary fixture: stop after creation navigation, before sending a prompt.
function creationPage({ language = "en", ariaOnly = false, duplicate = false, textboxOnly = false, hoverOnly = false, createLabel } = {}) {
  let sidebarOpen = false;
  let focused = false;
  let headingHovered = false;
  let dialogOpen = false;
  let memory = false;
  let submitted = false;
  let name = "";
  const created = new Error("creation navigation observed");
  const labels = language === "en"
    ? { create: "Add new project", memory: "Default memory", only: "Project-only memory", submit: "Create project" }
    : { create: "添加新项目", memory: "默认记忆", only: "仅限项目", submit: "创建项目" };
  if (createLabel) labels.create = createLabel;
  const matches = (pattern, value) => pattern instanceof RegExp ? pattern.test(value) : pattern === value;
  function control(visible = false, extra = {}) {
    const result = {
      count: async () => Number(typeof visible === "function" ? visible() : visible),
      isVisible: async () => Boolean(await result.count()),
      first() { return this; }, nth() { return this; }, filter() { return this; },
      or(other) { return union(this, other); },
      waitFor: async () => { assert.ok(await result.isVisible(), "requested control is not visible"); },
      locator: () => control(),
      ...extra,
    };
    return result;
  }
  function union(left, right) {
    return {
      ...left,
      count: async () => await left.count() + await right.count(),
      isVisible: async () => await left.isVisible() || await right.isVisible(),
      first() { return this; }, filter() { return this; },
      or(other) { return union(this, other); },
      waitFor: async () => { assert.ok(await left.isVisible() || await right.isVisible()); },
      fill: async value => (await left.count() ? left : right).fill(value),
      focus: async () => (await left.count() ? left : right).focus(),
    };
  }
  const create = control(() => sidebarOpen && (!hoverOnly || headingHovered), {
    hover: async () => assert.ok(sidebarOpen),
    click: async options => {
      assert.ok(sidebarOpen, "sidebar must be expanded after navigation");
      assert.equal(options?.force, true, "hover-only create control needs force click");
      dialogOpen = true;
    },
  });
  const dialog = {
    locator: selector => control(dialogOpen && !textboxOnly && selector === 'input[type="text"]', {
      fill: async value => { name = value; },
    }),
    getByRole(role, options = {}) {
      if (role === "textbox") return control(dialogOpen && !options.name, { fill: async value => { name = value; } });
      if (role === "button" && matches(options.name, labels.memory)) return control(dialogOpen, { click: async () => {} });
      if (role === "button" && matches(options.name, labels.only)) return control(() => memory);
      if (role === "button" && matches(options.name, labels.submit)) return control(dialogOpen, {
        click: async () => { assert.equal(name, "DailySpan"); assert.ok(memory); submitted = true; },
      });
      throw new Error(`Unexpected dialog control: ${role} ${options.name}`);
    },
  };
  const page = {
    goto: async () => { sidebarOpen = false; headingHovered = false; },
    waitForTimeout: async () => {},
    keyboard: { press: async key => { assert.equal(key, "Enter"); assert.ok(focused); sidebarOpen = true; } },
    getByText: () => control(() => sidebarOpen, {
      hover: async () => { assert.ok(sidebarOpen); headingHovered = true; },
    }),
    locator(selector) {
      if (selector.includes("#prompt-textarea")) return control(true);
      if (selector.includes("accounts-profile-button") || selector.includes("Open profile menu")) return control(true);
      if (selector.includes('[aria-label*="project" i]')) {
        assert.ok(selector.includes(':not([aria-label*="options" i])'));
        assert.ok(selector.includes(':not([aria-label*="actions" i])'));
        return ariaOnly ? create : control();
      }
      return control();
    },
    getByRole(role, options = {}) {
      if (role === "dialog") return dialog;
      if (role === "menuitemradio" && matches(options.name, labels.only)) return control(dialogOpen, {
        click: async () => { memory = true; },
      });
      if (role === "button" && options.name instanceof RegExp && options.name.test("Show sidebar")) return control(() => !sidebarOpen, {
        focus: async () => { focused = true; },
      });
      if (role === "button" && !ariaOnly && matches(options.name, labels.create)) return create;
      if ((role === "button" || role === "link") && options.name === "DailySpan") return control(duplicate);
      return control();
    },
    waitForURL: async () => { assert.ok(submitted, "project must be submitted with project-only memory"); throw created; },
  };
  return { page, created, wasSubmitted: () => submitted };
}

for (const options of [{}, { language: "zh" }, { ariaOnly: true }, { textboxOnly: true }, { hoverOnly: true }, { createLabel: "New project" }]) {
  test(`creates project from collapsed sidebar with unlabeled name input (${JSON.stringify(options)})`, async () => {
    const { page, created, wasSubmitted } = creationPage(options);
    await assert.rejects(runWorkflow(page, { command: "ask", newConversation: true, projectName: "DailySpan" }), error => error === created);
    assert.ok(wasSubmitted());
  });
}

test("does not create a duplicate unmapped project", async () => {
  const { page, wasSubmitted } = creationPage({ duplicate: true });
  await assert.rejects(runWorkflow(page, { command: "ask", newConversation: true, projectName: "DailySpan" }), /unmapped same-name/);
  assert.equal(wasSubmitted(), false);
});
