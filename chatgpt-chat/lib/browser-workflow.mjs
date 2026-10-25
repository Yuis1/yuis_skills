import fs from "node:fs";
import path from "node:path";

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

export function classifyAuthenticationEvidence({ loginControl, composer, accountControl, challengeFrame }) {
  if (challengeFrame > 0) return "challenge";
  if (loginControl > 0) return "required";
  if (composer > 0 && accountControl > 0) return "authenticated";
  return "unverified";
}

async function visibleCount(locator) {
  let visible = 0;
  const count = Math.min(await locator.count(), 10);
  for (let index = 0; index < count; index += 1) {
    if (await locator.nth(index).isVisible().catch(() => false)) visible += 1;
  }
  return visible;
}

async function ensureSidebar(page) {
  const showSidebar = page.getByRole("button", { name: /^(show sidebar|open sidebar|打开侧边栏|显示侧边栏)$/i })
    .or(page.locator('[aria-label*="sidebar" i][aria-expanded="false"]:not([aria-label*="options" i])'))
    .filter({ visible: true });
  // Wait for the home UI to hydrate, but never toggle an already-open sidebar.
  await showSidebar.first().waitFor({ state: "visible", timeout: 3_000 }).catch(() => {});
  for (let index = 0; index < await showSidebar.count(); index += 1) {
    const button = showSidebar.nth(index);
    if (!await button.isVisible().catch(() => false)) continue;
    // Background tabs can stall pointer stability checks. Activate the visible
    // button with its native keyboard interaction, as with the model picker.
    await button.focus({ timeout: 5_000 });
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1_000);
    return;
  }
}

export async function requireAuthentication(page) {
  await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
  const composer = page.locator("#prompt-textarea, #pending-home-input, textarea[placeholder*='ChatGPT'], [contenteditable='true']")
    .or(page.getByRole("textbox", { name: "Ask ChatGPT", exact: true }));
  await composer.or(page.locator('a[href^="/auth/login"]')).first()
    .waitFor({ state: "visible", timeout: 15_000 })
    .catch(() => {});
  await page.waitForTimeout(1_000);

  await ensureSidebar(page);

  const accountLocator = page.locator('[data-testid="accounts-profile-button"]')
    .or(page.locator('[aria-label="Open profile menu"]'))
    .or(page.getByRole("button", { name: /open profile menu|profile|个人资料|账户|account/i }));

  // Home navigation and sidebar expansion can remount the composer/account
  // controls. Wait for settled visible evidence, not just the initial shell.
  let status;
  for (let attempt = 0; attempt < 11; attempt += 1) {
    const evidence = {
      challengeFrame: await page.locator('iframe[src*="challenge"], iframe[src*="cloudflare"]').count(),
      loginControl: await visibleCount(page.getByRole("link", { name: /^(log in|登录)$/i }))
        + await visibleCount(page.getByRole("button", { name: /^(log in|登录)$/i }))
        + await visibleCount(page.locator('a[href^="/auth/login"], a[href*="auth0.openai.com"]')),
      composer: await visibleCount(composer),
      accountControl: await visibleCount(accountLocator),
    };
    status = classifyAuthenticationEvidence(evidence);
    if (status !== "unverified" || attempt === 10) break;
    await page.waitForTimeout(500);
  }
  if (status === "authenticated") return;
  if (status === "challenge") throw Object.assign(new Error("ChatGPT requires an interactive challenge"), { code: "CHALLENGE_REQUIRED" });
  if (status === "required") throw Object.assign(new Error("The connected browser Profile is not authenticated to ChatGPT"), { code: "AUTH_REQUIRED" });
  throw Object.assign(new Error("ChatGPT authentication state could not be verified from visible controls"), { code: "AUTH_UNVERIFIED" });
}

export async function findMappedProject(page, projectName, confirmProject) {
  await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await ensureSidebar(page);
  await page.getByText(/^(projects|项目)$/i, { exact: true }).first()
    .waitFor({ state: "visible", timeout: 60_000 });
  const projectControl = () => page.getByRole("link", { name: projectName, exact: true })
    .or(page.getByRole("button", { name: projectName, exact: true }))
    .first();
  let project = projectControl();
  let expanded = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await project.isVisible().catch(() => false)) break;
    const showMore = page.getByRole("button", { name: /^(show more|显示更多|查看更多)$/i }).first();
    if (!expanded && await showMore.isVisible().catch(() => false)) {
      await showMore.click();
      expanded = true;
      project = projectControl();
    }
    await page.waitForTimeout(500);
  }
  if (!await project.isVisible().catch(() => false)) return null;
  await project.click();
  await page.waitForURL(/\/g\/g-p-[^/]+(?:-[^/]+)?\/project(?:\?.*)?$/, { timeout: 30_000 });
  const projectUrl = new URL(page.url());
  projectUrl.search = "";
  await confirmProject(projectUrl.href, projectName);
  return projectUrl.href;
}

