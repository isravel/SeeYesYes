# M6.8 Articles in the agent files and the A16 checks

Date: 2026-10-14

`/llms.txt` now links Getting Started, the documentation index, and every article (with its description) under a Documentation section. `/llms-full.txt` is the full-mode Markdown export for the default theme followed by exactly the hand-written articles, each marked with its route and with links written as site-root paths. The generated reference articles are listed in `/llms.txt` but not repeated in `/llms-full.txt`, which already contains the same registry data. Both files are still generated at build time, deterministic, and start with the default-theme note.

A16 checks: unit tests confirm both files include every article, that appended Markdown has no relative links, that output is independent of article order, and that every site link in both files resolves to a real screen, article, or component. The browser test fetches both files over HTTP, checks their text equals the pure builders' output, and requests every linked path, including Getting Started and every documentation page, getting 200 for each.

Verification: `npm run check` passed (305 unit tests) and all 147 production browser tests passed. Human review remains open.

M6.8 is complete. Next: M6.6.
