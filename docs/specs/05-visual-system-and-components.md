# Visual system and components

## Visual direction

Aim for calm, clear, fast, and human. Use strong typography, generous space, restrained depth, and purposeful hierarchy. Apple, Linear, Arc, and Airbnb are references for craft, not identities to copy.

Avoid generic dashboard filler, default framework styling, noisy gradients, excessive rounded cards, unnecessary borders, heavy glass, emoji icons, Lorem Ipsum, and placeholder interactions.

Use a readable sans-serif for interface and documentation text. Use monospace for code, tokens, and configuration. Choose a consistent type scale and spacing scale before building screens.

## Foundations

- Semantic colors use OKLCH and separate light/dark maps.
- Typography includes body, labels, headings, and code styles.
- Spacing has one named scale; avoid repeated arbitrary values.
- Radius supports sharp, soft, and curvy personalities.
- Density supports compact, comfortable, and spacious. It changes control padding, gaps, and row heights consistently without shrinking text or making targets inaccessible.
- Shadows use none, soft, and defined scales.
- Required surface effects are clean and subtle depth. See [Theme rules](02-architecture-and-theme.md#theme-rules) for how they combine with shadows.
- Motion uses none or subtle; reduced-motion preference overrides it.
- Fonts come from the registry allowlist and are self-hosted.

Components should read semantic variables. Editing a top-level scale must propagate without component-specific overrides. Theme scope must remain isolated in preview and playground containers, including overlay portals. Components read defaults and the portal container from the nearest `ThemeScope`; see [Theme scopes](02-architecture-and-theme.md#theme-scopes).

## OOCSS principles

### Separate structure from appearance

Keep shared layout, alignment, and control geometry in the component's base styles. Variants change semantic appearance through tokens and component-local variables. Size and density change geometry through shared scales. Do not copy the full base styles for every visual variant.

This separation can live in one CSS Module. It does not require separate files, a class for every CSS property, or extra DOM wrappers.

```css
/* Button.module.css — every variable here maps to a token in the Button contract's tokenIds. */
.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sys-spacing-inline);
  padding: var(--sys-spacing-control-block) var(--sys-spacing-control-inline);
  border-radius: var(--sys-radius-control);
  background: var(--button-background, var(--sys-color-primary));
  color: var(--button-foreground, var(--sys-color-on-primary));
}

.root[data-variant="secondary"] {
  --button-background: var(--sys-color-secondary);
  --button-foreground: var(--sys-color-on-secondary);
}

.root[data-variant="ghost"] {
  --button-background: transparent;
  --button-foreground: var(--sys-color-foreground);
}

.root[data-variant="ghost"]:hover {
  --button-background: var(--sys-color-muted);
}

.root[data-variant="destructive"] {
  --button-background: var(--sys-color-destructive);
  --button-foreground: var(--sys-color-on-destructive);
}
```

When a component's CSS uses a `--sys-` variable, its contract lists the matching token ID. Check this during the M2 style review.

Style a `styled` compound variant with one combined attribute selector, and only override the properties that differ:

```css
.root[data-variant="ghost"][data-size="small"] {
  padding-inline: var(--sys-spacing-inline);
}
```

Every combined selector in a component's CSS needs a matching `compoundVariants` entry, and the reverse. A `disallowed` combination needs no CSS; the component's types or a development warning should prevent it.

The public API stays semantic: `<Button variant="secondary">Cancel</Button>`. Component-local variables are internal aliases of system tokens. Do not create a second token registry for them. Required focus, disabled, loading, and other state styles must still be implemented; this example only shows style organization.

### Keep components independent of containers

A Button's variant and state behavior must work in a Card, Dialog, Toolbar, or standalone preview without selectors such as `.sidebar .card button`.

The parent owns placement, outer spacing, and available space. The child owns its internal layout, appearance, semantics, and interaction. Use a documented prop when a component needs a supported mode such as full width. Avoid making it depend on a particular parent class or DOM ancestry.

Theme inheritance and component-owned responsive/container-query rules are allowed. A component can respond to available space or inherited tokens without depending on the identity of its parent. Overlay portals must receive the intended theme scope explicitly.

### Reuse composition without a class assembly system

Extract shared layout primitives when repeated layouts justify them. Reuse spacing scales and tokens before introducing CSS mixins or class composition. Do not force visually similar components to share semantics or behavior.

Consumers use components, variants, and layout primitives. They should not have to assemble low-level appearance classes for ordinary usage. Keep `className` available for root placement where appropriate; document that reaching into private child classes is unsupported.

## Naming and style ownership

| Item | Convention | Example |
| --- | --- | --- |
| React component | PascalCase | `Button`, `FormField` |
| Component stylesheet | Component name + `.module.css` | `Button.module.css` |
| Local class | Short camelCase within its module | `.root`, `.label`, `.loadingIndicator` |
| Variant attribute | Meaningful kebab-case value | `data-variant="secondary"` |
| Token ID | Dot-separated stable ID, kebab-case segments | `color.on-primary`, `radius.control` |
| Public CSS variable | Derived from token ID: `--sys-` plus ID with dots as hyphens | `--sys-color-on-primary`, `--sys-radius-control` |
| Private component variable | Component prefix plus kebab-case | `--button-background` |

Use native selectors and actual accessibility state where applicable: `:disabled`, `:focus-visible`, and `[aria-busy="true"]`. Use data attributes for visual variants or states without an equivalent native attribute. Never add ARIA solely to style an element.

CSS Modules provide class isolation, so full BEM names are not required. Public tokens and component props are the supported customization surface. Internal class names and component variables may change without becoming contract fields.

Keep selectors shallow and component-owned. Avoid IDs, cross-module child overrides, parent-specific component selectors, and routine `!important`. Document any necessary third-party override at its integration boundary.

## Required component inventory

| Group | Components |
| --- | --- |
| Actions/navigation | Button, Link, Navigation, Tabs, Dropdown Menu |
| Forms | Input, Textarea, Select, Checkbox, Radio Group, Switch, Label, Form Field |
| Overlays | Dialog, Tooltip |
| Feedback | Alert, Badge, Progress, Spinner, Skeleton |
| Structure/data | Card, Table, Avatar, Separator |

Components with `interactive: true` are Button, Link, Navigation, Tabs, Dropdown Menu, Dialog, Tooltip (dismissible with Escape), Input, Textarea, Select, Checkbox, Radio Group, and Switch. The feedback patterns that embed an action, retry, link, or copy control (Empty State, Error State, Not Found, and Copy Button) are also `interactive: true`. All others are `interactive: false`, including Label, Form Field, Card, Table, Avatar, Separator, Alert, Badge, Progress, Spinner, and Skeleton. A component that later gains a focusable part, such as a dismissible Alert, changes to `true` and gains keyboard guidance and the focus rule.

Link is explicitly required because Button guidance depends on a semantic navigation alternative. Use Radio Group to describe grouped radio behavior. Dropdown and Dropdown Menu refer to one component family, not two implementations.

Table is a semantic basic table. Advanced sorting, pagination, column pinning, and virtualization are optional product work.

## Shared API rules

Use typed props, predictable variant and size names, native element attributes, and refs where needed. Controlled form components need clear `value`/`checked` and change handling. Support native form behavior and associated labels.

Button defaults to `type="button"`. Loading preserves an accessible label and prevents repeated activation. Link renders an anchor with a destination. Use appropriate semantics instead of making arbitrary elements clickable.

Form Field connects Label, help text, errors, and control IDs. Errors use text as well as visual styling. Disabled and read-only behavior must remain distinct.

Every component has a contract, relevant states, a working preview, usage examples, and accessibility guidance. Do not force irrelevant states onto every component. Contract maturity and review status describe actual progress.

## Complex interactions

Dialog, Dropdown Menu, Tabs, and Tooltip are built on React Aria Components; see [Complex controls with React Aria](02-architecture-and-theme.md#complex-controls-with-react-aria). The behaviors below still need checking in SeeYesYes's own previews, because wrapping and styling can break them.

- Dialog: named dialog, modal focus containment, Escape dismissal, and focus return to its trigger. Do not dismiss a required action silently.
- Dropdown Menu: named trigger, keyboard navigation, Escape dismissal, and focus restoration.
- Tabs: tab/tabpanel relationships and predictable arrow-key navigation.
- Tooltip: available on focus as well as hover; dismissible; never the only source of essential instructions.
- Select: prefer native select unless a concrete requirement needs a custom version. Custom behavior needs equivalent keyboard and screen-reader support.
- Radio Group: shared name, group label, checked state, and native arrow-key behavior.
- Navigation: landmarks, current-page state, and accessible mobile drawer.
- Progress: accessible value or indeterminate status; Spinner/Skeleton must not create noisy repeated announcements.
- Avatar: useful alternative text when meaningful, decorative treatment when adjacent text already supplies identity.
- Table: caption or accessible name, header associations, and a contained scroll area for genuinely wide data.

## Motion and responsive layout

Use motion to explain state changes. Avoid animating every route or element. CSS transitions cover common hover, focus, panel, and theme changes; any added motion library needs a documented reason.

Design mobile first. Adapt navigation, editor panels, grids, code blocks, and tables rather than shrink desktop layouts. Page content must work from 320px upward. Reserve horizontal scrolling for code and wide tables within their own containers.

Each required component must work in both appearances and all density/radius settings. Light/dark styling uses semantic roles rather than color inversion.
