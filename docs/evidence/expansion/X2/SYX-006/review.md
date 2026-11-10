# SYX-006 — Button

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/button.tsx` keeps `primary`, `secondary`, `ghost`, `destructive` and adds `outline`, `soft`, `muted`. `solid` maps to `primary` and `danger` to `destructive` through one function, so callers using either name render the same styles and the same `data-variant`.
- Defaults unchanged: primary, medium, `type="button"`, not loading. Theme defaults still apply through `useComponentDefaults`.
- Unit (`SYX-006 Button`): every variant and both aliases; defaults; `loading` gives `disabled` and `aria-busy`; `disabled` on an alias; explicit `type="submit"`.
- Browser (`every Button variant renders…`): alias computed background equals its target; all seven styles show a solid focus outline; ghost, outline, soft and muted change fill on hover; primary has a transform while pressed; outline and soft differ from primary and muted; loading and disabled buttons are disabled with `aria-busy` on loading.
- Contract: `variants.variant` lists the seven styles; the `variant` prop lists the aliases as accepted values and says they are not separate styles.
- Not checked: small and large sizes in the browser (unchanged sizing code), and hover/press in dark mode.
