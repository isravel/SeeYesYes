# SYX-016 — Segmented

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/segmented.tsx` is a `radiogroup` of native radios. Each radio covers its segment, so the whole segment is the hit area. Arrow keys, a single tab stop and form submission come from the browser. There is no `tablist` or `tabpanel` semantics; the contract says to use Tabs when each choice owns a panel.
- Controlled with `value`, or uncontrolled with `defaultValue`. A shared `name` is generated when omitted. Options may have an icon, which is hidden from assistive technology next to the visible label, and may be disabled individually. `disabled` disables all.
- The selected segment has a filled primary background and medium weight, and uses `Highlight` colors in forced colors. Hover applies only to unselected, enabled segments.
- Unit: a named radio group of native radios sharing one name; the default and controlled selections; one or all options disabled; generated names; every size.
- Browser: the default is checked; ArrowRight selects and focuses the next choice and updates the caller; the disabled choice is skipped and selection wraps; the focus ring on the segment is solid; selected and unselected fills differ; in forced colors the fills still differ.
- Not checked: Home and End, an icon-only layout, a long list wrapping on a narrow viewport beyond the 320px overflow check, and screen-reader output.
