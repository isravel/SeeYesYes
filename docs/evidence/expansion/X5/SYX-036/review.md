# SYX-036 Navbar review

Status: automated evidence only. No human visual review, real-device menu test, reduced-transparency check or screen-reader pass.

`Navbar` (`components/ui/navbar.tsx`) is one `header` holding one named `nav`, built from `Link` and `MenuToggle`.

- **Landmarks and destination.** One named navigation; the link for `currentHref` gets `aria-current="page"` and a color and weight change. Empty groups are skipped. External links open in a new tab and say so.
- **Menu.** Below 761px the links and actions sit behind a `MenuToggle` that starts closed (`defaultMenuOpen` opts in). Escape closes it and returns focus to the button; following a link closes it. From 761px the toggle is hidden and the links are always visible.
- **Scroll-aware surface.** Unscrolled it draws nothing. After 8px of scroll it gains a soft edge, and under the glass surface a blurred tint. The scroll state is read through an external-store subscription, so the server and first client render agree.
- **Fallbacks.** An open menu uses an opaque surface. No backdrop filter, reduced transparency and forced colors all fall back to the opaque surface; the current link keeps an outline in forced colors.
- **Content.** Brand, links and actions are all supplied.

## Evidence

- Unit: header and one nav, one current link, empty groups skipped, external link attributes, closed by default, sticky default.
- Browser: see the `x5-sections` Navbar tests (navigation, current page, menu open and close, Escape and focus return, 320px) and the axe sweep.

## Not covered

The tint over busy content in a real browser, reduced-transparency rendering, touch use, screen readers and human review.
