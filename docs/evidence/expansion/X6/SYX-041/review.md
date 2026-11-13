# SYX-041 CourseCard review

Status: automated evidence only. No human visual review.

`CourseCard` (`components/ui/course-card.tsx`) is a `Card` with image, badges, title, rating, description, topic chips, price and one details link, in that order. Anything not supplied is not shown.

- **Commercial truth stays with the consumer.** `price` (`current`, optional `original` and `saving`) and `rating` (`value` and a full `label`) are text. The component never calculates, rounds, formats or converts, so currency and the saving are the caller's. A unit test passes `₹3,999.50` and checks it comes out unchanged.
- **Price is named for assistive technology** ("Price", "Original price", both overridable). The original price is struck through visually only.
- **Rating** is read from `label`; the star and visible value are `aria-hidden`.
- **One link**, with the whole card as its target (`::after` overlay). Its name is its label followed by the title. Contract says to put no other links or buttons inside.
- **Image** is a `MediaFrame` at 16:9 with its fallback text; the frame is fixed so layout does not jump.
- **Layout**: `grid` stacks; `list` puts the image beside the text when the card is wide.

## Evidence

- Unit: every supplied part rendered; rating read from the label; price text passed through untouched and part names overridable; a bare card shows no price, rating, saving, image or lists.
- Browser: price, original (line-through), saving, rating label, image, a bare card and a failed image, in the `Listing kit` fixture; axe; 320px.

## Not covered

Human visual review; very long titles or prices in other scripts; currency formatting, which is deliberately not provided.
