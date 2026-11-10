---
name: "validation-gate"
description: "Check whether a TrackPe change has enough validation evidence before review or completion"
argument-hint: "Describe the touched files, behavior change, and checks already run"
agent: "agent"
tools: [read, search, execute]
---

Review the current change and determine whether validation is sufficient.

Rules:
- Map changed behavior to the minimum required checks.
- Require tests for behavior changes.
- Require `yarn lint` and `yarn typecheck` before a task is considered complete unless the user is explicitly asking for a draft-only review.
- Prefer focused tests first, then broader validation.
- Do not mark the work complete if checks were not run or results are missing.
- Return the workflow stage as `validation`.

Return:
1. Stage
2. Validation status: pass | incomplete | blocked
3. Checks already satisfied
4. Missing evidence
5. Exact next command or check to run
6. Residual risk after current validation

Change summary:
${{ input:change_summary }}
