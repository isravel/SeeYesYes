# M5.9 Agent-readable files and Copy for LLM

Date: 2026-10-14

**`/llms.txt` and `/llms-full.txt`** are static route handlers generated at build time (the build output marks both as static) from the registry and the default preset, reusing the context functions and Markdown serializer with no separate content source.

- `/llms.txt` follows the llms.txt shape: system name heading, a one-line summary, a note that it uses the default theme and where to get applied-theme exports (AI Context), the principles, project guidance, then link sections: System (Tokens, Rules, Accessibility), every Component Detail page sorted by ID with its short purpose, and AI (AI Context and the full file). Links are site-root paths, and the browser test requests every one and gets a 200.
- `/llms-full.txt` is the full-mode Markdown export (`scope: default-theme`) behind the same note.
- Output is deterministic and independent of input order.
- **Left for M6 by design:** Getting Started and each Documentation article do not exist yet, so neither file links or includes them; the plan runs the full link check in M6 once articles exist. The files link only to screens that exist (checked).

**Copy for LLM** on Component Detail copies that component's task-mode Markdown under the applied theme (theme ID, effective defaults, and token values change after Apply; the test confirms `theme custom (based on default)` and a changed radius value), and reports "Copied the task export for LLM use." or the shared clipboard failure message. The shared `CopyButton` gained an optional visible text prop for this.

**AI Context** now links both files with a note that they use the default theme and cannot see applied settings.

**Routing fix:** the shared link components now send files and API routes (for example `/llms.txt`) through plain anchors instead of client navigation; `lib/routes.ts` decides, and ignores hashes and queries when looking for a file extension.

Verification: `npm run check` passed (274 unit tests, 6 new for the file format, links, determinism, default-theme scope, and route kinds). All 119 production browser tests passed, including 4 new: both files are served as text and match the pure builders with every link resolving, AI Context links and default-theme note, Copy for LLM under default and applied themes, and Copy for LLM failure feedback. A flaky count in an older Tokens test (it counted cards before the list loaded) now waits for the list. Human screen-reader and WCAG review remain open.

M5.9 is complete. Next: M5.10 the `AGENTS.md` snippet in AI Context.
