# SYX-014 — Search input

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/search-input.tsx` wraps `Input` as a native `type="search"` field with a decorative icon. `label` is required and is the accessible name. The browser's own clear control is hidden so there is only one.
- Controlled with `value`, or uncontrolled with `defaultValue` (empty by default). `onChange` receives the string; `onClear` runs after a clear.
- The clear button exists only while the field has text and is neither disabled nor read-only. Clicking it empties the field and returns focus to it. Escape does the same for a populated field and stops propagation, so a surrounding dialog stays open; on an empty field Escape is left to the dialog.
- `searching` sets `aria-busy`, shows a small spinner and writes `searchingLabel` into a polite status region. The field stays editable. The caller runs the search.
- Sizes small, medium (default), large come from Input. Disabled, read-only and invalid pass through to Input.
- Unit: a labelled search input with a hidden icon and no clear button while empty; the clear button shows for controlled and uncontrolled text; it is absent when disabled or read-only; searching is reported in text.
- Browser: typing shows the clear button; click and Escape both clear and return focus; the button is a tab stop with a solid focus ring; the searching field is `aria-busy`, keeps its value and has the status text.
- Not checked: Escape inside an open Dialog in a real browser, the no-results and error copy (the caller's), large size in the browser, and screen-reader output.
