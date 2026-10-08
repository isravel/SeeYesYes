# Product and scope

## Purpose

SeeYesYes helps developers and AI coding agents build from the same design decisions.

**Tagline:** A design system that humans and AI can understand.

**Core promise:** Define the system once. Let developers and AI build from it.

The name plays on “See + Yes + Yes” and CSS. The product reaches beyond styling: it connects intent, tokens, semantic components, usage rules, accessibility guidance, and validation.

It should evolve with native CSS. Its positioning is an executable design-system contract for humans and AI, rather than another general component library. Actual enforcement comes after Phase 1.

## Users and journeys

Developers need consistent interfaces without repeating low-level styling decisions. AI coding agents need to discover components, choose them correctly, reuse tokens, and preserve accessibility. Designers, maintainers, product teams, and contributors need to inspect and explain the same system.

The first use is across the creator's React/Next.js products. Public adoption and other framework adapters can follow.

**Configure once:** Open Theme, change a setting, and see several components update together. Apply the draft to the workspace. Inspect the resulting tokens and export the same configuration through AI Context.

**Build within the system:** Find a component, inspect its purpose and usage boundaries, try its states, and copy a working example. Inspect matching AI guidance and rules. Explore labeled sample violations and suggested fixes in Validation.

Phase 1 shows what an agent could consume. The product does not run an agent or prove that an agent follows the contract. A separate [agent evaluation](07-agent-evaluation.md), run outside the app, tests whether the context actually improves agent output.

## Required Phase 1 scope

- Thirteen views: Overview, Getting Started, Theme, Tokens, Components, Component Detail, Layouts, AI Context, Rules, Accessibility, Validation, Playground, and Documentation.
- One typed registry and deterministic JSON/Markdown context export in overview, task, and full modes. Task mode includes selected components and their referenced dependencies.
- Agent-readable delivery: generated `/llms.txt` and `/llms-full.txt`, a “Copy for LLM” action on Component Detail and Documentation pages, and an `AGENTS.md` snippet export.
- Token export in the [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/) (the W3C community group standard) so tokens work with tools such as Style Dictionary, Tokens Studio, and Figma. Export only; importing tokens is outside Phase 1.
- Theme controls for semantic colors, OKLCH palette, typography, radius, density, shadows, restrained effects, motion, component defaults, and light/dark settings.
- Light, dark, and system appearance; compact, comfortable, and spacious density; sharp, soft, and curvy radius.
- Clean and subtle-depth surface treatments. These are required system settings.
- The foundational component set in [Visual system and components](05-visual-system-and-components.md).
- Seven working layout examples composed from the foundational components.
- Search, filters, working previews, and copy/download actions where specified.
- Loading, empty, error, and retry behavior for data-driven views.
- Labeled demo accessibility/validation dashboards.
- Local browser persistence for applied settings (theme and appearance) only, with session-only fallback when storage or cross-tab write locking is unavailable.

## Optional after required work passes

- Glossy, blur, glass, and layered effects beyond the required clean/depth pair.
- Activity feeds, notification centers, advanced data tables, command interfaces, pricing cards, charts, and rich status surfaces.
- Shared-element motion and elaborate page transitions.
- Installable PWA behavior, service workers, and offline caching.

Density and the required effects controls are not optional. Optional components must not appear as implemented or verified in the required catalog.

## Outside Phase 1

Do not build backend services, databases, accounts, authentication, OAuth, payments, business workflows, external persistence, remote synchronization, GitHub integration, AI inference, external agent execution, real source analysis, or production validation services.

Package generation, npm publishing, framework adapters beyond React examples, and site deployment are also outside scope. The frontend must build for Vercel; deployment is separate work.

Next.js route handlers may serve in-memory demo fixtures. This mock transport is explicitly allowed, with no database or durable server writes.

## Future direction

Keep the serializable contract independent of React so package generation, validators, and adapters can consume it later. Treat emerging native CSS features as future options. Phase 1 must work without them.

### Planned for Phase 2: MCP server

MCP (Model Context Protocol) is how most design systems now serve AI coding agents. Phase 1 does not build an MCP server, but it must leave nothing in the way of one. The first Phase 2 item is a read-only MCP server that wraps the Phase 1 context functions:

| Tool | Returns | Phase 1 source |
| --- | --- | --- |
| `list_components` | Overview catalog | Overview projection |
| `get_component` | One contract with effective defaults | `ContextComponent` |
| `get_task_context` | Task context for one or more component IDs | Task projection and closure |
| `list_tokens` | Tokens, filterable by category and kind | Token resolver |
| `list_rules` | Rules, filterable by category and severity | Registry |
| `get_full_context` | Full context, only on explicit request | Full projection |

The server cannot read browser storage. It uses the default preset (`scope: "default-theme"`), or a `WorkspaceSettings` JSON file the user exports from AI Context and passes in (`scope: "applied-theme"`).

Phase 1 requirements that keep this possible:

- Context, closure, token-resolution, and serialization functions are pure, import no React or browser APIs, and run in Node. Tests run them in a Node environment.
- AI Context can download the applied `WorkspaceSettings` as JSON.
- Tool outputs reuse the existing context types. Do not design a separate MCP data model.
