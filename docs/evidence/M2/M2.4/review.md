# M2.4 overlays and tabs

Reviewed 2026-10-08. M2.4 complete. The M2 completion gate remains open.

## What changed

Added Dialog, DropdownMenu, Tabs, and Tooltip with narrow typed APIs, React Aria behavior, and CSS Modules. Dialogs have visible titles, contain focus, and restore focus to their triggers. Outside dismissal defaults to false; required tasks can disable Escape. Menus skip disabled actions and restore focus after selection or Escape. Tabs support automatic and manual activation. Tooltips open on hover and keyboard focus, dismiss with Escape, and contain supplemental text.

The private trigger adapter shares Button styles and scoped defaults. Tooltip opening waits for the initial focus scroll to finish, so tabbing to a button below the viewport does not immediately dismiss its description. Pending opening is cancelled on dismissal or unmount.

Overlays portal into the nearest ThemeScope. Nested light/dark themes, density, and component defaults stay local. Each component has a live preview, recommended example, and registry contract. The registry now contains 22 components and 30 examples. React Aria data-state selectors stay at the integration boundary.

## Evidence

- [Check log](checks.txt): generation, type checking, lint, 86 unit tests, and production build pass.
- [Browser log](browser.txt): 12 checks cover focus containment/restoration, Escape, required dialogs, menu navigation/actions, disabled items, tab activation and panel relationships, tooltip hover/focus, normal keyboard navigation, nested scope inheritance, and viewport bounds.
- Automated axe checks report no serious or critical findings in the tested page and open dialog.
- [Light mobile dialog](dialog-light-320.png), [dark mobile dialog](dialog-dark-320.png), [light desktop dialog](dialog-light-1280.png), and [dark desktop dialog](dialog-dark-1280.png).
- [Light menu](menu-light.png), [dark menu](menu-dark.png), [light tooltip](tooltip-light.png), and [dark tooltip](tooltip-dark.png).

The overlay fixture is available only when test routes are enabled. Contracts remain experimental and accessibility status remains not reviewed. Human contrast and assistive technology review remains open for M2.8 and the completion gate.

## Next task

M2.5 adds Table and Navigation, including the mobile drawer, skip link, active destination, headings, and breadcrumbs. GPT-5.6 Luna at Medium can follow the established patterns.
