# M3.5 Apply, Discard, Reset draft, and unsaved state

Date: 2026-10-13

The Theme editor now has Apply to workspace, Discard changes, Reset draft, and an unsaved indicator. The logic lives in `applyDraft`, `discardDraft`, and `resetDraft` in `lib/theme/stores.ts`.

- **Apply** validates the draft, assigns theme identity (`custom` with `basedOn`, or the stock preset ID when values match), replaces the applied theme, and writes the envelope. It preserves appearance, increments `themeRevision` only when the theme actually changed, and refreshes the draft baseline. In session-only mode, or if the write fails, the theme is applied for the session with an explanatory notice.
- **Discard** restores the draft from the applied theme. **Reset draft** loads the default preset into the draft only; the workspace and storage are untouched until Apply.
- **Unsaved indicator** compares theme values only, ignoring `id` and `basedOn`. Apply and Discard are disabled when there is nothing to apply.
- **Navigation:** the app `Link` now navigates client-side for page routes (API routes stay plain anchors), so the draft survives moving between pages. Refresh restores applied settings and starts a clean draft.

Not in this task (M3.7): Web Lock serialization, pending save state, stale-draft rejection, and storage-event sync. Apply currently writes without a lock, so the multi-tab guarantee does not hold yet.

Verification: `npm run check` passed (107 unit tests, including 5 new lifecycle tests; production build). All 27 production browser tests passed, including two new journeys: apply/discard/reset/navigation/refresh, and blocked storage staying session-only. Human screen-reader and WCAG review remain open.

M3.5 is complete. Next: M3.6 local contrast calculation and warnings.
