# M2.5 Table and Navigation

Reviewed 2026-10-08. M2.5 complete. The M2 completion gate remains open.

## What changed

Table renders a native caption, column headers, optional row headers, and rows keyed by stable IDs. Empty results keep the table name and show a clear message. Wide data stays inside a named, keyboard-focusable scroll region. It adds no sorting, selection, or pagination behavior.

Navigation shares grouped links between its desktop sidebar and mobile modal drawer. Current links use aria-current. It includes a skip link, group headings, and breadcrumbs. The drawer uses React Aria to contain focus and restore it on Escape or explicit close. Selecting a local destination closes the drawer and focuses that destination. Portals inherit the nearest ThemeScope.

The homepage now uses the sidebar and mobile drawer. Its heading, title, active destination, and breadcrumb all identify Overview. Links lead to working preview sections or API endpoints; the full workspace route screens remain planned for later milestones. Embedded Navigation examples omit the page skip link.

Both components have typed APIs, CSS Modules, live previews, examples, and registry contracts. The registry now contains all 24 required components and 32 examples. Table remains a basic data component; its scroll region supports keyboard access without adding interactive grid semantics.

## Evidence

- [Check log](checks.txt): registry generation, type checking, lint, 86 unit tests, and production build pass.
- [Browser log](browser.txt): all 16 checks pass, including desktop page identity, skip-link focus, mobile drawer containment/restoration, destination focus and current state, nested portal scope, native table header associations, empty text, keyboard scrolling, and contained page width.
- Automated axe checks find no serious or critical issues on the homepage or open drawer in the tested fixtures.
- [Light mobile navigation](navigation-light-320.png), [dark mobile navigation](navigation-dark-320.png), [light desktop navigation](navigation-light-1280.png), [dark desktop navigation](navigation-dark-1280.png).
- [Light mobile table](table-light-320.png), [dark mobile table](table-dark-320.png), [light desktop table](table-light-1280.png), [dark desktop table](table-dark-1280.png).

The structure fixture is available only with test routes enabled. Maturity remains experimental and accessibility status remains not reviewed. Human contrast and assistive technology review stays open for M2.8 and the completion gate.

## Next task

M2.6 checks every required contract against its implementation: states, defaults, compound variants, token references, and review status. Use GPT-6.1 Sol for that review.
