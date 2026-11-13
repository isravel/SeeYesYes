# SYX-046 Testimonials review

Status: automated evidence only. No human visual review, screen-reader pass or real-device playback test.

`Testimonials` (`components/ui/testimonials.tsx`) lists supplied stories and reviews. Nothing is written for the consumer.

- **Stories.** A portrait (9 by 16) frame with a native `video`: controls, `playsInline`, `preload="metadata"`, no autoplay, loop or mute, and a captions track shown by default. Captions are required by the type.
- **Reviews.** A quote with its author; an author is required. The portrait is `avatarSrc` or the author's initials.
- **Playback.** Starting one story pauses the others.
- **Failure.** A video that cannot load is replaced by text (`unavailableLabel`). A load error before hydration is caught after hydration.
- **Honesty.** No ratings, counts or badges are added.

The sample video and captions in `public/` are a tiny placeholder (`sample-story.webm`, `sample-captions.vtt`), used only by the fixture and demo.

## Evidence

- Unit: supplied words only, no autoplay, loop or mute, default captions, empty list.
- Browser: see the Testimonials test in `x5-sections` (no autoplay, captions, pausing the others, failure text), the keyboard matrix (the video takes Tab focus) and the axe sweep.

## Not covered

Caption quality (the sample captions are a placeholder), real portrait video, playback on touch devices, screen-reader pass and human review. The keyboard matrix checks the video by element, since a native video has no ARIA role.
