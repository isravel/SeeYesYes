# Agent evaluation tooling

Development tooling for the agent evaluation in [docs/specs/07-agent-evaluation.md](../docs/specs/07-agent-evaluation.md). It is not part of the shipped product and is not checked by the Phase 1 acceptance checks. The app never runs agents, calls a model, or scores code.

| Path | Purpose |
| --- | --- |
| `tasks/T1.md` to `T8.md` | The eight fixed tasks: prompt, expected components, probed rules, requirements checklist |
| `fixture-app/` | Template for the minimal Next.js app (one empty page per task) |
| `reset.mjs` | Builds a clean fixture copy at `evaluation/work/fixture-app` before every run |
| `context.ts` | Prepares a run's context for a condition (C0 to C3) from the shipped exports under the default preset |
| `score/` | Automated scoring: rule-keyed source checks, type check, build, and axe-core |

## Running one run (operator)

```sh
node evaluation/reset.mjs                                   # clean copy
node --import tsx evaluation/context.ts C2 T3 > prompt.md   # writes AGENTS.md for C1-C3; prints the prompt with any pasted context first
# Give prompt.md to the agent, working in evaluation/work/fixture-app. Send no hints.
node --import tsx evaluation/score/index.ts --dir evaluation/work/fixture-app --task T3 --build --url http://localhost:3150/t3
```

`reset.mjs --verify` installs, type-checks, and builds the copy to prove the fixture itself is sound. `score` reports automated checks only. The requirements checklist, the wrapper and custom-CSS review (items marked `needsReview`), and the keyboard checks for T2, T6, and T8 are scored by a person who did not write the task, and never by the agent whose run is being scored.

Record every run, including failures, under `docs/evidence/evaluation/round-<n>/`. Keep the exports used, the transcript, and the final diff. Token counts come from the agent's own usage report, or "not reported"; never estimate from bytes.
