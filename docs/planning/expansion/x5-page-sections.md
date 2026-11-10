# X5 — Reusable page sections

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Phase: C — Sections and listings. Dependencies: X1–X3; individual X4 effects only when a section enables them.

- [ ] **SYX-035 — Share buttons.** Provide LinkedIn, X, WhatsApp and copy-link actions; encode content safely, preserve existing URL parameters/hash and support via=share attribution with copy failure feedback.
- [ ] **SYX-036 — Navbar.** Provide sticky/inline glass navigation with scroll-aware surface separation, grouped links and a mobile menu; retain landmarks, current destination and focus behavior.
- [ ] **SYX-037 — Footer.** Provide identity content and up to four link columns using the existing spacing and separator tokens.
- [ ] **SYX-038 — Hero.** Compose badge, headline, lead, optional Highlight, primary/secondary actions and media from existing primitives.
- [ ] **SYX-039 — Section head.** Provide a responsive heading, subtitle and optional View all link using the typography scale.
- [ ] **SYX-045 — Feature bento.** Provide a responsive feature grid, including a three-over-four example, with logical reading order and optional title badges.
- [ ] **SYX-046 — Testimonials.** Provide portrait-video stories and review cards with captions, playback controls and supplied attribution; do not invent endorsements.
- [ ] **SYX-047 — Stat strip.** Provide responsive value/label groups; values and their meaning come from the consumer.
- [ ] **SYX-048 — CTA panel.** Provide an emphasized closing panel with one main action and optional decorative texture through system tokens.
- [ ] **SYX-049 — App badges.** Provide slots for official App Store/Google Play badge assets with accessible destination links.
- [ ] **SYX-050 — Instructor.** Provide reusable profile name, bio, social links and portrait composition; content stays consumer-owned.

## Variation matrix

Planned scope, not implemented API claims. **I** = default, hover, focus-visible, pressed where actionable, and disabled. Sizes use existing tokens; medium is a control size, not a page width. Every glass surface also covers light/dark, opaque/no-blur fallback and reduced transparency. Motion variants cover reduced motion. Existing runtime defaults remain until an explicit compatible update; new defaults below are planned.

| Task / item | Variants / composition | Sizes | States | Default |
| --- | --- | --- | --- | --- |
| SYX-035 Share buttons | LinkedIn/X/WhatsApp/copy link | small/medium/large | I; copy pending/success/failure; unavailable share target | medium; caller-supplied URL; via=share; no auto-share |
| SYX-036 Navbar | inline/grouped links; mobile menu; sticky glass | container width; responsive; density-driven | current, menu open/closed, focus, scrolled | sticky glass; mobile menu closed; caller-owned links |
| SYX-037 Footer | identity+links; 0–4 link columns | responsive container | static, wrapped links, keyboard focus | supplied links only; glass-compatible edge separation |
| SYX-038 Hero | text+media; centered/split | responsive container; system heading scale | media loading/error; action I | text-first; split when media supplied; no auto-playing media |
| SYX-039 Section head | heading+subtitle; optional View all | system heading scale | static; link hover/focus | heading level supplied by page; no action unless URL supplied |
| SYX-045 Feature bento | feature grid; three-over-four example | responsive grid; stack on narrow widths | static; links I; media fallback | logical DOM order; glass cells; no tilt by default |
| SYX-046 Testimonials | video story; attributed review card | responsive cards/grid | media loading/error; paused/playing; action I | paused; no autoplay; supplied attribution; captions for speech |
| SYX-047 Stat strip | value+label groups | responsive row/stack; type scale | static; missing value explicitly labeled | consumer values; no counting animation |
| SYX-048 CTA panel | emphasized glass; optional texture | responsive container | action I; media fallback | one primary action; texture off |
| SYX-049 App badges | official store assets; one/both stores | official proportions; responsive width | link hover/focus; asset unavailable | only supplied destinations; no fabricated availability |
| SYX-050 Instructor | portrait+bio+social links | responsive split/stack | media loading/error; links I | static portrait; supplied profile; links only when supplied |

**Variation gate:** each supported variant and relevant state has a documented example or test. Check boundary sizes and meaningful combinations; do not create every possible cross-product. Semantic tones, accessible names and destructive behavior cannot be changed by a global cosmetic default.

**Milestone gate:** Glass surfaces, layering and fallback meet the shared visual checks. Sections compose at 320px and desktop, in both appearances, with correct heading order, readable content and working actions. No section requires a fixed brand, font, accent or private stylesheet.
