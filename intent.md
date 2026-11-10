# SeeYesYes intent

SeeYesYes is a design system that humans and AI can understand. Define design decisions once, then carry them through tokens, reusable React components, examples, documentation and agent-readable contracts. Developers should be able to build a distinct product without copying internal styles or guessing how a component works.

## Design direction

The planned visual direction is modern, translucent glass: softly tinted surfaces, backdrop blur, highlighted edges and layered depth. Build on the existing semantic colors, typography, spacing, density and radius scales. Text, controls and data stay crisp in light and dark appearances.

Glass must remain readable over real backgrounds. Provide opaque fallbacks, visible keyboard focus, reduced-transparency and reduced-motion behavior, and measured performance. Existing saved themes and consumer presets remain compatible. The [visual direction](docs/planning/expansion/visual-direction.md) owns the detailed requirements; this intent does not claim they are implemented.

## Product boundaries

SeeYesYes owns reusable foundations, accessible controls, compositions, templates and their shared contracts. Keep CSS Modules, native controls and React Aria as the current foundation. Extend existing patterns before adding another system.

Consuming products own their identity, content, business rules, data, authentication services and domain-specific workflows. Naazhi is the first real consumer; its finance logic, charts and navigation remain local. It consumes a versioned package and continues independently of the full expansion.

## Where work lives

- [Expansion entry point](docs/planning/component-expansion.md): phases and milestone-specific requirements, including variation matrices.
- [Expansion tracking](docs/planning/expansion/tracking.md): milestone progress and review status.
- [Naazhi migration](docs/planning/naazhi-consumer-migration.md): consumer integration and verification.
- [Original workspace plan](docs/planning/milestones-and-tasks.md): foundation evidence and outstanding reviews.

Keep tasks, defaults and progress in their owning documents. Record implementation, automated checks, human review and release approval separately. Update this file when the product's purpose or boundaries change.
