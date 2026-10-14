# M6.4 Documentation articles and registry-derived reference

Date: 2026-10-14

**Hand-written articles** live as Markdown files in `content/docs/` with a front matter block (title, description, order). Five guides cover concepts (the shared contract), configuration (draft, applied, and default themes; Apply, Discard, and Reset; appearance; two tabs; contrast warnings; the Playground), context (modes, labels and sizes, default versus applied theme, the `AGENTS.md` snippet, Copy for LLM), accessibility evidence (what is and is not checked, with the review status stated plainly), and local setup. They are rendered by one pipeline (`marked`, pinned) that escapes raw HTML, gives every heading a stable unique anchor, and makes code blocks keyboard reachable. Pages are generated statically at build time.

**Generated reference** (`buildReferenceArticles`) is kept separate and labeled "Generated from the registry": a one-line-per-component list linking to each Component Detail page, token category counts linking to the Tokens screen, and every rule linking to its card on the Rules screen. It summarizes and links; it does not rebuild those screens.

**Accuracy checks** (`tests/docs.test.ts`): every article starts with a heading and has a description; every link is a site-root path to a real screen, article, or heading (including rule IDs); every `npm run` script named exists, every `@/…` import shown points at a real file, and the Node version matches `.nvmrc`; no claim of a package, installer, hosting, certification, or full accessibility appears, and the accessibility article says components are not reviewed.

M6.4 is complete.
