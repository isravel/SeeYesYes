# SeeYesYes — Build Prompt

Build SeeYesYes: a design system that humans and AI coding agents can understand and use.

Phase 1 is a working frontend prototype. Components, theme editing, documentation, and context export must work. Validation and health results use clearly labeled demo fixtures.

Use this file as the shared baseline. Read the current milestone and its completion gate, then load only the spec sections needed for the task. The files below are a reference index, not a mandatory reading bundle:

1. [Product and scope](docs/specs/01-product-and-scope.md)
2. [Architecture and theme behavior](docs/specs/02-architecture-and-theme.md)
3. [Design-system contract](docs/specs/03-design-system-contract.md)
4. [Screens and interactions](docs/specs/04-screens-and-interactions.md)
5. [Visual system and components](docs/specs/05-visual-system-and-components.md)
6. [Quality and acceptance](docs/specs/06-quality-and-acceptance.md)
7. [Agent evaluation](docs/specs/07-agent-evaluation.md)
8. [Milestones and tasks](docs/planning/milestones-and-tasks.md)

## Choose context for the task

| Work | Read relevant sections from |
| --- | --- |
| Scope decisions | Product and scope |
| Registry, adapters, or state | Architecture and design-system contract |
| Components or visual foundations | Visual system, component contract, relevant quality checks |
| Theme or Playground | Theme lifecycle, relevant screen, visual scales, isolation checks |
| AI exports or validation | Contract/context model, relevant screen, export/report checks |
| Agent files (`llms.txt`, `AGENTS.md`, Copy for LLM) | Agent-readable files section of the contract, AI Context and Documentation screens, A16 |
| Token export (Design Tokens format) | Token export section of the contract, Tokens screen, A09 |
| Persistence, multiple tabs, or early initialization | Theme lifecycle, `PersistenceEnvelope` in the contract, A03–A04 |
| Documentation or layouts | Relevant screen, shared component guidance, setup/composition checks |
| Agent evaluation | Agent evaluation, AI exports section of the contract, evaluation track in the milestone plan |
| Final verification | Full acceptance checklist and milestone gates |

Always include referenced dependencies and applicable accessibility requirements. Broaden reading when a change crosses those boundaries. Do not reread unchanged documents already available in the current context.

At handoff, record completed task IDs, decisions, open issues, and the next task with relevant spec paths in the milestone evidence log. Keep the handoff short; link to evidence instead of repeating it.

## Choose a model and remind me when to switch

Use **GPT-6.1 Sol at Medium** for foundations, shared logic, difficult fixes, and milestone reviews. Use **GPT-5.6 Luna at Medium** for focused components, straightforward screens, documentation, examples, and small fixes once their foundations are ready. These are project recommendations, not measured performance claims.

Before starting a task, check the [model guide in the milestone plan](docs/planning/milestones-and-tasks.md#model-guide-and-switch-reminders). Mention the recommended model and a short reason. When the recommendation changes, remind the user in either direction:

- **Sol to Luna:** "This task is scoped and the shared logic is ready. You can switch to GPT-5.6 Luna at Medium for [task]. Switch back to Sol before [next complex task or milestone review]."
- **Luna to Sol:** "Switch back to GPT-6.1 Sol at Medium for [task]; it changes [shared logic or connected requirements]."

Increase Sol to High when a task needs deeper analysis. If Luna misses the same requirement or fails the same check after two repair attempts, recommend Sol and summarize the unresolved issue. Use actual failures to make that decision, not task length alone.

The user changes the model in the picker. Do not claim to have switched it. A reminder does not require a confirmation or stop authorized work. At each handoff, include the next task, its recommended model, and when to switch back. Keep reminders brief; do not repeat them while the recommendation stays the same.

Read only the relevant spec sections and their dependencies. Keep check output and handoff notes short. Do not lower acceptance requirements to save tokens.

## Working rules

- Use one typed registry for fonts, theme presets, tokens, contracts, rules, examples, and layouts. Derive views and exports from it.
- Finish each milestone's completion checks before moving on.
- Mark tasks complete only after their checks pass. Record evidence in the milestone log.
- Keep optional work out of Phase 1 until all required milestones pass.
- Write interface copy clearly and simply, with short sentences and useful labels.
- Reuse semantic components and CSS variables throughout the workspace itself. Apply OOCSS principles: separate structure from appearance, and keep components independent of their containers.
- Keep architecture small. Add a library or abstraction only for a current need.
- Never mark a check passed that needs a human (screen-reader and final WCAG review). Prepare it, record supplied results, and leave it open otherwise.
- If a spec is ambiguous or two specs conflict, update the owning spec first and record the decision in the milestone change log; do not resolve it silently in code.

## Definition of done

All required tasks and acceptance checks pass. The frontend runs locally and builds for deployment. It demonstrates a shared contract through theme editing, working components, documentation, context export, and demo validation. Publishing packages, deploying the site, and connecting external services are separate work.
