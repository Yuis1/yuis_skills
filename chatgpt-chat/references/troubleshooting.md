# Troubleshooting by error code

Read only the section matching the CLI error. Do not read implementation files during normal use.

## COMMAND_MISSING

The host has the skill text but not the managed runtime. Stop. Ask the `yuis_ops` Owner to enable and apply the `chatgpt_chat` role. Do not create a CLI symlink and do not install Playwriter, Playwright, npm, or pip packages yourself.

## AUTH_REQUIRED

Run `chatgpt-chat login --cwd "$PWD"` once. The dedicated Chrome or Edge Profile automatically loads its own existing ChatGPT, OpenAI, and Google cookies. Wait for the user to complete any visible sign-in or confirmation, close the window, and rerun `inspect`.

Do not inspect or copy the daily browser Profile. Authentication migration is not a normal CLI operation. Even when the user explicitly requests migration, hand the operation to the repository Owner so it can use the approved local, domain-scoped, browser-stopped procedure without printing credential values.

## AUTH_UNVERIFIED

The page opened but visible controls did not prove either signed-in or signed-out state. Read only the redacted tail of `~/.local/state/chatgpt_chat/driver.log`. Report the code and stop; do not probe cookies or broaden selectors ad hoc.

## CHALLENGE_REQUIRED

Let the user complete the visible ChatGPT or browser challenge in the dedicated window. Do not bypass it. Retry `inspect` afterward.

## RUNTIME_MISSING

The pinned browser runtime is absent or incomplete. Request a managed `chatgpt_chat.yml` convergence. Do not run `npm install`, inspect package internals, or invoke the skill script directly.

## BROWSER_START_FAILED

The runtime already discovers an active X display and supports managed Chrome or Edge. Confirm that a graphical session is active, then report the error. Do not guess `DISPLAY`, launch temporary browser Profiles, or inspect CDP internals.

## BROWSER_BUSY

Another operation owns the dedicated browser lock. Wait for it to finish; do not start a second browser or remove a live lock.

## project_missing

This is a status, not an error. If the user requested a new thread, call `ask --new`; the driver creates the basename-matched Project and verifies Project-only Memory before sending.

## Generic browser operation failure

Read only the redacted diagnostic tail. If no error code matches, report a selector/runtime regression to the skill Owner. Do not read `lib/`, `scripts/`, tests, or implementation research unless the task is explicitly to maintain the skill.