async function dismissTransientOverlays(page) {
  const rateLimit = page.locator('[data-testid="modal-conversation-history-rate-limit"]');
  if (!await rateLimit.isVisible().catch(() => false)) return;
  const dismiss = rateLimit.getByRole("button", { name: /^(OK|Close|Dismiss|Got it|确定|关闭|知道了)$/i }).first();
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
  else await page.keyboard.press("Escape");
  await rateLimit.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
}

export async function ensureBestInteraction(page) {
  await dismissTransientOverlays(page);
  const currentTrigger = page.getByRole("button", { name: "Select ChatGPT model", exact: true });
  if (await currentTrigger.isVisible().catch(() => false)) {
    // Use the UI's documented keyboard control; background tabs may throttle
    // animation frames needed by pointer stability checks.
    await currentTrigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu", { name: "Select ChatGPT model", exact: true });
    await menu.waitFor({ state: "visible", timeout: 10_000 });
    const power = menu.getByRole("menuitem", { name: "Power", exact: true });
    await power.focus();
    let pro = false;
    for (let step = 0; step < 6; step += 1) {
      const status = (await menu.getByRole("status").innerText()).trim();
      if (/^Pro,\s*\d+ of \d+\.$/.test(status)) { pro = true; break; }
      await page.keyboard.press("ArrowRight");
    }
    if (!pro) throw new Error("Pro effort is unavailable");
    await menu.getByRole("menuitem", { name: "Select model", exact: true }).focus();
    await page.keyboard.press("Enter");
    const choices = menu.getByRole("menuitemradio");
    const labels = [];
    for (let index = 0; index < await choices.count(); index += 1) {
      const choice = choices.nth(index);
      if (!await choice.isVisible()) continue;
      const label = (await choice.innerText()).trim();
      if (modelRank(label)[0] >= 0) labels.push(label);
    }
    labels.sort(compareModels);
    if (!labels.length) throw new Error("No flagship GPT model is available");
    const preferred = labels[0];
    const choice = menu.getByRole("menuitemradio", { name: preferred, exact: true });
    if (await choice.getAttribute("aria-checked") !== "true") {
      await choice.focus();
      await page.keyboard.press("Enter");
      if (await choice.getAttribute("aria-checked") !== "true") {
        throw new Error("Flagship model selection is not verified");
      }
    }
    await page.keyboard.press("Escape");
    if (!/\bPro\b/.test(await currentTrigger.innerText())) throw new Error("Pro effort is not verified");
    return { mode: "chat", effort: "Pro", model: preferred };
  }
  const form = page.locator("main form");
  const trigger = form.getByRole("button", { name: /^(Instant|Medium|High|Extra High|Pro)$/ }).first();
  const openAdvancedPicker = async () => {
    await trigger.waitFor({ state: "visible", timeout: 30_000 });
    await trigger.click();
    const picker = page.locator('[data-testid="composer-intelligence-picker-content"]');
    await picker.waitFor({ state: "visible", timeout: 10_000 });
    const advanced = page.getByRole("menuitem", { name: "Show advanced options", exact: true });
    if (await advanced.count()) await advanced.click();
    return page.getByRole("menu").first();
  };

  let rootMenu = await openAdvancedPicker();
  await rootMenu.getByRole("menuitem", { name: /^Model / }).click();
  const modelMenu = page.getByRole("menu", { name: /^Model / });
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
  else await page.keyboard.press("Escape");

  rootMenu = await openAdvancedPicker();
  await rootMenu.getByRole("menuitem", { name: /^Effort / }).click();
  const effortMenu = page.getByRole("menu", { name: /^Effort / });
  const pro = effortMenu.getByRole("menuitemradio", { name: "Pro", exact: true });
  if (await pro.count() !== 1) throw new Error("Pro effort is unavailable");
  if ((await pro.getAttribute("aria-checked")) !== "true") await pro.click();
  else await page.keyboard.press("Escape");
  return { mode: "chat", effort: "Pro", model: preferred };
}

