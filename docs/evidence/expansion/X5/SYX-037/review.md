# SYX-037 Footer review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check.

`Footer` (`components/ui/footer.tsx`) renders the supplied identity, up to four columns of links and an optional legal line in a `footer` element.

- **Landmark.** A top-level `footer` is the page's contentinfo landmark. The links sit in one `nav` named "Footer" (`label` changes it).
- **Columns.** At most four are shown; empty columns are skipped. Each list is named by its column heading, which is a paragraph and not a document heading, so heading order is untouched.
- **Content.** Only supplied identity, links and text are rendered. With nothing supplied there is no navigation.
- **External links** open in a new tab with `rel="noopener noreferrer"` and say so in their name.
- **Separation.** A one-pixel top edge from the border token, softened with `color-mix`, separates the footer with or without a glass surface behind it. It uses the existing spacing and border tokens.
- **Narrow screens.** Columns use `auto-fit`, so they drop to one column at 320px and long link text wraps.

## Evidence

- Unit: landmark and single nav, list names in order, four-column cap and empty-column skip, external link attributes, nothing rendered when nothing is supplied.
- Browser: footer element and one named navigation; four lists named Product, Company, Legal and More with the fifth column absent; no heading elements; external link name and attributes; Tab order and focus rings across five links; the top edge measured; 320px width; axe in four conditions.

## Not covered

Screen-reader reading of the landmark, right-to-left layouts, and a footer placed over a busy glass background (it draws no surface of its own).
