import fs from "node:fs";
import path from "node:path";

export async function runWorkflow(page, input) {
function modelRank(label) {
  const match = label.match(/^GPT-(\d+)(?:\.(\d+))?(?:\s+(.*))?$/i);
  if (!match) return [-1, -1, -1];
  return [Number(match[1]), Number(match[2] || 0), /\bsol\b/i.test(match[3] || "") ? 1 : 0];
}

function compareModels(left, right) {
  const a = modelRank(left);
  const b = modelRank(right);
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return b[index] - a[index];
  }
  return left.localeCompare(right);
}

async function waitForProject(projectUrl, projectName) {
  const title = page.locator("main")
    .getByRole("button", { name: `Edit the title of ${projectName}`, exact: true });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (page.url() !== projectUrl) {
      await page.goto(projectUrl, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    }
    if (await title.waitFor({ state: "visible", timeout: 60_000 }).then(() => true).catch(() => false)) return;
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
  }
  const currentTitle = await page.title().catch(() => "unavailable");
  throw new Error(`Mapped ChatGPT Project is not visible at ${page.url()} (${currentTitle})`);
}

async function verifyProjectOnlyMemory() {
  await page.getByRole("button", { name: "Show project details", exact: true }).click();
  await page.getByRole("menuitem", { name: "Project settings", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 10_000 });
  const text = await dialog.innerText();
  const verified = /\bMemory\b/.test(text)
    && /\bProject-only\b/.test(text)
    && /Work mode isn[’']t available/.test(text);
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
  if (!verified) throw new Error("Project-only memory is not visibly verified");
}

async function createProject(projectName) {
  await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded", timeout: 30_000 });
  const create = page.getByRole("button", { name: "New project", exact: true });
  await create.waitFor({ state: "visible", timeout: 30_000 });
  if (await page.getByRole("button", { name: projectName, exact: true }).count()) {
    throw new Error("An unmapped same-name ChatGPT Project already exists");
  }
  await create.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Project name" }).fill(projectName);
  await dialog.getByRole("button", { name: "Default memory", exact: true }).click();
  await page.getByRole("menuitemradio", { name: /Project-only memory/ }).click();
  await dialog.getByRole("button", { name: "Project-only memory", exact: true })
    .waitFor({ state: "visible", timeout: 10_000 });
  await dialog.getByRole("button", { name: "Create project", exact: true }).click();
  await page.waitForURL(/\/g\/[^/]+\/project$/, { timeout: 30_000 });
  return page.url();
}

async function ensureBestInteraction() {
  const form = page.locator("main form");
  const trigger = form.getByRole("button", { name: /^(Instant|Medium|High|Extra High|Pro)$/ }).first();
  await trigger.waitFor({ state: "visible", timeout: 30_000 });
  await trigger.click();
  let picker = page.locator('[data-testid="composer-intelligence-picker-content"]');
  await picker.waitFor({ state: "visible", timeout: 10_000 });
  const pro = picker.getByRole("menuitemradio", { name: "Pro", exact: true });
  if (await pro.count() !== 1) throw new Error("Pro effort is unavailable");
  if ((await pro.getAttribute("aria-checked")) !== "true") {
    await pro.click();
    await trigger.click();
    picker = page.locator('[data-testid="composer-intelligence-picker-content"]');
    await picker.waitFor({ state: "visible", timeout: 10_000 });
  }
  const modelSubmenu = picker.getByRole("menuitem").filter({ hasText: /^GPT-/ }).first();
  await modelSubmenu.click();
  const modelMenu = page.locator('[role="menu"]').last();
  const choices = modelMenu.getByRole("menuitemradio");
  const labels = [];
  for (let index = 0; index < await choices.count(); index += 1) {
    const label = (await choices.nth(index).innerText()).trim();
    if (modelRank(label)[0] >= 0) labels.push(label);
  }
  if (!labels.length) throw new Error("No flagship GPT model is available");
  labels.sort(compareModels);
  const preferred = labels[0];
  const choice = modelMenu.getByRole("menuitemradio", { name: preferred, exact: true });
  if ((await choice.getAttribute("aria-checked")) !== "true") await choice.click();
  else {
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
  }
  return { mode: "chat", effort: "Pro", model: preferred };
}

async function waitForCompletedResponse() {
  const pollMilliseconds = Number(process.env.CHATGPT_CHAT_POLL_MILLISECONDS || 600_000);
  if (!Number.isFinite(pollMilliseconds) || pollMilliseconds < 1_000) throw new Error("Invalid polling interval");
  const messages = page.locator('[data-message-author-role="assistant"]');
  for (;;) {
    const stop = page.locator('[data-testid="stop-button"]');
    if (await stop.count() && await stop.first().isVisible()) {
      await page.waitForTimeout(pollMilliseconds);
      continue;
    }
    if (!(await messages.count())) {
      await page.waitForTimeout(Math.min(pollMilliseconds, 10_000));
      continue;
    }
    const content = messages.last();
    const first = (await content.innerText()).trim();
    if (!first) {
      await page.waitForTimeout(Math.min(pollMilliseconds, 10_000));
      continue;
    }
    await page.waitForTimeout(2_000);
    const second = (await content.innerText()).trim();
    if (first === second && !(await stop.count() && await stop.first().isVisible())) {
      return { turn: content.locator("xpath=.."), text: second };
    }
  }
}

function writeUniqueAttachment(directory, filename, body) {
  const extension = path.extname(filename);
  const stem = path.basename(filename, extension);
  for (let index = 0; index < 100; index += 1) {
    const candidate = path.join(directory, index === 0 ? filename : `${stem}-${index}${extension}`);
    try {
      fs.writeFileSync(candidate, body, { mode: 0o600, flag: "wx" });
      return candidate;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
    }
  }
  throw new Error("No unique attachment path is available");
}

function dispositionFilename(value) {
  const encoded = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded) return decodeURIComponent(encoded[1]);
  return value.match(/filename="?([^";]+)"?/i)?.[1] || null;
}

