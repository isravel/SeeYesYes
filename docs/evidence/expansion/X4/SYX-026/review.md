# SYX-026 Logo review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check. **No real identity asset was supplied**, so this proves the slot, not a brand.

`Logo` (`components/ui/logo.tsx`) is a slot for a supplied identity: an image `src`, an inline `mark`, an optional `wordmark`, and a required `label`.

- **One name.** The logo is a single image named by `label`. The supplied image (`alt=""`), the inline mark and the wordmark are decoration, so the name never doubles.
- **Failure falls back to text.** A missing image is replaced by readable text and the accessible name does not change.
- **No built-in brand.** Nothing ships as a default mark. `public/sample-mark.svg` is two neutral circles used only by the fixture and the demo, and its file says it is not a brand.
- **Motion** is opt-in, applies to the mark only, and is removed by reduced motion.

## Evidence

- Unit: markup for image, inline mark and label-only forms.
- Browser: name and role; image and inline mark present; the broken image becomes text; animation `none` by default, running when asked, and `none` under reduced motion; axe in four conditions.

## Not covered

A real brand asset, dark-mode variants of a supplied image, and screen-reader reading.
