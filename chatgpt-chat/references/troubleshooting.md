# Troubleshooting

Read only the section whose heading matches the CLI error code.

## COMMAND_MISSING

Ask the `yuis_ops` Owner to apply the `chatgpt_chat` role. Do not install anything or create links manually.

## BROWSER_NOT_CONNECTED

Confirm that the user's everyday Edge or Chrome is running and that the Playwriter extension is enabled. The CLI has already waited for reconnection; do not switch to a test browser, dedicated Profile, cloud browser, or copied cookies.

## BROWSER_PROFILE_AMBIGUOUS

The preferred browser family has multiple connected Profiles. Keep Playwriter connected only in the intended Profile, then retry. Do not guess from an email address, current tab, or recent activity.

## AUTH_REQUIRED

The current Profile has no authenticated ChatGPT session. The normal design reuses the user's existing session; if it has genuinely signed out, authenticate only in the same everyday Profile. Do not read or migrate credentials.

## AUTH_UNVERIFIED

The page proves neither an authenticated state nor a visible login entry point. Report a visible-UI regression; do not send.

## CHALLENGE_REQUIRED

Do not bypass a visible challenge. The runtime does not relax security constraints or switch to another Profile.

## RUNTIME_MISSING

Ask for managed convergence through `chatgpt_chat.yml`. Do not install Playwriter, npm packages, or browser packages yourself.

## BROWSER_BUSY

Another operation is controlling ChatGPT. Wait for it to finish; do not launch a second operation in parallel.

## project_missing

This is a state, not an error. It is returned only after the Projects list has loaded and no exact-name Project is present. Call `ask --new` when a new conversation is required.

## Generic browser operation failure

Read only the redacted tail of the diagnostic log. When no error code matches, report a ChatGPT UI or Playwriter regression. Routine calls must not read source code.
