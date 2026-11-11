# SYX-072 Combobox review

Status: automated evidence only. No human visual review, screen-reader test, reduced-transparency check or touch-device test.

## What it is

`Combobox` (`components/ui/combobox.tsx`) is a React Aria `ComboBox`: one text input with `role="combobox"`, a popup listbox and a show-options button.

- The input holds the query. Typing filters the options (case-insensitive "contains"), opens the list and keeps focus in the field. ArrowDown opens the list and moves through it, Enter chooses the highlighted option, Escape closes the list.
- Only a listed option can be chosen (`allowsCustomValue` is off). Leaving the field with text that matches nothing restores the label of the last choice, so free text is never submitted. `name` submits the chosen option's `value`.
- Options may carry a `group`. Groups appear where their first option is and keep the caller's order. A disabled option stays listed but cannot be chosen.
- `loading` shows a spinner, a visible "Loading…" message in the list instead of "No results", and a polite status message. `filter={false}` lets the caller supply already-filtered options from a server search, with `onInputChange` reporting the query.
- Empty results show `emptyLabel` ("No results") as text. The list is never an empty popup.
- Controlled (`value`, `inputValue`) or uncontrolled (`defaultValue`, `defaultInputValue`). Defaults follow the plan: medium, empty query, closed, nothing chosen.
- `error` is text, the field description, and `aria-invalid`; the border also turns destructive. `helpText` is the description. `required`, `disabled`, `readOnly` and three sizes are supported.
- The show-options button is outside the tab order (the input is the one tab stop) and still has an accessible name. The selected option is marked by weight and a leading bar, not only colour.
- The popup uses the denser glass tint on glass surfaces, with solid fallbacks for no backdrop-filter, reduced transparency and forced colours.

## Evidence

- Unit (5 new): one labelled combobox input, closed, with the button out of the tab order; empty start and label of a chosen value; the submitted `name` carries the option value; help, error and `aria-invalid`; loading text, disabled, read-only, required, sizes; contract registration and defaults.
- Browser (2 new, `x3-controls`): typing filters and opens the list, grouped options, disabled option marked, ArrowDown plus Enter chooses, the selected value is reported, unmatched text shows "No results" and Tab restores the choice, Escape closes and keeps focus; loading status and list message, read-only ignores typing, disabled, error description, minimum height.
- The existing `x3-controls` axe sweep covers the closed field in light, dark, glass and clean.

## Not covered

- The open list is not in the axe sweep.
- Screen-reader output for the grouped list and the loading message.
- Touch and virtual-keyboard behaviour, and popup flipping near a viewport edge.
- A server-driven search (`filter={false}`) beyond the type-level contract.
- Right-to-left layout and reduced-transparency rendering in a browser.

## Notes

- The first browser run of the typing test was flaky: keystrokes sometimes landed before hydration. The test now retries until the field holds the text. This is a test timing issue, not a component bug, but it was not isolated further.
- While the list is open React Aria hides the page behind it from assistive technology, so the closed-state status region is the one asserted in the page.
