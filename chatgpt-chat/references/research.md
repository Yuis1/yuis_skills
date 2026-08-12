# Implementation research

Checked 2026-08-12.

## Decision

Use the user's existing authenticated browser Profile through the Playwriter extension. Select one connected Microsoft Edge Profile first; when Edge is unavailable, select one connected Google Chrome Profile. Both families execute the same `browser-workflow.mjs` program, so browser diversity changes only transport selection, not ChatGPT behavior.

The runtime never reads or copies cookies. Each command creates a Playwriter session and a task-owned `chatgpt.com` tab, then closes only that tab and deletes only that session. It never closes the browser or user tabs.

## Unattended reconnect

A healthy Playwriter extension survives page reload and navigation and automatically reconnects its WebSocket. Local relay logs also showed automatic reconnection after close code 1001 without a user click. Refreshing ChatGPT is not itself a reconnect mechanism: while the control channel is down, automation cannot issue a page refresh through that channel.

The transport instead waits for the same stable browser key to reappear, resets the Playwriter session, discards old Page handles, and creates a fresh task-owned tab. Read-only operations and a provably pre-submit `ask` retry at most once. After ChatGPT has assigned a conversation URL, recovery may resume response observation in a fresh owned tab without sending again. If submission cannot be proved either way, the command returns `ASK_SUBMISSION_UNKNOWN` and does not retry. Operations remain serialized to avoid the previous overload pattern of 16 concurrent clients and a large injected script timing out.

## Security boundary

The existing Profile avoids duplicate login but gives the extension broad authority over Profile pages. The product workflow narrows its intended behavior to a newly created task-owned tab and never enumerates or closes existing tabs, although this restriction is policy enforced rather than browser least privilege. Navigation is not domain-allowlisted because third-party federated login must remain possible. Browser credentials, storage, headers, signed URLs, Profile labels, and receipts are never emitted.

## ChatGPT UI contract

The current UI puts Model and Effort in the composer's Advanced menu. The shared workflow selects the newest visible flagship GPT and Pro, opens Projects through the exact project-name control, and verifies immutable Project-only Memory before sending or mutating Sources.

Sources:

- [Playwriter documentation](https://playwriter.dev/)
- [OpenAI: Projects in ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)
