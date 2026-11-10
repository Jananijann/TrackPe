---
name: branch-strategy
description: Generate a valid branch name and perform checkout only after explicit approval
argument-hint: Describe the change intent
agent: agent
---

Generate branch name options for this project from the provided task intent.

Rules:
- Format: `<type>/<kebab-description>`
- Allowed prefixes only: `feat` | `fix` | `chore` | `refactor` | `test` | `docs`
- Description must be concise kebab-case and reflect the primary task
- Return exactly 3 options, best first

Then:
1. Recommend one final branch name.
2. Check whether that branch already exists (local or remote).
3. If it exists:
   - Recommend checking out the existing branch instead of creating a duplicate.
4. If it does not exist:
   - Recommend creating it.
5. Ask for explicit approval before any checkout action.
6. Only after explicit approval, perform checkout to the selected branch.

Task intent:
${{ input:intent }}
