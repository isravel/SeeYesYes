# X4 — Optional effects and media primitives

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Phase: B — Motion and media. Dependencies: X1–X2 and any X3 controls used; no dependency on all listing or template work.

- [x] **SYX-025 — Animated badge.** Provide an optional border-glint treatment using system accent/motion tokens and a static fallback.
  - 2026-11-11: Done with automated checks only; no human visual review. Border glint on a Badge; static by default, removed by reduced motion and forced colors. [Evidence](../../evidence/expansion/X4/SYX-025/review.md)
- [x] **SYX-026 — Logo.** Provide a reusable identity/wordmark slot and optional motion treatment for supplied assets; do not create or copy another brand identity.
  - 2026-11-12: Done with automated checks only; no human visual review. Slot for a supplied image or inline mark with a fixed name; falls back to text if the image fails; opt-in mark motion. No real identity asset was supplied, so only a neutral placeholder is used in the fixture and demo. [Evidence](../../evidence/expansion/X4/SYX-026/review.md)
- [x] **SYX-027 — Menu toggle.** Provide a named expanded/collapsed control with an optional bar-to-close transition and reduced-motion fallback.
  - 2026-11-11: Done with automated checks only; no human visual review. Native button, fixed name, `aria-expanded`; bars turn into a close mark, reduced motion swaps instantly. [Evidence](../../evidence/expansion/X4/SYX-027/review.md)
- [x] **SYX-028 — Shiny text.** Provide optional text shimmer with readable static text and guidance to use sparingly.
  - 2026-11-11: Done with automated checks only; no human visual review. Gradient text sweep that never changes `color`; plain under reduced motion and forced colors. [Evidence](../../evidence/expansion/X4/SYX-028/review.md)
- [x] **SYX-029 — Fancy arrow.** Render a supplied decorative arrow asset with configurable placement and an accessible text alternative only when meaningful.
  - 2026-11-12: Done with automated checks only; no human visual review. Decorative by default (hidden, unfocusable, ignores the pointer); named only with `alt`; inline or corner placement. No real arrow asset was supplied; a neutral placeholder is used in the fixture and demo. [Evidence](../../evidence/expansion/X4/SYX-029/review.md)
- [x] **SYX-030 — Tilt card.** Provide opt-in pointer tilt and layer depth; preserve normal reading and activation on touch and keyboard.
  - 2026-11-12: Done with automated checks only; no human visual review. Opt-in mouse and pen tilt with layer depth; ignores touch and focus; no fake button semantics; removed by reduced motion. [Evidence](../../evidence/expansion/X4/SYX-030/review.md)
- [x] **SYX-031 — Card swap.** Provide an optional stacked-card transition with stable reading order, accessible controls and a static reduced-motion alternative.
  - 2026-11-12: Done with automated checks only; no human visual review. Stack with stable reading order (back cards `inert`), Previous and Next, status line; opt-in autoplay with hover and focus pause, a visible pause button and a 3 second minimum; static under reduced motion. [Evidence](../../evidence/expansion/X4/SYX-031/review.md)
- [x] **SYX-033 — Media frame.** Provide responsive media sizing, aspect ratios, optional hover treatment, captions and failure fallback.
  - 2026-11-12: Done with automated checks only; no human visual review. Figure with reserved ratio, cover or contain, caption, text fallback on failure, opt-in hover and vignette removed by reduced motion. [Evidence](../../evidence/expansion/X4/SYX-033/review.md)
- [x] **SYX-034 — Rotating word.** Reserve stable headline space, keep an understandable accessible phrase and support static/reduced-motion content.
  - 2026-11-11: Done with automated checks only; no human visual review. Stable width, one hidden phrase read, opt-in cycling that pauses on hover, `paused` and reduced motion. [Evidence](../../evidence/expansion/X4/SYX-034/review.md)
- [x] **SYX-044 — Carousel.** Evaluate the platform and installed tools before selecting a dependency. Support optional 3-second autoplay, hover/focus pause, visible pause/resume, manual navigation, touch and reduced motion.
  - 2026-11-12: Done with automated checks only; no human visual review. Native CSS scroll-snap row with Previous and Next, a status that follows the real scroll position, no loop, opt-in autoplay (3 second minimum; pauses on hover, focus and touch; visible pause button; stops on the last slide), opt-in edge fade and peek, static under reduced motion. Evaluated the platform and installed tools: no carousel library is installed and none was needed, so no dependency was added. [Evidence](../../evidence/expansion/X4/SYX-044/review.md)

## Variation matrix

Planned scope, not implemented API claims. **I** = default, hover, focus-visible, pressed where actionable, and disabled. Sizes use existing tokens; medium is a control size, not a page width. Every glass surface also covers light/dark, opaque/no-blur fallback and reduced transparency. Motion variants cover reduced motion. Existing runtime defaults remain until an explicit compatible update; new defaults below are planned.

| Task / item | Variants / composition | Sizes | States | Default |
| --- | --- | --- | --- | --- |
| SYX-025 Animated badge | border glint; static | content-sized | static, animating, reduced motion | static; animation opt-in |
| SYX-026 Logo | mark; mark+wordmark; optional supplied-asset motion | consumer width; preserve ratio | loaded, asset unavailable; reduced motion | supplied identity; static; no built-in third-party logo |
| SYX-027 Menu toggle | bars/close indicator | small/medium/large | I; collapsed/expanded; reduced motion | medium; collapsed; aria-expanded=false |
| SYX-028 Shiny text | static; sweeping highlight | inherit text scale | static, animating, reduced motion | static; one optional highlighted passage per page |
| SYX-029 Fancy arrow | supplied arrow asset; inline/positioned decoration | consumer width; preserve ratio | loaded, unavailable | decorative; no focus; adjacent content carries meaning |
| SYX-030 Tilt card | glass card; optional pointer tilt/layer depth | inherit Card/container | hover, pointer move, focus-within, touch, reduced motion | tilt off; static on touch/reduced motion; no fake button semantics |
| SYX-031 Card swap | static stack; manual swap; optional timed cycle | consumer frame; stable bounds | front/back, swapping, paused, reduced motion | manual; first item front; no autoplay |
| SYX-033 Media frame | image/video; fit contain/cover; optional vignette/hover color | responsive ratio; consumer bounds | loading, loaded, error, playback, hover | image cover; stable aspect ratio supplied; hover effect off |
| SYX-034 Rotating word | static word; rotating sequence | inherit headline; reserve widest word | cycling, paused, reduced motion; empty/single list | static first word; rotation opt-in; 3s interval if enabled |
| SYX-044 Carousel | manual; optional autoplay; optional edge fade | responsive slide width; container-owned | first/middle/last, dragging, focus/hover pause, empty, reduced motion | manual; first slide; no loop; autoplay interval=3s only when enabled |

**Variation gate:** each supported variant and relevant state has a documented example or test. Check boundary sizes and meaningful combinations; do not create every possible cross-product. Semantic tones, accessible names and destructive behavior cannot be changed by a global cosmetic default.

**Milestone gate:** Effects are optional, never required to read content or activate controls, and work with touch, keyboard and reduced motion. Any new dependency has a recorded reason and consumer compatibility check.
