# Implementation research

Checked 2026-07-30.

## Browser control

The runtime uses a deterministic Playwright driver over CDP with a dedicated persistent profile. Google Chrome and Microsoft Edge both expose the Chromium DevTools Protocol required by this workflow. The driver selects an installed supported browser, prefers Edge when both are present to preserve existing deployments, and allows explicit executable/profile overrides.

Remote debugging never targets the user's daily profile. Each browser family has its own isolated profile, the debugging port is random and loopback-only, and the browser closes after each completed operation. Playwriter remains pinned only as the source of its reviewed Playwright runtime; its extension and relay are not used.

Sources:

- [Microsoft Edge DevTools Protocol](https://learn.microsoft.com/en-us/microsoft-edge/devtools/protocol/)
- [Chrome remote debugging security change](https://developer.chrome.com/blog/remote-debugging-port)
- [Playwright Chrome extensions and CDP](https://playwright.dev/docs/chrome-extensions)
- [Playwriter package on npm](https://www.npmjs.com/package/playwriter)

## ChatGPT Projects

OpenAI documents Projects as workspaces containing chats, files, instructions, and project memory. Project-only memory must be selected when creating a Project and cannot be enabled later on an existing default-memory Project. The driver therefore verifies the visible immutable Project-only setting before every send.

Source:

- [Projects in ChatGPT, OpenAI Help Center](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)

## Model and reasoning controls

OpenAI documents model and reasoning controls in the composer. Labels can change, so the driver ranks visible flagship GPT choices and verifies Pro immediately before sending instead of trusting hidden fields or a fixed model name.

Source:

- [ChatGPT Release Notes, OpenAI Help Center](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

## Similar skills

No maintained skill found during implementation combined authenticated ChatGPT Web automation, project-only verification, repository-to-Project routing, long Pro polling, complete response retrieval, and attachment capture. This skill therefore exposes three deterministic commands and keeps browser mechanics internal.
