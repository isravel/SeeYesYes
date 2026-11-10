# X4 — Optional effects and media primitives

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Phase: B — Motion and media. Dependencies: X1–X2 and any X3 controls used; no dependency on all listing or template work.

- [ ] **SYX-025 — Animated badge.** Provide an optional border-glint treatment using system accent/motion tokens and a static fallback.
- [ ] **SYX-026 — Logo.** Provide a reusable identity/wordmark slot and optional motion treatment for supplied assets; do not create or copy another brand identity.
- [ ] **SYX-027 — Menu toggle.** Provide a named expanded/collapsed control with an optional bar-to-close transition and reduced-motion fallback.
- [ ] **SYX-028 — Shiny text.** Provide optional text shimmer with readable static text and guidance to use sparingly.
- [ ] **SYX-029 — Fancy arrow.** Render a supplied decorative arrow asset with configurable placement and an accessible text alternative only when meaningful.
- [ ] **SYX-030 — Tilt card.** Provide opt-in pointer tilt and layer depth; preserve normal reading and activation on touch and keyboard.
- [ ] **SYX-031 — Card swap.** Provide an optional stacked-card transition with stable reading order, accessible controls and a static reduced-motion alternative.
- [ ] **SYX-033 — Media frame.** Provide responsive media sizing, aspect ratios, optional hover treatment, captions and failure fallback.
- [ ] **SYX-034 — Rotating word.** Reserve stable headline space, keep an understandable accessible phrase and support static/reduced-motion content.
- [ ] **SYX-044 — Carousel.** Evaluate the platform and installed tools before selecting a dependency. Support optional 3-second autoplay, hover/focus pause, visible pause/resume, manual navigation, touch and reduced motion.

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
