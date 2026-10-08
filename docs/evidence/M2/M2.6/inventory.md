# Component review inventory

Reviewed 2026-10-08. The source audit checks documented props, defaults, direct CSS tokens, styled compounds, and CSS states. Native and semantic states were checked against the component source.

| Component | Relevant states | Theme-editable defaults | Styled compounds |
| --- | --- | --- | --- |
| Button | default, hover, focus-visible, pressed, disabled, loading | variant: primary, secondary, ghost; size: small, medium, large | variant=ghost, size=small |
| Spinner | default, loading, reduced-motion | size: small, medium, large | None |
| Link | default, hover, focus-visible | variant: default, subtle | None |
| Card | default | variant: default, outlined | None |
| Badge | default | None | None |
| Separator | default, decorative, structural | None | None |
| Avatar | default, image, fallback | size: small, medium, large | None |
| Alert | default | None | None |
| Progress | default, determinate, indeterminate | None | None |
| Skeleton | default, loading, reduced-motion | None | None |
| Input | default, focus-visible, disabled, read-only, invalid, required | size: small, medium, large | None |
| Textarea | default, focus-visible, disabled, read-only, invalid, required | size: small, medium, large | None |
| Select | default, focus-visible, disabled, invalid, required | size: small, medium, large | None |
| Checkbox | default, unchecked, checked, focus-visible, disabled, invalid, required | size: small, medium, large | None |
| RadioGroup | default, unselected, selected, focus-visible, disabled, invalid, required, help | None | None |
| Switch | default, off, on, focus-visible, disabled, reduced-motion | size: small, medium, large | None |
| Label | default, required | None | None |
| FormField | default, help, error, required | None | None |
| Dialog | closed, open, focus-visible, disabled | size: small, medium, large | None |
| DropdownMenu | closed, open, hovered, focused, focus-visible, disabled, empty | None | None |
| Tabs | default, selected, hovered, focus-visible, disabled | None | None |
| Tooltip | closed, open, hover, focus-visible, disabled | None | None |
| Table | default, empty, overflow, focus-visible | None | None |
| Navigation | desktop, mobile, open, closed, current, hover, focus-visible | None | None |

All 24 components remain experimental and accessibility status remains not reviewed. Theme defaults stay limited to the schema’s variant and size keys. Tone, orientation, activation, and shape remain per-instance choices. Destructive Button is excluded from theme defaults because it changes the meaning of every unmarked action.

CSS token references cover each component’s direct stylesheet. Child components own their own references and appear as composition dependencies. Base selectors supply the medium/default styles when no explicit selector is needed. State selectors combined with one variant, such as a checked small Switch, do not create a compound variant. Button’s small ghost rule is the only selector combining two variant keys.
