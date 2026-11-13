# SYX-042 EventCard review

Status: automated evidence only. No human visual review.

`EventCard` (`components/ui/event-card.tsx`) is a `Card` led by a poster, with the event's facts written as text and one link to the event.

- **Information is never only in the image.** Date (required), time, place and description are always real text, in a description list with spoken names ("Date", "Time", "Location", overridable). The date is a `time` element when `dateTime` is given. The contract tells consumers to repeat anything the poster shows in `date` and `location`.
- **Poster** needs a text alternative. Pass its natural `width` and `height` and the frame sets that `aspect-ratio` before the image loads; missing, zero or negative values fall back to 3:4. A failed poster shows its alt text.
- **Destination**: one link, whole card as target, named by its label followed by the title.
- No motion and no autoplay.

## Evidence

- Unit: facts as text with names; time element; poster alt and one link; supplied, missing and unusable proportions; name overrides.
- Browser: all facts visible, `datetime` attribute, poster rendered at about 3:4, failed poster shown as text with the date still present; axe.

## Not covered

Human visual review; legibility of text inside real posters; whether a real poster's alt text matches what it shows (the caller's job); time zones and date formatting, which are the caller's.