export function getPromptControls(page, projectName) {
  return {
    textbox: page.locator("#prompt-textarea, #pending-home-input")
      .or(page.getByRole("textbox", { name: `New chat in ${projectName}`, exact: true })),
    send: page.locator('[data-testid="send-button"]')
      .or(page.getByRole("button", { name: "Send", exact: true })),
  };
}

export async function waitForCompletedResponse(page) {
  const pollMilliseconds = Number(process.env.CHATGPT_CHAT_POLL_MILLISECONDS || 600_000);
  if (!Number.isFinite(pollMilliseconds) || pollMilliseconds < 1_000) throw new Error("Invalid polling interval");
  const messages = page.locator('[data-message-author-role="assistant"]');
  const responseActions = page.getByRole("group", { name: /Response actions|回复操作/i });
  for (;;) {
    const stop = page.locator('[data-testid="stop-button"]');
    if (await stop.count() && await stop.first().isVisible()) {
      await page.waitForTimeout(pollMilliseconds);
      continue;
    }
    const currentMessages = page.locator('[data-markdown-text-style="assistant-message"]');
    const completionVisible = await page.getByRole("status")
      .filter({ hasText: /^Response complete$/ }).last().isVisible().catch(() => false);
    const regenerationVisible = !completionVisible && await page.getByRole("button", { name: "Regenerate response", exact: true })
      .last().isVisible().catch(() => false);
    if (await currentMessages.count() && (completionVisible || regenerationVisible)) {
      const content = currentMessages.last();
      const text = (await content.innerText()).trim();
      if (!completionVisible) {
        await page.waitForTimeout(2_000);
        if (text !== (await content.innerText()).trim()) continue;
      }
      if (text) return {
        turn: content.locator('xpath=ancestor::*[@data-content-search-unit-key][1]'),
        text,
      };
    }
    if (!(await messages.count())) {
      await page.waitForTimeout(Math.min(pollMilliseconds, 10_000));
      continue;
    }
    const content = messages.last();
    const actions = responseActions.last();
    if (await responseActions.count()) {
      await actions.waitFor({ state: "visible", timeout: 5_000 });
      return { turn: actions.locator("xpath=ancestor::article[1]"), text: (await content.innerText()).trim() };
    }
    const first = (await content.innerText()).trim();
    if (!first) {
      await page.waitForTimeout(Math.min(pollMilliseconds, 10_000));
      continue;
    }
    await page.waitForTimeout(2_000);
    const second = (await content.innerText()).trim();
    if (first === second && !(await stop.count() && await stop.first().isVisible())) {
      return { turn: content.locator("xpath=ancestor::article[1]"), text: second };
    }
  }
}


