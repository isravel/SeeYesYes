# SYX-020 Toast review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check.

## What it is

`Toast` (`components/ui/toast.tsx`) is a trigger button that queues a toast, built on React Aria's toast queue and region (the `UNSTABLE_` exports of `react-aria-components` 1.22.0).

- Toasts queue per screen position and are shared by every `Toast` on the page. One region per position shows up to three; the rest wait. The first mounted `Toast` at a position owns the region and the next takes over when it unmounts, so the page has one labelled "Notifications" landmark per position.
- Nothing renders in the region until a toast is queued, so nothing is announced on load.
- Information and success are a polite `status`; warning and destructive are an assertive `alert`. The tone is named in text (visually hidden when there is no title), never colour alone.
- A toast without an action expires after `timeout` (default 5000 ms). Hover and focus pause the timer. A toast with `actionLabel` never expires.
- `onAction` may be async. While it runs the action shows progress and "Working…" is announced. If it rejects, the toast stays open, shows `actionErrorMessage` as text and keeps the action available. On success the toast closes.
- The close button is always present. Escape closes a focused toast.
- Positions: `bottom-center` (default), `bottom-end`, `top-center`, `top-end`. Clamped to the viewport; checked at 320px.
- Portals into the nearest `ThemeScope`.

## Deviations from the plan

- React Aria's toast does not handle Escape, so a wrapper element handles it.
- The queue is a module-level map, so toasts are shared across `Toast` instances at one position. Two `Toast` components with different `timeout` values share one queue and region; each toast keeps its own timeout.
- The contract does not offer Toast as a theme default (`themeDefaults` is empty).
- Planned states "queued", "paused" and "expired" are covered by browser tests of the timer; there is no separate UI for them.

## Automated evidence

- Unit (`tests/x3-toast.test.ts`): trigger-only server markup, disabled trigger, expiry rule, contract defaults and registration.
- Browser (`tests/browser/x3-panels.spec.ts`, 5 tests): announcement by urgency and tone text; expiry; timer pause on hover; close button and Escape; action stays past the non-action timeout, runs once, and a failed action shows text and can be retried; bottom-centre and top-end placement; 320px fit and 24px minimum targets; axe sweep with three open toasts in light, dark, glass and clean.
- `keyboard-matrix` includes Toast: reachable by Tab, named, visible focus.

## Failure found on the way

The axe test first timed out waiting on `document.getAnimations()`: an infinite animation (the pending spinner) never finishes. The wait now covers only finite animations. This was a test defect, not a component problem.

## Not covered

Screen-reader announcement order when several toasts arrive together, right-to-left layout, touch devices, reduced-transparency rendering in a browser (Playwright cannot emulate it), more than three toasts waiting in the queue in a browser, and a `Toast` unmounting while its toasts are open (the next `Toast` at that position takes over the region).
