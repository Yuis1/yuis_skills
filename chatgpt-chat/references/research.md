# Implementation research

Checked 2026-08-03.

## Browser control

The runtime uses a deterministic Playwright driver over CDP with a dedicated persistent profile. Google Chrome and Microsoft Edge both expose the Chromium DevTools Protocol required by this workflow. The driver selects an installed supported browser, prefers Edge when both are present to preserve existing deployments, and allows explicit executable/profile overrides.

Remote debugging never targets the user's daily profile. Each browser family has its own isolated profile, the debugging port is random and loopback-only, and the browser closes after each completed operation. When no X11 or Wayland session exists, a managed Xvfb display runs the same visible browser mode with that persistent dedicated Profile; Chromium's native headless mode is not used because the real ChatGPT route presents a challenge there. Interactive login and visible challenges still require a user's managed graphical session. Playwriter remains pinned only as the source of its reviewed Playwright runtime; its extension and relay are not used.

Sources:

- [Microsoft Edge DevTools Protocol](https://learn.microsoft.com/en-us/microsoft-edge/devtools/protocol/)
- [Chrome remote debugging security change](https://developer.chrome.com/blog/remote-debugging-port)
- [Xvfb manual](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml)
- [Playwright Chrome extensions and CDP](https://playwright.dev/docs/chrome-extensions)
- [Playwriter package on npm](https://www.npmjs.com/package/playwriter)

## ChatGPT Projects

OpenAI documents Projects as workspaces containing chats, files, instructions, and project memory. Project-only memory must be selected when creating a Project and cannot be enabled later on an existing default-memory Project. The driver therefore verifies the visible immutable Project-only setting before every send or Sources mutation. The public Sources tab visibly provides file upload and per-source actions; the CLI uses only those UI controls, lists exact visible filenames, and requires an explicit destructive confirmation flag before deletion.

Source:

- [Projects in ChatGPT, OpenAI Help Center](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)

## Model and reasoning controls

OpenAI documents model and reasoning controls in the composer. Labels can change, so the driver ranks visible flagship GPT choices and verifies Pro immediately before sending instead of trusting hidden fields or a fixed model name.

Source:

- [ChatGPT Release Notes, OpenAI Help Center](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

## Similar skills

No maintained skill found during implementation combined authenticated ChatGPT Web automation, project-only verification, repository-to-Project routing, long Pro polling, complete response retrieval, conversation attachment capture, and governed Project Sources. This skill therefore exposes deterministic conversation and source-management commands while keeping browser mechanics internal.