async function collectAttachments(turn) {
  const toolbar = page.locator('[data-playwriter-toolbar="1"]');
  if (await toolbar.count()) await toolbar.evaluate((element) => { element.style.pointerEvents = "none"; });
  const results = [];
  const cards = turn.getByRole("button", { name: "Download file" });
  const count = Math.min(await cards.count(), 10);
  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index).locator("xpath=../../..");
    const labels = await card.locator("button[aria-label]").evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label")).filter(Boolean),
    );
    const filename = labels.find((label) => label !== "Download file");
    if (!filename || filename !== path.basename(filename) || filename.includes("..")) {
      throw new Error("Assistant attachment has an unsafe filename");
    }
    const responsePromise = page.waitForResponse((response) => {
      const disposition = response.headers()["content-disposition"] || "";
      return response.status() === 200 && dispositionFilename(disposition) === filename;
    }, { timeout: 30_000 });
    const buttons = card.getByRole("button", { name: filename, exact: true });
    await buttons.last().focus();
    await page.keyboard.press("Enter");
    const response = await responsePromise;
    const body = await response.body();
    const destination = writeUniqueAttachment(input.artifactDirectory, filename, body);
    results.push({ name: filename, path: destination, bytes: body.length });
    await page.keyboard.press("Escape");
    await page.getByRole("dialog", { name: filename }).waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
  }
  return results;
}

async function titleForConversation(url) {
  const locator = page.locator(`a[href="${new URL(url).pathname}"]`).first();
  try {
    await locator.waitFor({ state: "visible", timeout: 10_000 });
    return (await locator.innerText()).trim();
  } catch {
    return input.prompt.trim().slice(0, 80);
  }
}

async function run() {
  let projectUrl = input.projectUrl;
  let createdProjectUrl = null;
  if (!projectUrl) {
    if (input.command !== "ask" || !input.newConversation) throw new Error("Project is not mapped");
    projectUrl = await createProject(input.projectName);
    createdProjectUrl = projectUrl;
  } else {
    await waitForProject(projectUrl, input.projectName);
  }
  await verifyProjectOnlyMemory();
  const interaction = await ensureBestInteraction();
  if (input.command === "inspect") {
    return { projectUrl, createdProjectUrl, interaction };
  }

  if (input.newConversation) {
    await page.goto(projectUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  } else {
    const projectId = new URL(projectUrl).pathname.match(/^\/g\/(g-p-[^/]+)\/project$/)?.[1];
    const conversationPath = new URL(input.conversationUrl).pathname;
    if (!projectId || !conversationPath.startsWith(`/g/${projectId}-`) || !conversationPath.includes("/c/")) {
      throw new Error("Conversation does not belong to the mapped ChatGPT Project");
    }
    await page.goto(input.conversationUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  }
  const textbox = page.locator("#prompt-textarea");
  await textbox.waitFor({ state: "visible", timeout: 30_000 });
  await textbox.fill(input.prompt);
  await page.locator('[data-testid="send-button"]').click();
  await page.waitForURL(/\/c\//, { timeout: 30_000 });
  const conversationUrl = page.url();
  const { turn, text } = await waitForCompletedResponse();
  const responsePath = path.join(input.artifactDirectory, `${new Date().toISOString().replace(/[:.]/g, "-")}-response.txt`);
  fs.writeFileSync(responsePath, `${text}\n`, { mode: 0o600, flag: "wx" });
  await page.waitForTimeout(5_000);
  const attachments = await collectAttachments(turn);
  return {
    projectUrl,
    createdProjectUrl,
    interaction,
    conversationUrl,
    conversationTitle: await titleForConversation(conversationUrl),
    responsePath,
    responseBytes: Buffer.byteLength(text),
    responsePreview: text.slice(0, 500),
    attachments,
  };
}

  return run();
}
