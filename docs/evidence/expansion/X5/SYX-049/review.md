# SYX-049 AppBadges review

Status: automated evidence only. No human visual review. **No official store artwork is included or checked.**

`AppBadges` (`components/ui/app-badges.tsx`) links to the stores with badge images the consumer supplies as `src`.

- **Assets.** The component ships no store artwork; it sets only the image height and keeps the image's own proportions. The fixture and demo use a neutral placeholder (`public/sample-badge.svg`), marked as a placeholder in the image itself. Official badges must be added by the consumer under each store's own usage terms, which were not checked here.
- **Destinations.** Only supplied badges render, each to its own address. Nothing implies availability anywhere that was not linked.
- **Names.** Each link is named by the store ("Download on the App Store", "Get it on Google Play") or the supplied `label`; the image is decorative.
- **Failure.** If the image fails, the link shows its name as text. This also catches a failure before hydration.

## Evidence

- Unit: one link per supplied store, store names, decorative images, label override, default size, empty list.
- Browser: see the AppBadges test in `x5-sections` (names, proportions, failure text) and the axe sweep.

## Not covered

The look of real official badges, store brand rules, clear-space rules and human review.
