# TrackPe — Copilot Instructions

Source of truth for architecture and scope: [README.md](../README.md).

## Code Style

- TypeScript strict mode. No `any` — use `unknown` and narrow, or model the type properly.
- React components: arrow functions with explicit `React.FC<Props>` typing.
- Alias imports (`@/...`) everywhere for app code. No relative `../../` paths in `src/`.
- No comments unless the *why* is non-obvious.

## Folder & Naming Conventions

| What | Where |
|---|---|
| Screens | `src/screens/` — `PascalCase.tsx` |
| Screen-local styles | `src/screens/<ScreenName>/styles.ts` |
| Parser functions | `src/parsers/` — `camelCase.ts`, pure functions only |
| SQLite schema + repository | `src/db/` |
| Redux slice, saga, persist config | `src/store/` |
| TurboModule / NativeModule JS specs | `src/native/` |
| Shared domain types | `src/types/expense.ts` |

New screens must be registered in `src/navigation/RootNavigator.tsx`.

### Screen Structure Rules

- Each screen should live in its own folder under `src/screens/` (example: `src/screens/WelcomeScreen/`).
- Screen styles must be extracted into a screen-local styles file (example: `src/screens/WelcomeScreen/styles.ts`).
- Keep screen component files focused on JSX/render logic; avoid large `StyleSheet` blocks inside component files.

### Strings & Localization Rules

- Do not hardcode user-facing strings inside screens/components.
- Store all user-facing text in a centralized language strings module and import from there.
- Use a single source of truth (for example `src/constants/languageStrings.ts`) and reference keys from UI files.
- Exceptions are limited to test-only strings and platform-required literals.

## Architecture Constraints

**Storage**: SQLite via `op-sqlite`. Repository pattern — all SQL lives in `src/db/expenseRepository.ts` only.  
**State**: Redux Toolkit + Redux Saga. Redux Persist covers non-DB slices only (settings, auth placeholder). Expense records are loaded from SQLite on startup, never persisted via Redux Persist.  
**Parsers**: `notificationParser.ts` and `smsParser.ts` are pure functions — no side effects, no store access.  
**Navigation**: React Navigation v7 Native Stack. Stack shape is defined in `RootNavigator.tsx`.

## Native Module Boundary

Write native code (Kotlin / Swift) only for:
- Android `NotificationListenerService` and `NotificationListenerModule` (TurboModule)
- iOS `SmsReaderModule` push/permission bridge (NativeModule)
- Any OS-level integration with no JS API equivalent

### iOS Notification Access Alternative

iOS does not allow third-party apps to read notifications posted by other apps (no Android-style notification listener).
TrackPe uses an alternative approach on iOS:

- **SMS parsing via MessageFilter (iOS 16+)**: Access bank transaction SMS through the iOS MessageFilter framework.
- **Transaction alert parsing**: Parse debit/credit alerts from bank messages such as `UPI: Rs.500 debited from A/c XX1234`.
- **User setup requirement**: Users must set TrackPe as an SMS filter extension.
- **Coverage expectation**: This captures most UPI transactions because banks send SMS alerts for each payment.

Everything else — parsing, state, navigation, UI — stays in TypeScript.  
JS specs for native modules live in `src/native/` and must be typed via `TurboModuleRegistry` (Android) or standard `NativeModules` spec (iOS).

## Build & Run

```bash
yarn android          # Run on Android emulator
yarn ios              # Run on iOS simulator
yarn typecheck        # tsc --noEmit (run before declaring work done)
yarn lint             # ESLint + Prettier (run before declaring work done)
yarn test             # Jest unit + integration tests
```

## Feature Workflow

All feature work should follow the same delivery flow: intake -> implementation -> validation -> review.

### Intake

- Convert the request into explicit acceptance criteria before implementation starts.
- Identify the smallest affected code path, likely files, and validation needs.
- Ask only the minimum blocking questions.
- Make scope boundaries explicit, including what is out of scope when needed.

### Implementation

- Start from a concrete anchor: failing behavior, file, symbol, test, or owning abstraction.
- Keep edits focused on the controlling code path.
- Do not widen scope beyond the requested behavior unless required for correctness.
- Reuse the existing prompt workflow for git preparation when needed:
	- `branch-strategy` for branch naming and checkout

### Validation

- Any behavior change requires test updates or additions.
- Prefer the most relevant focused validation first, then broader checks.
- Before declaring work complete, run:
	- `yarn lint`
	- `yarn typecheck`
	- the relevant Jest coverage for the touched slice
- If broader checks were not run, call that out explicitly.
- If formatting is enforced, use `npx prettier --check ...` until a dedicated script exists.

### Review

- Reviews must be findings-first.
- Prioritize bugs, regressions, missing tests, and architecture violations over style nits.
- If no findings are present, say so explicitly and note any residual risks or testing gaps.
- A review-ready handoff should include:
	- change summary
	- acceptance criteria status
	- validation evidence
	- reviewer focus areas
	- known risks or follow-up items

### Packaging

- Use the existing prompt workflow for git side effects:
	- `commit-message` for Conventional Commit generation and approval-gated commit execution
- Do not run destructive or side-effecting git commands without explicit approval.

## Anti-Patterns

- **No raw SQL outside `expenseRepository.ts`** — components, sagas, and slices must not import op-sqlite directly.
- **No expense entities in Redux Persist** — SQLite is the source of truth; expenses are cache only in Redux.
- **No `any` types** — cast-free code; model the type or use `unknown`.
- **No new native code for JS-solvable problems** — add to `src/` first; add native only when OS access is required.
- **No screens outside `src/screens/`** — and always wire them into `RootNavigator.tsx`.

## Git Conventions

### Branching Model
GitHub Flow — short-lived feature branches off `main`, merged via PR. No long-lived release or develop branches.

### Branch Naming
`<type>/<kebab-description>` — must use one of the allowed prefixes:

| Prefix | Use for |
|---|---|
| `feat/` | New feature or capability |
| `fix/` | Bug fix |
| `chore/` | Dependency updates, config, tooling |
| `refactor/` | Code restructure with no behaviour change |
| `test/` | Adding or updating tests only |
| `docs/` | Documentation changes only |

Examples: `feat/notification-listener`, `fix/parser-amount-regex`, `test/repository-crud`

### Commit Message Format
[Conventional Commits](https://www.conventionalcommits.org): `type(scope): short description`

- `type` matches branch prefix (feat, fix, chore, refactor, test, docs)
- `scope` is the affected module in lowercase: `parsers`, `db`, `store`, `screens`, `native`, `navigation`, `android`, `ios`
- Description: imperative mood, lowercase, no trailing period, ≤ 72 chars
- Body (optional): explain *why*, not *what*; wrap at 72 chars

Examples:
```
feat(parsers): add GPay UPI notification regex
fix(db): handle null bankRefId on insert
chore(deps): upgrade op-sqlite to 15.3.0
test(store): add addExpense saga integration test
```

### Protected Branch & Merge Rules
- `main` is protected — no direct pushes; always via PR
- Squash merge only — keeps `main` history linear and readable
- Delete branch after merge
