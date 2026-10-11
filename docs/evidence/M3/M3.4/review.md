# M3.4 scoped theme preview

Date: 2026-10-11

The Theme editor now shows a live form, buttons, cards, tabs, a dialog, and a table inside one draft ThemeScope. The sample form updates the sample name and table row; example actions update the Activity tab. These interactions stay local to the preview. Preview components read the existing token resolver and effective component defaults, including geometry, typography, and light/dark colors.

The dialog uses the existing React Aria wrapper and portal provider. Browser checks confirm that its nearest scope is `theme-editor-preview`, its tokens match the preview, and its Button inherits the draft default. Escape dismisses the dialog and returns focus to its trigger. Draft token/default edits and preview appearance changes leave the workspace variables and surrounding editor styling unchanged.

Color samples now use the preview's semantic CSS variables. They follow preview appearance even when the editor is changing the other color mode. The preview has two columns on desktop and one on narrow screens; table scrolling remains contained.

Verification: `npm run check` passed (type checking, registry generation, component audit, lint, 102 unit tests, production build). All 25 production browser tests passed, including two new Theme preview journeys. Checks cover a sample form submission, tab keyboard activation, draft isolation, live component defaults, dialog scope/focus, 320px and 1280px layouts in light and dark, and no serious or critical findings in the automated accessibility scan. Human screen-reader and WCAG review remain open under the project gates.

Screenshot: [Draft preview with a light workspace and dark preview](theme-preview.png).

M3.4 is complete. The full M3 gate remains open. Next: M3.5 Apply, Discard, Reset draft, unsaved state, session navigation, and refresh behavior. Use GPT-6.1 Sol at Medium for this state and persistence work.
