# SYX-060 — Accordion

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/accordion.tsx` stacks `Disclosure`s, each with its trigger in a heading (level 3 by default, set with `headingLevel`) and its content in a region named by that heading.
- `single` keeps one section open (extra default values are trimmed to the first); `collapsible={false}` keeps the chosen section open. `multiple` allows any number and reports ids in item order. Controlled with `value`, or uncontrolled with `defaultValue`; unknown ids are ignored.
- Unit: all collapsed by default, heading levels, single trimming, controlled over default, unknown ids, disabled item, empty list.
- Browser: single mode swaps sections; a disabled item cannot open; multiple mode reports `m1,m2` in order; a non-collapsible accordion cannot close its open section but can switch.
- Not built: arrow-key movement between triggers (Tab reaches each one; the contract says so). Not checked: screen-reader output and a long list of sections.
