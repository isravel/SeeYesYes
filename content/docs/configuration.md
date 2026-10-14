---
title: Theme configuration
description: How draft, applied, and default themes work, and what saving does.
order: 2
---

# Theme configuration

You change the theme in the [Theme editor](/system/theme). Three configurations exist at once.

## Default, applied, and draft

- The **default** is the bundled preset.
- The **applied** theme is what the workspace, the Tokens screen, accessibility checks, and AI exports use.
- The **draft** is what you are editing. It affects only the preview in the editor until you apply it.

## Apply, Discard, and Reset

**Apply to workspace** validates the draft and replaces the applied theme. It never changes the appearance preference. **Discard changes** restores the draft from the applied theme. **Reset draft** loads the default preset into the draft; you still have to apply it. An unsaved indicator shows whenever the draft differs from the applied theme.

## Appearance is separate

Light, dark, or follow-system is a workspace preference chosen with the appearance selector. It is not part of the theme draft, so changing it does not touch your draft, and applying a draft does not change it.

## Saving and two tabs

Applied settings are stored in your browser. Saves go through one writer that takes a browser lock, so two tabs cannot overwrite each other. If another tab changed the theme while you were editing, applying your draft is refused with a message, your draft is kept, and **Discard changes** loads the latest theme. If the browser blocks storage or locks, your changes still work but stay in that tab and reset on refresh.

## Contrast warnings

The editor checks the required text, focus, and control-border pairs in both modes. A failing theme can still be applied, with a visible warning, and it is not marked as verified. This is a limited local calculation, not an accessibility audit.

## The Playground

The [Playground](/playground) lets you try settings and components together. Its settings are session-only and never change your applied theme or draft.
