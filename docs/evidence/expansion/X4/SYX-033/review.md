# SYX-033 MediaFrame review

Status: automated evidence only. No human visual review, screen-reader test, video playback test or reduced-transparency check.

`MediaFrame` (`components/ui/media-frame.tsx`) is a figure with a reserved aspect ratio, an image, an optional caption and a failure fallback.

- **Real figure.** It renders a `figure` with a `figcaption` when `caption` is given, and the image carries `alt`.
- **Ratio reserved.** The frame has its ratio before and after load, so the page does not jump.
- **Fit.** `cover` is the default; `contain` is available.
- **Failure fallback.** A failed image becomes the alt text in a frame of the same shape, with no broken-image icon.
- **Hover treatment** (`zoom`) and `vignette` are off by default, move only the image, and are removed by reduced motion.

## Evidence

- Unit: figure markup, alt text, caption and reserved ratio.
- Browser: image visible and named; caption text; 16:9 and 1:1 ratios measured; `object-fit` cover and contain; the broken image shows text, no `img`, same ratio, caption kept; hover zoom transforms the image and reduced motion keeps it still; axe in four conditions.

## Not covered

Video playback (images are what the fixture exercises), real photographs, and slow networks.
