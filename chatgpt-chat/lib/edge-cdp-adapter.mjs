import { execFileSync } from "node:child_process";
import { startEdge, withEdgePage, authRequired } from "./edge-runtime.mjs";
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

async function requireAuthentication(page) {
  await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
  const login = page.locator('a[href^="/auth/login"]:visible');
  const projectControl = page.getByRole("button", { name: "New project", exact: true });
  const authenticated = await projectControl.waitFor({ state: "visible", timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  if (!authenticated && await login.count()) throw authRequired();
  if (!authenticated) throw new Error("ChatGPT authentication state could not be verified");
}

export async function login({ cwd }) {
  await startEdge("https://chatgpt.com/");
  return {
    schema_version: 1,
    command: "login",
    status: "login_window_open",
    local_project: cwd,
  };
}

export async function inspect({ cwd }) {
  const identity = resolveProject(cwd);
  if (!identity.mapping?.project_url) {
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
  if (identity.mapping.memory_scope !== "project-only") {
    throw new Error("Project-only memory proof is missing");
  }
  const artifactDirectory = projectState("artifact-dir", "--cwd", cwd);
  const result = await withEdgePage(async (page) => {
    await requireAuthentication(page);
    return runWorkflow(page, {
      command: "inspect",
      projectName: identity.local_name,
      projectUrl: identity.mapping.project_url,
      artifactDirectory,
    });
  });
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

export async function ask({ cwd, prompt, conversationUrl, newConversation }) {
  if (!prompt.trim()) throw new Error("Prompt file is empty");
  const identity = resolveProject(cwd);
  validateConversationChoice(identity, conversationUrl);
  if (identity.mapping?.project_url && identity.mapping.memory_scope !== "project-only") {
    throw new Error("Project-only memory proof is missing");
  }
  const artifactDirectory = projectState("artifact-dir", "--cwd", cwd);
  const result = await withEdgePage(async (page) => {
    await requireAuthentication(page);
    return runWorkflow(page, {
      command: "ask",
      projectName: identity.local_name,
      projectUrl: identity.mapping?.project_url ?? null,
      newConversation,
      conversationUrl,
      prompt,
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
    attachments: result.attachments,
  };
}
