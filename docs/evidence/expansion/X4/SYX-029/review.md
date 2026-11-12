# SYX-029 FancyArrow review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check. **No real arrow asset was supplied.**

`FancyArrow` (`components/ui/fancy-arrow.tsx`) renders a supplied arrow image, inline or placed in a corner of a positioned parent.

- **Decorative by default.** It is `aria-hidden`, never focusable, ignores the pointer, and adjacent content carries the meaning.
- **Named only when meaningful.** Passing `alt` makes it an image with that name.
- **Direction and placement** are props. Placed arrows sit inside their parent.
- **Failure drops out.** A decorative arrow whose image fails renders nothing.
- `public/sample-arrow.svg` is a neutral placeholder for the fixture and demo.

## Evidence

- Unit: decorative and named markup.
- Browser: `aria-hidden`, no tabindex, no focusable descendants, `pointer-events: none`; the named arrow has its name; the corner arrow sits inside its area; the broken decorative arrow is absent; axe in four conditions.

## Not covered

A real arrow asset, right-to-left mirroring, and screen-reader reading.
