---
title: Accessibility evidence
description: What has been checked automatically, what has not, and how results are labeled.
order: 4
---

# Accessibility evidence

The [Accessibility](/accessibility) screen keeps three things apart, and so does this article.

## Review evidence

Review evidence is a human review of a component recorded in its contract. No component has one yet, so every component is labeled **Not reviewed**. A component is only counted as reviewed when its contract says so and links the evidence.

## Measured contrast

Contrast is calculated from your applied theme for the required text, focus, and control-border pairs in light and dark. It is a limited local calculation, not a complete audit. Out-of-gamut colors are reduced in chroma before measuring.

## Automated checks

The repository runs automated checks: every interactive component is reached by Tab, has an accessible name, and shows a visible focus indicator, and many pages are scanned for serious accessibility problems at narrow and wide widths. These checks find problems. They do not prove conformance, and they do not replace testing with a screen reader and a keyboard by a person.

## Sample validation results

The sample validation reports are demo fixtures labeled **Demo results**. They show how findings are presented. They are not measurements of this system.

## What is still open

Manual keyboard and screen-reader testing and a review against the applicable WCAG criteria need a human tester. Until that is recorded, nothing here claims that any component or screen conforms.
