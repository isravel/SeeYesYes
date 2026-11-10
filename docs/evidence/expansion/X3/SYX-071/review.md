# SYX-071 InputOtp review

Status: automated evidence only. No human visual review, screen-reader test, real SMS autofill test or reduced-transparency check.

## What it is

`InputOtp` (`components/ui/input-otp.tsx`) is **one** native text input with the digit boxes drawn behind it. It is not a row of per-digit inputs.

- The input has `inputmode="numeric"`, `autocomplete="one-time-code"` and `pattern="[0-9]*"`, so mobile keyboards and SMS autofill target it. It is wrapped in `FormField`, so the label, help text and error are the field's name and description.
- The boxes are `aria-hidden`. Assistive technology reads one field with one value, one tab stop, and the native caret behavior for correction.
- Only digits are kept and the value is cut to `length` (default 6). A pasted code replaces the whole value; non-digits are dropped and extra digits are cut off.
- `masked` renders the input as `type="password"` and shows dots in the boxes. The value is still the digits.
- `onComplete` reports a full-length code once. Nothing is submitted automatically.
- Controlled (`value`) or uncontrolled (`defaultValue`). A controlled value is also reduced to digits and cut.
- States: empty, partial, complete, invalid (`error` text, `aria-invalid`, destructive box border), disabled, read-only. The active box is marked by a primary border plus an inset ring, and the whole group shows a 3px focus outline.
- Boxes shrink on a narrow screen but never below 1.5rem (24px).

## Evidence

- Unit (8 new): one input; numeric and one-time-code attributes; box count for default and custom length; partial, complete and over-long values; masking; help and error description and `aria-invalid`; disabled, read-only, required; sizes; contract defaults and registration.
- Browser (2 new, `x3-controls`): the field's accessible name and description, filtering of typed letters, Backspace, over-long typing cut to 6 with one completion report, the error appearing as text and in the description, a dispatched paste replacing the value, hidden boxes, a solid group outline on keyboard focus; masked type and dots, read-only ignoring typing, disabled, and box size of at least 24px.
- The existing `x3-controls` axe sweep (light, dark, glass, clean) covers the new field because it sits in the same fixture section.

## Not covered

- Real SMS or password-manager autofill (browsers only fill on a real device or a real prompt). The `autocomplete` attribute is verified, not the fill itself.
- Screen-reader output, including whether the hidden-box approach reads cleanly in each reader.
- A native paste from the OS clipboard. The test dispatches a synthetic paste event.
- Right-to-left layout and codes longer than about 8 digits at 320px.
- Whether the caret position forced to the end feels right when someone taps the middle of the boxes. It always edits the last digit, by design.
