# SYX-034 RotatingWord review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check.

`RotatingWord` (`components/ui/rotating-word.tsx`) is an inline word in a headline that can cycle through a list.

- **Stable space.** Every word sits in the same grid cell, so the line is as wide as the longest word whichever one shows. Only the active word is `visible`.
- **Accessible phrase.** The cycling words are `aria-hidden`. One visually hidden phrase (`label`, or all words joined by commas) is what assistive technology reads, once, so changes are never announced.
- **Cycling is opt-in.** Off by default; the first word stays. It starts after hydration (server markup shows the first word and no `data-rotating`), uses a 3000 ms interval by default (never below 1000), and does nothing for zero or one word.
- **Stops** while `paused` is true (for a page-level pause control), while a mouse pointer is over the word, and under reduced motion, where the first word stays.

## Evidence

- Unit: all words rendered, one active; hidden words and the phrase; no rotation on the server, for one word, or for none.
- Browser: the heading's accessible name is the single phrase; one `aria-hidden` stack; the active word changes within five seconds; the headline width stays the same across six samples; exactly one word is visible; the pause button holds the word for over two seconds and resuming moves on; hover holds it; static and single-word forms never get `data-rotating`; reduced motion keeps "teams" and never starts; axe in four conditions; the headline fits 320px.

## Deviations and limits

- The component does not draw its own pause button. WCAG 2.2.2 applies to anything that moves for more than five seconds, so the contract tells the page to offer one and gives `paused` for it. The fixture has one and the browser test uses it.
- The fade and slide use `motion.duration` and are removed under reduced motion.

## Not covered

Screen-reader reading of the hidden phrase in a real headline, right-to-left text, and words that wrap onto several lines.
