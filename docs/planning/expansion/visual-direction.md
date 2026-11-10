# Visual direction — translucent glass

Approved planning direction: 2026-11-09. Implementation remains pending. This replaces the earlier expansion direction that treated glass as optional decoration.

## Required appearance

SeeYesYes should feel modern, layered and translucent. Make glass the planned default presentation for new expansion previews, templates and the refreshed workspace. Use the current semantic colors, typography, density, radius and motion system. No outside brand identity or new font family is implied.

- Place softly tinted, translucent panels over a restrained layered background. Use backdrop blur, fine edge highlights and subtle shadows to separate planes. Avoid a page made only of opaque flat cards.
- Give navigation, cards, toolbars, dialogs, menus, popovers, drawers and toasts consistent glass surface roles. Use lighter treatment for inset controls and denser treatment for floating overlays.
- Keep text, icons, data and primary actions crisp. Do not lower the opacity of an entire component or blur its children. A readable solid primary action and opaque content region are valid parts of a glass composition.
- Support light and dark intentionally. Light mode needs visible tint and edges; dark mode needs clear separation between planes. Do not achieve the effect by washing out labels or placing vivid gradients behind every paragraph.
- Avoid blur on every nested child. Dense tables, code, charts and form content can use a more opaque backing inside a glass container. Shadows, borders and spacing should communicate depth even when blur is unavailable.

## Theme and compatibility

Extend the existing effects.surface setting with a glass treatment during X1. Keep clean and subtle-depth values valid for existing saved themes and consumers. Resolve tint/opacity, blur, border highlight, elevation and scrim through the existing registry and token resolver; do not introduce a second token store or component-specific hardcoded glass palettes.

Plan the glass default for fresh expansion/workspace defaults only. Saved choices stay explicit; importing a new package must not silently restyle Naazhi. Apply any Naazhi visual change through its own adapter and versioned consumer verification. Validate settings, exports, bootstrap allowlists/cache versions and migration behavior when adding token value forms. Existing invalid-storage and cross-tab safeguards remain required.

## Accessibility, fallback and performance

- Check text, focus and control contrast against the composited result over representative light, dark and busy backgrounds, including nested panels and overlays. A contrast calculation against the tint alone is insufficient. Use the existing contrast thresholds and record the backgrounds tested.
- Provide an opaque or sufficiently dense tint fallback for unavailable backdrop filtering, forced colors and reduced-transparency preferences where supported. Required content and states remain understandable with blur disabled. Reduced motion also suppresses animated glow, parallax and shimmer; it is not a substitute for reduced transparency.
- Limit large overlapping blur regions. Keep blur strength static during scrolling and transitions where possible; animate cheaper properties only when needed. Review stacking contexts, clipping, sticky regions and portal containers so the intended backdrop is sampled.
- Measure representative mobile and desktop scrolling, overlay opening and production performance against the existing acceptance budgets. A static screenshot cannot establish acceptable blur performance.

## Visual gate

Before expanding styling across the catalog, review a representative shell containing a Card, toolbar, form controls and an open Dialog in light and dark. Record the chosen composition and token values, then compare later components with it. Follow the Product Design visual-selection workflow if generating new visual options; this planning change itself does not select an unseen mockup.

Each surface milestone verifies normal glass rendering, nested overlays, opaque/no-blur fallback, keyboard focus, 320px layout, actual zoom and reduced preferences as applicable. Automated, agent visual and human results remain separate in tracking.
