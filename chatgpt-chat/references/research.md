# Implementation research

Checked 2026-07-30.

## Browser control

Playwriter is the selected browser bridge because its first-party repository explicitly supports controlling an already-running Chromium browser through an extension, preserving that browser's logins, cookies, and extensions. It requires explicit per-tab consent and keeps the relay on localhost. The CLI executes Playwright snippets against an extension-connected tab rather than launching a fresh profile.

Sources:

- [remorses/playwriter README](https://github.com/remorses/playwriter/blob/main/README.md)
- [Playwriter extension source and manifest](https://github.com/remorses/playwriter/tree/main/extension)
- [Playwriter package on npm](https://www.npmjs.com/package/playwriter)

Microsoft's Playwright CLI was considered, but its documented persistent sessions use a Playwright-owned browser profile. That does not meet the requirement to reuse the already-authenticated Edge desktop profile.

- [microsoft/playwright-cli README](https://github.com/microsoft/playwright-cli/blob/main/README.md)

## ChatGPT Projects

OpenAI documents Projects as workspaces containing chats, files, instructions, and project memory. Its current Projects article says project-only memory must be selected when starting a new Project; an existing default-memory Project cannot be converted. Under project-only memory, chats may reference other conversations in the same Project but not conversations outside it. This is why the skill fails closed rather than reusing an unverified same-name Project.

Source:

- [Projects in ChatGPT, OpenAI Help Center](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)

## Model and reasoning controls

OpenAI's release notes state that model selection appears in the message composer and that Thinking/Pro effort controls are in the model picker. The documented effort names can change over time. The skill therefore verifies the highest currently visible Pro effort and flagship model immediately before sending rather than relying on hidden request fields or fixed selectors.

The release notes available during implementation did not document the user's visible `GPT-5.6 sol` label. That label must be treated as an account/UI capability and verified in the authenticated browser; the skill must not claim it is selected based only on a hard-coded name.

Source:

- [ChatGPT Release Notes, OpenAI Help Center](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

## Similar skills

A search of skills.sh and GitHub did not identify a maintained skill that combined authenticated ChatGPT Web automation, project-only memory verification, local-to-web Project mapping, long Pro polling, transcript retrieval, and attachment downloads. The existing local `playwriter` skill and its upstream source provide the browser-control substrate, while this skill adds the ChatGPT-specific safety and routing workflow.
