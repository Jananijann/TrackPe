---
name: "feature-intake"
description: "Turn a raw TrackPe feature request into scope, acceptance criteria, affected code surfaces, and required validation"
argument-hint: "Describe the feature request, constraints, and any known files"
agent: "plan"
---

Create a feature brief for this repository from the request below.

Requirements:
- Inspect the current codebase before making assumptions.
- Keep the brief specific to the controlling code paths.
- Ask only the smallest set of blocking clarifications.
- Align the brief with the repo rules in `.github/copilot-instructions.md`.
- Explicitly call out testing expectations for any behavior change.
- Return the workflow stage as `intake`.

Return:
1. Stage
2. Goal
3. In scope
4. Out of scope
5. Acceptance criteria
6. Likely files or subsystems affected
7. Risks or unknowns
8. Required tests and validation commands

Feature request:
${{ input:request }}
