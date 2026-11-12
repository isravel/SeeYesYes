# SYX-044 Carousel review

Status: automated evidence only. No human visual review, screen-reader test, real touch-device test or reduced-transparency check.

`Carousel` (`components/ui/carousel.tsx`) is a named region holding a sideways-scrolling row of slides that snap into place, with Previous and Next buttons and a status line ("Slide 2 of 4").

## Platform and tool evaluation (dependency decision)

The task required evaluating the platform and installed tools before choosing a dependency.

- **Installed tools:** `package.json` has no carousel, slider or gesture library (no Embla, Swiper, Splide, Keen or similar in `node_modules`). `react-aria-components` has no carousel; it offers no scrolling or snapping primitive that would help.
- **Platform:** CSS scroll snap (`scroll-snap-type`, `scroll-snap-align`) gives touch swipe with momentum, trackpad and scrollbar scrolling, native keyboard scrolling on a focused row, and `scroll-behavior` for smooth or instant movement under `prefers-reduced-motion`. `scrollTo` drives the buttons and autoplay.
- **Decision:** use native scroll-snap. **No dependency added.** A library would add weight, replace native touch scrolling with a scripted drag handler and be a second place to maintain reduced-motion and focus behavior. Nothing the task asks for falls outside what the platform does.
- **Consumer compatibility:** with no new package, a consumer needs nothing beyond the files they already copy (`carousel.tsx`, `Carousel.module.css`, `Button`).
- **Revisit if:** looping, free-drag with inertia, multiple slides per view with per-breakpoint rules, or vertical carousels become requirements.

## Behavior

- **Native scrolling.** The row is `overflow-x: auto` with `scroll-snap-type: x mandatory`. It is a keyboard stop (`tabIndex=0`, named "&lt;label&gt; slides") so the arrow keys scroll it.
- **Position follows the row.** The status, the disabled state of the buttons and the edge fade come from the real scroll position, so a swipe, the scrollbar, the arrow keys, the buttons and focus moving into an off-screen control all agree.
- **No loop.** Previous is disabled on the first slide and Next on the last. When the button holding focus becomes disabled, focus passes to the other button instead of being lost.
- **Reading order.** Every slide stays in the document in order and none is `inert` or `aria-hidden`. Each is labelled "N of M".
- **Autoplay** is off by default. When on, the interval is never under 3 seconds (default 3000). It pauses on mouse hover, on focus within and while a finger is down, has a visible Pause autoplay / Resume autoplay button, stops on the last slide, and never runs under reduced motion. The status stops announcing while it runs.
- **Edge fade** (opt-in) masks an edge only where more slides lie beyond it, steps aside while the row has keyboard focus so the ring is not clipped, and is removed in forced colors.
- **Peek** (opt-in) narrows slides so the next one shows.
- **One slide** shows content only, with no buttons or status. **No slides** renders nothing.

## Evidence

- Unit: region and roles, slide order and labels, nothing hidden, focusable row, fixed button names, Previous disabled at the start, pause button only with autoplay, no `data-cycling` before hydration, fade and peek opt-in, one and zero slides, registry example, defaults (autoplay false, interval 3000, edge fade false), focus-visible rule.
- Browser (4 new in `x4-effects`, all with a production build): native snap container; status, buttons and scroll agree after a button, a script scroll and an arrow key; no loop and focus handed to Previous; a focused control in a far slide scrolls it into view; tab order and focus ring; autoplay advance, pause button, hover, touch, stop at the last slide, reduced motion; edge fade at start, end, focused and forced colors; one-slide and empty cases. The shared axe test and the 320px test cover the new fixtures.
- Catalog: detail route, keyboard matrix (the row is a named group stop with a focus ring) and every variant demo.

## Not covered

- Real touch swipe and momentum on a device (the touch pause is tested with a dispatched event).
- Screen-reader reading of the status line and slide labels.
- Right-to-left layouts. Slides are laid out left to right and the contract says so.
- Long autoplay runs and very wide or very tall slides.
