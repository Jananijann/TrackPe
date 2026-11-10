---
name: "review-handoff"
description: "Prepare a structured TrackPe review brief with scope, evidence, and risk areas"
argument-hint: "Describe the completed change, acceptance criteria, and validation results"
agent: "agent"
tools: [read, search, execute]
---

Prepare a review-ready handoff for the current change.

Rules:
- Keep the handoff concise and reviewer-oriented.
- Focus on what changed, why it changed, how it was validated, and what still looks risky.
- Include acceptance criteria status, not just a generic summary.
- Call out any architecture-sensitive areas such as native modules, parser purity, navigation wiring, strings, or SQLite boundaries.
- Structure the output so it can be pasted into the PR template with minimal editing.

Return:
1. Change summary
2. Acceptance criteria status
3. Files or subsystems most worth reviewer attention
4. Validation evidence
5. Known risks or follow-up items
6. Suggested commit scope if the change is ready to package

Completed work:
${{ input:completed_work }}
