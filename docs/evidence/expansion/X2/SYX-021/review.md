# SYX-021 — Dropdown menu

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

## Implementation

- `components/ui/dropdown-menu.tsx` still extends the React Aria menu. The popover takes the scope's surface as `data-surface`, so glass applies only under a glass theme.
- `items` now accepts four entry kinds. Existing action-item callers are unchanged: `type` is optional and the `DropdownMenuItem` name is kept.
  - **Action item:** `id`, `label`, optional `disabled` and `destructive`. Calls `onAction`.
  - **Link item:** adds `href` and optional `external`. It renders a real anchor, so native navigation and open-in-new-tab work. It does not call `onAction`. An external link gets `target="_blank"`, `rel="noopener noreferrer"` and a visible "(opens in a new tab)" hint.
  - **Group:** `type: "group"`, `label`, `items`. It renders a named `group` with a heading.
  - **Separator:** `type: "separator"`. It is not focusable.
- `normalizeMenuItems` drops empty groups and any leading, trailing or repeated separator, so the menu never shows a dangling divider.
- An empty list shows "No actions available."
- Styling uses existing tokens only. The contract lists the new parts and the `typography.caption` and `typography.weight-medium` tokens.

## Checks

- Unit: the full suite passes (542). The component audit passes for all 32 components.
- Browser, in the scoped controls page, 6 new tests plus the earlier glass test:
  - **Structure:** groups are named; the empty group is not rendered; two separators remain and the trailing one is dropped; the disabled item has `aria-disabled`; separators have no tab stop.
  - **Keyboard:** ArrowDown skips the disabled item, headings and separators. Home and End reach the first and last items.
  - **Actions and links:** an action item reports its id. Link items are anchors with the right `href`. The external one has `target` and `rel`; the internal one has neither. Escape reports no action.
  - **Navigation:** Enter on a link item navigates to `/docs`.
  - **Empty state:** the message shows in the named menu and exposes no link or action. Escape closes it and focus returns to the trigger.
  - **320px:** the popover stays inside the viewport, a very long label wraps, and the page does not scroll sideways. At 240px height the popover stays on screen and scrolls.
  - **Accessibility:** axe finds no serious or critical violations in the open menu.
- Existing `overlays.spec.ts` and `keyboard-matrix.spec.ts` still pass: disabled items are skipped, actions run and focus returns on selection.
- 55 focused browser tests pass (X2 controls, keyboard matrix, component detail, review matrix, overlays, glass theme, playground). `next build` passes.

## Not checked

- Actual `prefers-reduced-transparency` rendering. The CSS fallback is inspected only. It needs a browser and OS that support the preference.
- Human visual review of the open menu over a glass backdrop (SYX-001 gate).
- Screen-reader output. Roles and names are checked through the accessibility tree only.
- Selection of a disabled link item by pointer is not checked separately from the disabled action item.
- Screenshots of the menu example are not saved. Review it live (see below).

## Catalog example

The Overview preview, the component page example and code, and the Playground `DropdownMenu` demo now share one menu from `components/examples/menu-items.ts`:

- **File** group: Save preview, Duplicate preview, and a disabled Archive preview.
- Separator.
- **Help** group: Accessibility guide (in-app link to `/docs/accessibility`) and React Aria menu guide (external link, new tab).
- Separator.
- **Delete preview**, a destructive action. In the example it only shows a status line saying nothing is deleted; confirmation stays with the caller.

The Playground's code panel shows the full `items` list. Its `empty` state still shows the empty message. In the preview, links navigate and actions update a status line.

`tests/browser/menu-example.spec.ts` (4 tests) checks the groups, separators, disabled item, link `href`, external `target` and `rel`, destructive tone, axe in the open menu, action status and focus return, link navigation, the Playground scope and the Playground code. The `menu-actions` example type-checks against the real component.

To review: open `/` and scroll to the Dialog and Menu previews, or open `/playground` and choose `DropdownMenu`. Try it under the glass theme at `/system/theme`.

## Decision history

2026-11-10: links, named groups and separators stayed in scope, to be built within the existing React Aria menu without breaking action-item callers. This revision implements them and adds the checks above.
