# SYX-073 — Alert

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/alert.tsx` adds `variant` `solid` (default, unchanged), `outline` and `text` across the four tones. The tone icon is decorative; the meaning stays in the text. Roles: warning and destructive use `alert`, info and success use `status`. It has no dismiss control.
- The component audit failed earlier because the `Tabs` contract was missing `typography.weight-medium`; that is fixed and the audit passes. The Alert contract lists its tokens.
- Unit: roles per tone; all twelve tone and variant combinations render their attributes, message text and hidden icon; default tone is info; title shown and no button.
- Browser: the destructive outline alert exposes role `alert` with `data-variant="outline"`, its title and message text; the text variant is a `status`; the page passes axe in light and dark.
- Not checked: outline and text contrast over a glass or image background; an Alert with a composed action.
