import { execFileSync } from "node:child_process";

import { closeBrowserTransport, openBrowserTransport, openLoginTransport } from "./browser-transport.mjs";

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

async function runBrowserWorkflow(input, cwd) {
  const transport = await openBrowserTransport(input, { cwd });
  try {
    return transport.result;
  } finally {
    await closeBrowserTransport(transport);
  }
}

export async function login({ cwd }) {
  const transport = await openLoginTransport({ cwd }, { cwd });
  try {
    return {
      schema_version: 1,
      command: "login",
      status: "browser_profile_ready",
      local_project: cwd,
      browser: transport.family,
    };
  } finally {
    await closeBrowserTransport(transport);
  }
}

export async function inspect({ cwd }) {
  const identity = resolveProject(cwd);
  if (identity.mapping?.project_url && identity.mapping.memory_scope !== "project-only") {
    throw new Error("Project-only memory proof is missing");
  }
  const artifactDirectory = projectState("artifact-dir", "--cwd", cwd);
  const result = await runBrowserWorkflow({
    command: "inspect",
    projectName: identity.local_name,
    projectUrl: identity.mapping?.project_url ?? null,
    artifactDirectory,
  }, cwd);
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
    projectState("bind-project", "--cwd", cwd, "--url", result.projectUrl, "--memory-scope", "project-only");
  }
  return {
    schema_version: 1,
    command: "inspect",
    status: "ready",
    local_project: { name: identity.local_name, root: identity.local_root },
    web_project: { name: identity.local_name, url: result.projectUrl, memory_scope: "project-only" },
    interaction: result.interaction,
    conversations: indexedConversations(identity.mapping),
  };
}

async function runSourceCommand({ cwd, command, sourcePaths = [], sourceName = null }) {
  const identity = resolveProject(cwd);
  if (!identity.mapping?.project_url) throw new Error("Project is not mapped");
  if (identity.mapping.memory_scope !== "project-only") throw new Error("Project-only memory proof is missing");
  const artifactDirectory = projectState("artifact-dir", "--cwd", cwd);
  const result = await runBrowserWorkflow({
    command,
    projectName: identity.local_name,
    projectUrl: identity.mapping.project_url,
    sourcePaths,
    sourceName,
    artifactDirectory,
  }, cwd);
  return {
    schema_version: 1,
    command,
    status: "completed",
    verification: { project: identity.local_name, memory_scope: "project-only" },
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
  const result = await runBrowserWorkflow({
    command: "ask",
    projectName: identity.local_name,
    projectUrl: identity.mapping?.project_url ?? null,
    newConversation,
    conversationUrl,
    prompt,
    attachmentPaths,
    artifactDirectory,
  }, cwd);
  if (result.createdProjectUrl) {
    projectState("bind-project", "--cwd", cwd, "--url", result.createdProjectUrl, "--memory-scope", "project-only");
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
    verification: { project: identity.local_name, memory_scope: "project-only", ...result.interaction },
    response_path: result.responsePath,
    response_bytes: result.responseBytes,
    response_preview: result.responsePreview,
    uploaded_attachments: result.uploadedAttachments,
    attachments: result.attachments,
  };
}