export async function runWorkflow(page, input, { onPhase = () => {} } = {}) {
  if (input.command === "login") {
    await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
    return { authenticated: true };
  }
  await requireAuthentication(page);
  if (input.command === "doctor") return { authentication: "authenticated" };
  async function waitForProject(projectUrl, projectName) {
  const main = page.locator("main");
  const visibleProjectName = main.getByText(projectName, { exact: true }).first();
  const projectTabs = main.getByRole("tab", { name: /^(Chats|Sources|聊天|来源)$/i });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (page.url() !== projectUrl) {
      await page.goto(projectUrl, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
    }
    const nameVisible = await visibleProjectName.waitFor({ state: "visible", timeout: 60_000 })
      .then(() => true).catch(() => false);
    if (nameVisible && await projectTabs.count() >= 2) return;
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
  }
  const currentTitle = await page.title().catch(() => "unavailable");
  throw new Error(`Mapped ChatGPT Project is not visible at ${page.url()} (${currentTitle})`);
}

async function verifyProjectOnlyMemory() {
  const details = page.getByRole("button", { name: /^(Show project details|Project actions|显示项目详情)$/i });
  await details.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: /Project settings|项目设置/i }).focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 10_000 });
  const text = await dialog.innerText();
  const verified = /\bMemory\b|记忆/.test(text)
    && /\bProject-only\b|仅限项目/.test(text)
    && (/Work mode isn[’']t available/.test(text) || /无法使用工作模式/.test(text));
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
  if (!verified) throw new Error("Project-only memory is not visibly verified");
}

async function projectCreateControl() {
  const named = page.getByRole("button", { name: /^(new project|create project|add new project|新建项目|创建项目|添加新项目)$/i })
    .filter({ visible: true }).first();
  if (await named.isVisible().catch(() => false)) return named;

  const heading = page.getByText(/^(projects|项目)$/i, { exact: true }).first();
  await heading.waitFor({ state: "visible", timeout: 30_000 });
  await heading.hover({ timeout: 5_000 });
  await page.waitForTimeout?.(500).catch(() => {});
  if (await named.isVisible().catch(() => false)) return named;
  const labelled = page.locator('[aria-label*="project" i]:not([aria-label*="options" i]):not([aria-label*="actions" i])')
    .filter({ visible: true }).first();
  if (await labelled.isVisible().catch(() => false)) return labelled;
  const fallback = page.locator('[aria-label="Add new project"], [aria-label*="new project" i], [aria-label*="新建项目" i], [aria-label*="添加新项目" i]').first();
  if (await fallback.count() > 0) return fallback;
  const headingButton = heading.locator("xpath=ancestor::button[1]");
  const sibling = headingButton.locator("xpath=following-sibling::button[1]");
  if (await sibling.isVisible().catch(() => false)) return sibling;
  throw new Error("The visible Projects section has no create control");
}

async function createProject(projectName) {
  await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await ensureSidebar(page);
  const create = await projectCreateControl();
  if (await page.getByRole("button", { name: projectName, exact: true }).count()
    || await page.getByRole("link", { name: projectName, exact: true }).count()) {
    throw new Error("An unmapped same-name ChatGPT Project already exists");
  }
  await create.click({ force: true });
  const dialog = page.getByRole("dialog");
  await dialog.waitFor?.({ state: "visible", timeout: 15_000 }).catch?.(() => {});
  await page.waitForTimeout?.(300).catch(() => {});
  const input = dialog.locator('input[type="text"]').first().or(dialog.getByRole("textbox").first()).first();
  await input.waitFor?.({ state: "visible", timeout: 10_000 }).catch?.(() => {});
  await input.fill(projectName);
  const memoryBtn = dialog.getByRole("button", { name: /^(Default memory|默认记忆)$/i }).first();
  if (await memoryBtn.isVisible().catch(() => false)) {
    await memoryBtn.click();
    await page.getByRole("menuitemradio", { name: /Project-only memory|仅限项目/i }).click();
    await dialog.getByRole("button", { name: /^(Project-only memory|仅限项目)$/i })
      .waitFor({ state: "visible", timeout: 10_000 });
  }
  await dialog.getByRole("button", { name: /^(Create project|创建项目)$/i }).click();
  await page.waitForURL(/\/g\/[^/]+\/project$/, { timeout: 30_000 });
  return page.url();
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

async function uploadAttachments(attachmentPaths) {
  if (!attachmentPaths?.length) return [];
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: "attached", timeout: 30_000 });
  await fileInput.setInputFiles(attachmentPaths);
  const uploaded = [];
  for (const attachmentPath of attachmentPaths) {
    const name = path.basename(attachmentPath);
    await page.locator("main form").getByText(name, { exact: true }).last()
      .waitFor({ state: "visible", timeout: 60_000 });
    uploaded.push({ name, bytes: fs.statSync(attachmentPath).size });
  }
  return uploaded;
}

async function waitForSourcesLoaded() {
  const surface = page.locator('[data-project-home-sources-surface="true"]');
  await surface.waitFor({ state: "visible", timeout: 30_000 });
  await surface.locator(".skeleton").waitFor({ state: "hidden", timeout: 60_000 });
  return surface;
}

async function openProjectSources(projectUrl, projectName) {
  await waitForProject(projectUrl, projectName);
  const url = new URL(projectUrl);
  url.searchParams.set("tab", "sources");
  await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 30_000 });
  return waitForSourcesLoaded();
}

async function listProjectSources(surface) {
  const rows = surface.locator(".group\\/file-row");
  const sources = [];
  const count = Math.min(await rows.count(), 100);
  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    if (!await row.isVisible().catch(() => false)) continue;
    const lines = (await row.innerText()).split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines[0]) sources.push({ name: lines[0] });
  }
  return sources;
}

async function addProjectSources(surface, sourcePaths) {
  const fileInput = surface.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: "attached", timeout: 30_000 });
  await fileInput.setInputFiles(sourcePaths);
  const added = [];
  for (const sourcePath of sourcePaths) {
    const name = path.basename(sourcePath);
    const sourceName = surface.getByText(name, { exact: true }).last();
    await sourceName.waitFor({ state: "visible", timeout: 120_000 });
    const row = sourceName.locator("xpath=ancestor::div[contains(@class, 'group/file-row')][1]");
    await row.getByText(/\S+\s*·\s*\S+/).waitFor({ state: "visible", timeout: 120_000 });
    await page.waitForTimeout(2_000);
    if (!await row.isVisible()) throw new Error(`Project source did not persist visibly: ${name}`);
    added.push({ name, bytes: fs.statSync(sourcePath).size });
  }
  await page.waitForTimeout(2_000);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
  const refreshed = await waitForSourcesLoaded();
  for (const { name } of added) {
    await refreshed.getByText(name, { exact: true }).last()
      .waitFor({ state: "visible", timeout: 30_000 });
  }
  return added;
}

