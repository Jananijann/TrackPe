---
name: commit-message
description: Generate a Conventional Commit message from a description of staged changes
---

Generate a git commit message following the Conventional Commits spec for this project.

Rules:
- Format: `type(scope): short description`
- type: feat | fix | chore | refactor | test | docs
- scope (lowercase): parsers | db | store | screens | native | navigation | android | ios
- Description: imperative mood, lowercase, no trailing period, ≤ 72 chars
- If changes span multiple scopes, use the primary one
- Add a body only if the *why* is non-obvious; wrap at 72 chars
- Do not add a body if the subject line is self-explanatory

Execution flow:
1. Generate the commit message from the staged changes.
2. Show the final commit message in a copyable block.
3. Ask for explicit approval: "Approve commit with this message?"
4. Only after explicit approval, run `git commit -m "<subject>"` and include `-m "<body>"` only when a body exists.
5. If approval is not given, do not run any git commit command.

Staged changes:
${{ input:changes }}
