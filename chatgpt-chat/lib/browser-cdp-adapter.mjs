import { execFileSync } from "node:child_process";
import { startBrowser, withBrowserPage, authRequired } from "./chromium-runtime.mjs";
import { runWorkflow } from "./browser-workflow.mjs";

const projectStateScript = new URL("../scripts/project_state.py", import.meta.url).pathname;

function projectState(...args) {
  return execFileSync("python3", [projectStateScript, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function resolveProject(cwd) {
  return JSON.parse(projectState("resolve", "--cwd", cwd));
}

function indexedConversations(mapping) {
  return (mapping?.conversations ?? []).slice(0, 8).map((item) => ({
    title: item.title,
    topic: item.topic,
    url: item.url,
    last_used_at: item.last_used_at,
  }));
}

function validateConversationChoice(identity, conversationUrl) {
  if (!conversationUrl) return;
  const parsed = new URL(conversationUrl);
  if (parsed.protocol !== "https:" || parsed.hostname !== "chatgpt.com") {
    throw new Error("Conversation URL must belong to chatgpt.com");
  }
  if (!(identity.mapping?.conversations ?? []).some((item) => item.url === conversationUrl)) {
    throw new Error("Conversation URL is not indexed under this local project");
  }
}

export function classifyAuthenticationEvidence({
  loginControl,
  composer,
  newProjectControl = 0,
  projectsHeading,
  profileControl,
  challengeFrame,
}) {
  if (challengeFrame > 0) return "challenge";
  if (loginControl > 0) return "required";
  if (composer > 0 && (newProjectControl > 0 || projectsHeading > 0 || profileControl > 0)) return "authenticated";
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

function codedError(code, message) {
  return Object.assign(new Error(message), { code });
}

async function requireAuthentication(page) {
  await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.locator('#prompt-textarea, a[href^="/auth/login"]').first()
    .waitFor({ state: "visible", timeout: 15_000 })
    .catch(() => {});
  await page.waitForTimeout(1_000);
  const evidence = {
    loginControl: await visibleCount(page.getByRole("link", { name: /log in|登录/i }))
      + await visibleCount(page.getByRole("button", { name: /log in|登录/i })),
    composer: await visibleCount(page.locator("#prompt-textarea")),
    newProjectControl: await visibleCount(page.getByRole("button", {
      name: /^(new project|create project|新建项目|创建项目)$/i,
    })),
    projectsHeading: await visibleCount(page.getByText(/^(projects|项目)$/i, { exact: true })),
    profileControl: await visibleCount(page.getByRole("button", { name: /profile|个人资料|账户|account/i })),
    challengeFrame: await page.locator('iframe[src*="challenge"], iframe[src*="cloudflare"]').count(),
  };
  const status = classifyAuthenticationEvidence(evidence);
  if (status === "authenticated") return;
  if (status === "required") throw authRequired();
  if (status === "challenge") throw codedError("CHALLENGE_REQUIRED", "ChatGPT requires an interactive challenge");
  throw codedError("AUTH_UNVERIFIED", "ChatGPT authentication state could not be verified from visible controls");
}

export async function login({ cwd }) {
  await startBrowser("https://chatgpt.com/", { interactive: true });
  return {
    schema_version: 1,
    command: "login",
    status: "login_window_open",
    local_project: cwd,
  };
}

export async function inspect({ cwd }) {
  const identity = resolveProject(cwd);
  if (identity.mapping?.project_url && identity.mapping.memory_scope !== "project-only") {
    throw new Error("Project-only memory proof is missing");
  }
  const artifactDirectory = projectState("artifact-dir", "--cwd", cwd);
  const result = await withBrowserPage(async (page) => {
    await requireAuthentication(page);
    return runWorkflow(page, {
      command: "inspect",
      projectName: identity.local_name,
      projectUrl: identity.mapping?.project_url ?? null,
      artifactDirectory,
    });
  });
  if (result.projectMissing) {
    return {
      schema_version: 1,
      command: "inspect",
      status: "project_missing",
      local_project: { name: identity.local_name, root: identity.local_root },
      web_project: null,
      interaction: null,
      conversations: [],
    };
  }
  if (!identity.mapping?.project_url) {
    projectState(
      "bind-project", "--cwd", cwd,
      "--url", result.projectUrl,
      "--memory-scope", "project-only",
    );
  }
  return {
    schema_version: 1,
    command: "inspect",
    status: "ready",
    local_project: { name: identity.local_name, root: identity.local_root },
    web_project: {
      name: identity.local_name,
      url: identity.mapping.project_url,
      memory_scope: "project-only",
    },
    interaction: result.interaction,
    conversations: indexedConversations(identity.mapping),
  };
}

async function runSourceCommand({ cwd, command, sourcePaths = [], sourceName = null }) {
  const identity = resolveProject(cwd);
  if (!identity.mapping?.project_url) throw new Error("Project is not mapped");
  if (identity.mapping.memory_scope !== "project-only") {
    throw new Error("Project-only memory proof is missing");
  }
  const artifactDirectory = projectState("artifact-dir", "--cwd", cwd);
  const result = await withBrowserPage(async (page) => {
    await requireAuthentication(page);
    return runWorkflow(page, {
      command,
      projectName: identity.local_name,
      projectUrl: identity.mapping.project_url,
      sourcePaths,
      sourceName,
      artifactDirectory,
    });
  });
  return {
    schema_version: 1,
    command,
    status: "completed",
    verification: {
      project: identity.local_name,
      memory_scope: "project-only",
    },
    ...(command === "source-add" ? { added_sources: result.addedSources } : {}),
    ...(command === "source-remove" ? { removed_source: result.removedSource } : {}),
    sources: result.sources,
  };
}

export async function sourceList({ cwd }) {
  return runSourceCommand({ cwd, command: "source-list" });
}

export async function sourceAdd({ cwd, sourcePaths = [] }) {
  return runSourceCommand({ cwd, command: "source-add", sourcePaths });
}

export async function sourceRemove({ cwd, sourceName }) {
  return runSourceCommand({ cwd, command: "source-remove", sourceName });
}

export async function ask({ cwd, prompt, conversationUrl, newConversation, attachmentPaths = [] }) {
  if (!prompt.trim()) throw new Error("Prompt file is empty");
  const identity = resolveProject(cwd);
  validateConversationChoice(identity, conversationUrl);
  if (identity.mapping?.project_url && identity.mapping.memory_scope !== "project-only") {
    throw new Error("Project-only memory proof is missing");
  }
  const artifactDirectory = projectState("artifact-dir", "--cwd", cwd);
  const result = await withBrowserPage(async (page) => {
    await requireAuthentication(page);
    return runWorkflow(page, {
      command: "ask",
      projectName: identity.local_name,
      projectUrl: identity.mapping?.project_url ?? null,
      newConversation,
      conversationUrl,
      prompt,
      attachmentPaths,
      artifactDirectory,
    });
  });
  if (result.createdProjectUrl) {
    projectState(
      "bind-project", "--cwd", cwd,
      "--url", result.createdProjectUrl,
      "--memory-scope", "project-only",
    );
  }
  projectState(
    "record-conversation", "--cwd", cwd,
    "--url", result.conversationUrl,
    "--title", result.conversationTitle,
    "--topic", prompt.trim().slice(0, 240),
  );
  return {
    schema_version: 1,
    command: "ask",
    status: "completed",
    conversation_url: result.conversationUrl,
    verification: {
      project: identity.local_name,
      memory_scope: "project-only",
      ...result.interaction,
    },
    response_path: result.responsePath,
    response_bytes: result.responseBytes,
    response_preview: result.responsePreview,
    uploaded_attachments: result.uploadedAttachments,
    attachments: result.attachments,
  };
}