async function removeProjectSource(surface, sourceName) {
  const name = surface.getByText(sourceName, { exact: true }).last();
  await name.waitFor({ state: "visible", timeout: 30_000 });
  const row = name.locator("xpath=ancestor::div[contains(@class, 'group/file-row')][1]");
  let menu = row.getByRole("button", { name: /more|options|actions/i }).last();
  if (!(await menu.count())) menu = row.locator("button").last();
  if (!(await menu.count())) throw new Error("The selected project source has no visible action menu");
  await row.hover();
  await menu.click();
  const remove = page.getByRole("menuitem", { name: /^(delete|remove)( source)?$|^删除$/i }).last();
  await remove.waitFor({ state: "visible", timeout: 10_000 });
  await remove.click();
  const dialog = page.getByRole("dialog").last();
  if (await dialog.isVisible().catch(() => false)) {
    const confirm = dialog.getByRole("button", { name: /^(delete|remove)( source)?$|^删除$/i }).last();
    await confirm.waitFor({ state: "visible", timeout: 10_000 });
    await confirm.click();
  }
  await name.waitFor({ state: "hidden", timeout: 30_000 });
  await page.waitForTimeout(2_000);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
  const refreshed = await waitForSourcesLoaded();
  if (await refreshed.getByText(sourceName, { exact: true }).count()) {
    throw new Error("Project source deletion did not persist after reload");
  }
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
    if (input.command === "inspect") {
      projectUrl = await findMappedProject(page, input.projectName, waitForProject);
      if (!projectUrl) return { projectMissing: true };
    } else {
      if (input.command !== "ask" || !input.newConversation) throw new Error("Project is not mapped");
      projectUrl = await createProject(input.projectName);
      createdProjectUrl = projectUrl;
    }
  } else {
    await waitForProject(projectUrl, input.projectName);
  }
  await verifyProjectOnlyMemory();
  if (input.command.startsWith("source-")) {
    const surface = await openProjectSources(projectUrl, input.projectName);
    if (input.command === "source-list") {
      return { projectUrl, createdProjectUrl, sources: await listProjectSources(surface) };
    }
    if (input.command === "source-add") {
      const addedSources = await addProjectSources(surface, input.sourcePaths);
      return {
        projectUrl,
        createdProjectUrl,
        addedSources,
        sources: await listProjectSources(surface),
      };
    }
    await removeProjectSource(surface, input.sourceName);
    return {
      projectUrl,
      createdProjectUrl,
      removedSource: { name: input.sourceName },
      sources: await listProjectSources(surface),
    };
  }
  const interaction = await ensureBestInteraction(page);
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
  let uploadedAttachments = [];
  let conversationUrl;
  if (input.resumeConversationUrl) {
    await page.goto(input.resumeConversationUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    conversationUrl = input.resumeConversationUrl;
    onPhase("submitted_confirmed", { conversationUrl });
  } else {
    const { textbox, send } = getPromptControls(page, input.projectName);
    await textbox.waitFor({ state: "visible", timeout: 30_000 });
    uploadedAttachments = await uploadAttachments(input.attachmentPaths);
    await textbox.fill(input.prompt);
    await send.waitFor({ state: "visible", timeout: 30_000 });
    const uploadDeadline = Date.now() + 60_000;
    while (!(await send.isEnabled())) {
      if (Date.now() >= uploadDeadline) throw new Error("Uploaded attachments did not become ready to send");
      await page.waitForTimeout(500);
    }
    onPhase("submitting");
    await send.click();
    await page.waitForURL(/\/c\//, { timeout: 30_000 });
    conversationUrl = page.url();
    onPhase("submitted_confirmed", { conversationUrl });
  }
  const { turn, text } = await waitForCompletedResponse(page);
  const responsePath = path.join(input.artifactDirectory, `${new Date().toISOString().replace(/[:.]/g, "-")}-response.txt`);
  fs.writeFileSync(responsePath, `${text}\n`, { mode: 0o600, flag: "wx" });
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
    uploadedAttachments,
    attachments,
  };
}

  return run();
}
