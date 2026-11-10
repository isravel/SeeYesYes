# SYX-075 — Spinner

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/spinner.tsx` is a neutral ring in three sizes, medium by default. It is `aria-hidden`, so it never announces by itself; the label and the live region come from the caller (a `role="status"` paragraph, as in the registry example, or Button's `aria-busy`).
- Unit: default medium; all three sizes; hidden from assistive technology.
- Browser: a small Spinner renders on the control page, and the Button `loading` test confirms the busy state is on the button, not the spinner.
- Not checked: reduced motion on the ring in the browser (its CSS uses the shared motion-duration token); the loading label inside a LoadingState.
