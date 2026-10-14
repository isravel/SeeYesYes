---
title: Context for AI agents
description: The exports, agent files, and AGENTS.md snippet, and what each contains.
order: 3
---

# Context for AI agents

[AI Context](/ai/context) generates the shared contract as readable Markdown and structured JSON. It runs locally and calls no model.

## Three modes

- **Overview** gives identity, principles, project guidance, appearance, and a short catalog of every component, so an agent can discover what exists.
- **Task** gives the components you pick plus the components, tokens, rules, and examples they depend on. Dependencies are included automatically, and components that are only mentioned appear as catalog entries.
- **Full** gives every component, token, rule, example, layout, and font.

## Labels and sizes

Each export shows its schema version, mode, scope, theme ID (and its base preset when custom), and size. Sizes are UTF-8 bytes. They are not token counts, and a smaller export is not automatically a better one.

## Applied theme and default theme

Exports from the screen use your applied theme. The build-time files [/llms.txt](/llms.txt) and [/llms-full.txt](/llms-full.txt) are generated without a browser, so they always use the default theme and say so at the top.

## The AGENTS.md snippet

The Agent instructions section produces a short snippet for your project's `AGENTS.md`, `CLAUDE.md`, or similar file. It lists the principles, project guidance, your applied theme, one line per component with its import, and every system rule. It is an index. For detailed work on specific components, copy a task export.

## Copy for LLM

Each component page and each documentation article has a Copy for LLM button. On a component page it copies the task export for that component under your applied theme. On an article it copies the article's Markdown with links written as site paths.
