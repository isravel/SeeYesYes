# M3.7 Storage failures, cross-tab writes, and reduced motion

Date: 2026-10-13

`lib/theme/writer.ts` is now the single settings writer.

- **Lock:** every persistent save runs inside an exclusive Web Lock (`seeyesyes:settings:v1:write`). The latest envelope is read, validated, merged, given a rebuilt bootstrap cache, and written with one `setItem`, all inside the lock. There is no unlocked persistent write.
- **Apply** merges only the theme into the latest stored settings, so a newer appearance from another tab is preserved. `themeRevision` increases only when the theme actually changes.
- **Appearance** (`commitAppearance`) merges only the preference into the latest theme/revision and rebuilds the cache at the same revision. Appearance requests apply in lock order. The workspace appearance selector UI is not part of M3 and does not exist yet; the writer is ready and tested for it.
- **Stale drafts:** Apply compares the draft baseline with the latest stored revision. On a mismatch nothing is written, the draft is kept, the latest applied settings are adopted, and the page shows "The theme changed in another tab. Your draft is still here." Discard loads the latest applied theme. Reset draft does not clear the stale baseline.
- **Pending and failure:** the Apply button shows pending state and duplicate submits are refused. A cancelled or failed lock request writes nothing, shows a retry message, and keeps the draft. A failed write applies for the session with a notice. An invalid draft is rejected before the lock is requested.
- **Storage event:** `ThemeLifecycleProvider` rereads and validates the stored envelope on each `storage` event for the settings key, adopts it, and recalculates the unsaved indicator without touching the draft or its baseline. Session-only tabs and unreadable storage are ignored.
- **Fallbacks:** blocked storage, or no Web Locks, starts from saved settings when readable and is then session-only with a "reset on refresh" notice and no shared writes. Corrupt data and unsupported envelope versions get distinct notices and fall back to defaults.
- **Reduced motion:** the existing global `prefers-reduced-motion` rule already zeroes transitions and animations; a new browser check confirms it inside the preview scope even with the Motion setting on.

Verification: `npm run check` passed (124 unit tests, 12 new, including controlled concurrent two-tab sequences, competing stale drafts, queued storage events, lock cancellation, failing writes, and fallbacks). All 31 production browser tests passed, including real two-tab Web Lock journeys, the no-Web-Locks path, and reduced motion in the preview.

M3.7 is complete. Next: M3.8 lifecycle test sweep (bootstrap cache cases, first paint after OS mode changes, resolver/allowlist test, global appearance during an open draft) and the M3 gate.
