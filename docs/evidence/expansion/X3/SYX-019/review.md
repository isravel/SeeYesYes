# SYX-019 ConfirmDialog review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check.

## What it is

`ConfirmDialog` (`components/ui/confirm-dialog.tsx`) is a modal `alertdialog` built on the same React Aria overlay as `Dialog`, sharing its panel styles. It is not a wrapper around the public `Dialog` component, because `Dialog` has no slot for a form, pending state or role override.

- Named by its title, described by its message. An outside press never dismisses it.
- Initial focus is on Cancel, or on the confirmation field when `confirmText` is set. It is never on Confirm.
- `confirmText` keeps Confirm disabled until the typed text matches exactly (case-sensitive). Enter in the field submits once it matches.
- `onConfirm` may be async. While it runs, Confirm shows progress, Cancel and the field are disabled, a `status` message is announced, and Escape or a controlled close request is ignored. Focus moves to the dialog so it is not lost when Confirm is disabled.
- If `onConfirm` throws or rejects, the dialog stays open, shows `errorMessage` as text in an `alert`, keeps the typed text, and returns focus to Confirm for a retry.
- On success it closes and focus returns to the trigger.

## Deviations from the plan

- Planned state "succeeded" is the closed dialog; there is no separate succeeded UI inside it. The contract lists mismatch, ready, pending and failed.
- `InternalTriggerButton` gained an optional `variant` so a destructive trigger can match the confirm action.
- A failed confirm cannot be told apart from a thrown programmer error: both show `errorMessage`.

## Not covered

Screen-reader announcement of the pending and error messages, right-to-left layout, a confirm that takes longer than the test delay, and a controlled `isOpen` parent that closes the dialog mid-request (the close is ignored while pending, by design).
