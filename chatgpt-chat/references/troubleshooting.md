# Troubleshooting

Read only the section whose heading matches the CLI error code.

## COMMAND_MISSING

Ask the `yuis_ops` Owner to apply the `chatgpt_chat` role. Do not install anything or create links manually.

## BROWSER_NOT_CONNECTED

Confirm that the user's everyday Edge or Chrome is running and that the Playwriter extension is enabled. The CLI has already waited for the originally selected Profile to reconnect; do not switch to a test browser, dedicated Profile, cloud browser, or copied cookies.

## PAGE_CLOSED

The CLI-owned ChatGPT tab closed during the operation. Keep the selected browser Profile running and retry once. The CLI has already discarded the old Page handle, reset the Playwriter session once when safe, and created a fresh owned tab; do not close user tabs or restart with another Profile.

## RELAY_DISCONNECTED

The Playwriter connection to the selected browser Profile was interrupted and did not recover within the bounded attempt. Keep the same browser Profile running with Playwriter enabled, then retry. Do not select another connected Profile.

## ASK_SUBMISSION_UNKNOWN

The connection ended after submission may have started but before the CLI could prove whether ChatGPT accepted it. Inspect the visible Project conversation before issuing another `ask`; the CLI intentionally did not send the prompt again.

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

## BROWSER_OPERATION_FAILED

Retry once. If it repeats, report the actionable summary and diagnostic identifier to the repository Owner. The CLI already returns a redacted summary; routine consumers should not tail the driver log or read source code.
