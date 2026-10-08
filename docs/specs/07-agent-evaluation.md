# Agent evaluation

## Purpose

Phase 1 shows what an agent could consume. This evaluation tests whether that context actually helps: whether agents given SeeYesYes context build interfaces with fewer contract and accessibility mistakes, at a reasonable token cost.

The evaluation is separate from the product. The app never runs agents, calls a model, or scores code. An operator runs ordinary coding agents against a small fixture app, outside the workspace, and records the results. This keeps “AI inference” and “external agent execution” outside the Phase 1 product as stated in [Product and scope](01-product-and-scope.md#outside-phase-1).

## Questions

| ID | Question |
| --- | --- |
| Q1 | Does SeeYesYes context reduce contract and accessibility violations compared with no context? |
| Q2 | Does task context match full context on quality while using fewer tokens per successful task? |
| Q3 | Is the `AGENTS.md` snippet alone enough, or do agents need the task export? |

## Conditions

Every task runs under each condition with the same fixture app state and the same task prompt.

| ID | Context given to the agent |
| --- | --- |
| C0 | None. The fixture app contains component source and types only. |
| C1 | The `AGENTS.md` snippet, placed in the fixture app's `AGENTS.md`. |
| C2 | C1 plus the task-mode Markdown export for the task's components, pasted before the task prompt. |
| C3 | C1 plus the full-mode Markdown export, pasted before the task prompt. |

All context comes from the shipped exports under the default preset. Never hand-edit an export for the evaluation.

## Task set

Eight fixed tasks, each probing specific rules. Store each task under `evaluation/tasks/<id>.md` with its prompt text, expected components, probed rules, and a requirements checklist.

| ID | Task | Expected components | Rules and behavior probed |
| --- | --- | --- | --- |
| T1 | Build an account settings form with name, email, plan, and newsletter fields, and a save action | Form Field, Label, Input, Select, Switch, Button | Associated labels, error text, `type="submit"`, `token-no-raw-color` |
| T2 | Add a confirmation before deleting a project | Dialog, Button | Destructive variant, named dialog, Escape, focus return |
| T3 | Add a “View profile” action to a page header | Link | `prefer-semantic-link`, `avoid-custom-button` |
| T4 | Show a list of invoices with a status for each | Table, Badge | Caption or accessible name, header associations, no raw colors |
| T5 | Show progress while settings save | Button, Spinner | `loading` with `aria-busy`, label preserved, no custom spinner |
| T6 | Split account settings into Profile, Security, and Billing sections | Tabs | Use Tabs rather than custom tab markup, arrow-key behavior |
| T7 | Show an empty state for a project list with a create action | Card, Button | `avoid-unnecessary-wrapper`, `minimize-custom-css` |
| T8 | Add an icon-only “Copy link” action with a hint | Button, Tooltip | Accessible name on icon-only Button, Tooltip not the only instruction |

Write task prompts the way a developer would ask, without naming SeeYesYes components or rules. No task may be copyable verbatim from a registry example; otherwise the evaluation measures copying, not understanding.

## Fixture app

Keep a minimal Next.js app under `evaluation/fixture-app/`. It imports the shipped components through the same public import modules as the contracts, and has one empty page per task.

- It must not contain the registry, documentation, exports, or `AGENTS.md`, so C0 has no hidden context. Conditions add context only as described above.
- A reset script restores a clean copy before every run.
- The fixture app is development tooling. It is not part of the shipped product or the Phase 1 acceptance checks.

## Running

- Use at least one agent setup for round 1 and two for later rounds. Record agent name and version, exact model ID, and any non-default settings.
- Run each task under each condition three times. Round 1 with one agent is 8 tasks × 4 conditions × 3 runs = 96 runs.
- Randomize run order so conditions do not share time-of-day or model-update effects.
- Give no hints beyond the task prompt. If the build fails, the operator may send at most two fixed follow-ups: “The build fails with: <error output>. Fix it.” Count each as a retry.
- Stop a run after 30 minutes or 40 agent turns, whichever comes first, and score it as unsuccessful.
- Keep every transcript and the final diff.

## Scoring

Each run produces one result row. Score automatically where possible; manual checks are done by a person who did not write the task.

| Measure | How |
| --- | --- |
| Builds | Type check and production build of the fixture app pass |
| Requirements met | Task checklist, scored manually |
| Error/warning/info violations | Scoring script: raw color literals outside tokens, clickable non-interactive elements, Button used for navigation, imports outside contract `publicImport` modules, unknown variants or disallowed combinations (type check), plus manual review for wrappers and custom CSS. Severity comes from the matching rule |
| Accessibility | axe-core on the task page in its relevant states (serious and critical counts), plus manual keyboard checks for T2, T6, and T8 |
| Tokens | Input and output tokens from the agent's own usage report. Record “not reported” when absent; never estimate from bytes |
| Context size | Bytes of context added by the condition |
| Retries, turns, duration | From the transcript |

A run is a **clean success** when it builds, meets every requirement, and has zero error-severity violations and zero serious or critical axe findings.

Keep the scoring script under `evaluation/score/`. Its checks reuse the rule IDs from the contract so results link back to the Rules screen.

## Decision criteria

Set these before round 1 and do not change them after seeing results.

- **Q1** is answered “yes” when the best context condition raises the clean-success rate over C0 by at least 20 percentage points and at least halves error-severity violations per run. If not, revise contract content (guidance, examples, rules) before starting Phase 2 work.
- **Q2** favors task context when its clean-success rate is within 5 percentage points of full context and it uses fewer total tokens per clean success. If task context falls further behind, investigate which closure omissions caused failures before shrinking anything.
- **Q3** recommends the snippet alone when C1 is within 5 percentage points of C2 on clean-success rate. Otherwise Getting Started tells developers to supply task context for component work.

Report results per task as well as overall; a large gain on one task should not hide a regression on another. With three runs per cell, results are directional lab evidence, not statistically significant findings. Say so in the report.

## Results and honesty

- Store each round under `docs/evidence/evaluation/round-<n>/`: `results.json` (one row per run), `report.md`, transcripts, diffs, and the exact exports used.
- Each result row records: run ID, agent, model ID, condition, task ID, builds, requirements met, violations by rule ID, axe counts, input/output tokens or “not reported”, context bytes, retries, turns, duration, and notes.
- Report every run, including failures and negative results. Do not drop or rerun a run because its result is inconvenient; rerun only for operator error, and record why.
- Do not describe evaluation results in the product as certification, proof of compliance, or a general claim about all agents. The Overview may link to the latest report with its date, agents, and sample size.
