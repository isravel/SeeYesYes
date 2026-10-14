---
title: The shared contract
description: What SeeYesYes is and how one registry serves people and AI agents.
order: 1
---

# The shared contract

SeeYesYes is a design system that humans and AI agents can both understand. It keeps its decisions in one place, the **registry**, and everything else reads from it.

## One registry, many views

The registry holds the tokens, component contracts, rules, and examples. The screens you see (Components, Tokens, Rules, and the rest) and the exports an agent reads are all generated from that same data. When you change an applied theme, the resolved values change everywhere at once.

## What a component contract says

Each component contract records its purpose, its public import, its variants and states, its props, where it must not be used, how it composes with other components, its accessibility requirements, and guidance for AI agents. Open any component on the [Components](/components) screen to read its contract.

## Metadata-complete is not reviewed

A component is **metadata-complete** when its contract and every reference in it are filled in. That does not mean a person has reviewed its accessibility, and it does not mean an agent was tested with it. The system reports those separately: review evidence is on the [Accessibility](/accessibility) screen, and today no component has had a human review.

## Demo results are not measurements

The sample validation reports are fixtures. They show what findings look like and are labeled **Demo results** wherever they appear. They never describe your project, and nothing in this prototype scans or edits a project.

## Where to go next

- Try the system with [Getting started](/getting-started).
- Read how themes work in [Theme configuration](/docs/configuration).
- Learn what the exports contain in [Context for AI agents](/docs/context).
