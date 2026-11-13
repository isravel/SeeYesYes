# SYX-043 CohortCard review

Status: automated evidence only. No human visual review.

`CohortCard` (`components/ui/cohort-card.tsx`) is built on `TiltCard`: title, a status you supply, a description, tool images you supply, and one details link.

- **Status** is text in a `Badge`, with a tone from the existing badge tones; tone is never the only cue. It is never computed.
- **Tools** are a named list of images, each with its label as the alt text; a failed image shows the label as text (also checked after hydration, since a server-rendered image can fail before React is listening).
- **Tilt and texture are off by default.** `tilt` is passed to `TiltCard`, which already ignores touch and keyboard focus and respects reduced motion. `texture` is a faint dot pattern behind the content, removed in forced colors.
- **Content is the same with effects off.** A unit test strips the markup to text and checks the text is identical with and without `tilt` and `texture`.
- One link, whole card as target, named by its label followed by the title.

## Evidence

- Unit: status, tone, tools, one link; defaults off; effects only when asked; identical text with and without effects.
- Browser: status and tools visible, a failed tool shown as text, an effects card keeps its text and link, keyboard focus leaves the transform at none, and forced colors removes the texture.

## Not covered

Human visual review; the feel of tilt over glass on a real pointer; a card whose `TiltCard` props are forwarded beyond the ones tested.
