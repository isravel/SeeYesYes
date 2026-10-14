# M5.2 Copy, download, and byte counts

Date: 2026-10-14

The AI Context screen now has a "Copy or download" panel for the current export.

- **Copy and download** for the JSON and Markdown views use the shared copy-feedback pattern and a shared `downloadText` helper (also now used by the Tokens downloads). Files are named by mode and requested components, for example `seeyesyes.task-button+tabs.context.json`. A failed copy shows "Could not copy…"; a failed download shows "The file could not be saved…" instead of throwing; a successful download is confirmed by name.
- **Byte counts** show the UTF-8 size of each file, labeled "not token counts". The browser test checks them against the real bytes of the copied and downloaded text.
- **Settings download:** the applied `WorkspaceSettings` (validated, stable key order, no bootstrap cache) as `seeyesyes.settings.json`; the test confirms it equals the stored settings after Apply and an appearance change.
- **Empty selection:** Task mode with nothing selected shows no export controls at all. Unknown or empty selections raise clear errors from the context function and are displayed in an alert.
- Stable serialization, and the schema, mode, scope, and theme labels, were already in place from M5.1; the new tests pin them again for settings and filenames.

Not in this task: the `/llms.txt` and `/llms-full.txt` links, which need the files M5.9 generates (a link now would 404).

Verification: `npm run check` passed (213 unit tests, 3 new). All 83 production browser tests passed, including 3 new: copied and downloaded content equals the displayed export with matching byte counts; the settings file equals the applied settings; clipboard and download failures and empty selections give clear feedback. Human screen-reader and WCAG review remain open.

M5.2 is complete. Next: M5.3 Rules screen.
