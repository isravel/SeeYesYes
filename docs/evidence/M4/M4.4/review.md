# M4.4 Variant and state controls

Date: 2026-10-13

The Live preview section of Component Detail now has controls that drive the real component.

- **Demos** (`components/examples/demos.tsx`) define one demo per component: the real component, sample content, a props function from the selected variants and state, and the forced states. The preview and the code are produced from the same props, so they cannot disagree. All 29 components have a demo.
- **Variant controls** are native selects built from the contract's variant dimensions. The starting selection follows the effective defaults under the applied theme. Compound variants that match the selection are announced ("This combination has a dedicated style"). Options that would create a `disallowed` combination are disabled, and the reason from the contract is shown instead of rendering the combination. The registry currently has no `disallowed` compounds, so that path is covered by unit tests with a synthetic contract.
- **State controls** force only states the real component can show through its props: disabled, loading, read-only, invalid, required, checked, on/off, selected, help, error, empty, and similar. States that only occur through interaction (hover, pressed, focus-visible, current, open overlays) are listed as "Interaction states to try in the preview with a pointer or keyboard" rather than faked. Dialog, menu, and tooltip are not forced open, because an open modal would trap the controls.
- **Matching code** shows the verified import line plus generated JSX for the exact selection, with a Copy button using the shared copy feedback. Recommended and violation examples remain in their own sections.

Verification: `npm run check` passed (159 unit tests, 7 new). The unit tests check that every demo state is a documented contract state, every variant dimension is a documented prop, every variant option and forced state server-renders for all 29 components, and the code reflects the selection. All 51 production browser tests passed, including: Button variant, size, disabled, and loading changing the real element and the code; the ghost+small compound note; copy of generated code; initial selection following an applied Button default; and every component's every variant option and forced state changing the code and keeping a working preview. One long all-components browser test failed once on a visibility timeout under load, then passed on repeated runs and in the full suite; the first visibility wait now allows 15 seconds and the test a 90-second budget. Human screen-reader and WCAG review remain open.

M4.4 is complete. Next: M4.5 usage boundaries, composition constraints, token and rule links, structured contract view, and copy feedback.
