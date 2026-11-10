# TrackPe — Expense Capture App (React Native New Architecture)

## Context

Building a personal expense tracking app that automatically captures UPI payment data without manual input. The core differentiator is a TurboModule wrapping Android's `NotificationListenerService` to intercept payment notifications in real-time. On iOS (where third-party notification access is not permitted), the app falls back to SMS parsing + manual entry. This is a fresh RN 0.75+ project with New Architecture enabled, single-user with auth (to be wired later), local-only storage (SQLite), and v1 scope is capture + list only.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native 0.75+ (New Architecture, Fabric + JSI) |
| Language | TypeScript (strict) |
| State | Redux Toolkit + Redux Saga + Redux Persist |
| Navigation | React Navigation v7 (Native Stack) |
| Storage | WatermelonDB over SQLite (relational, reactive) OR `op-sqlite` raw SQLite |
| Native bridge | TurboModule (Android) + NativeModule (iOS SMS) |
| Auth | Placeholder screen — wired later |
| Min targets | Android API 26 (8.0) / iOS 14 |

---

## Project Structure

```
TrackPe/
├── android/
│   └── app/src/main/java/com/trackpe/
│       ├── notification/
│       │   ├── NotificationListenerModule.kt       ← TurboModule impl
│       │   ├── NotificationListenerService.kt      ← NotificationListenerService
│       │   └── NotificationListenerPackage.kt
│       └── MainApplication.kt
├── ios/
│   └── TrackPe/
│       ├── SmsReaderModule.swift                   ← NativeModule (SMS)
│       └── SmsReaderModuleBridge.m
├── src/
│   ├── native/
│   │   ├── NativeNotificationListener.ts           ← TurboModule JS spec
│   │   └── NativeSmsReader.ts                      ← NativeModule JS spec
│   ├── parsers/
│   │   ├── notificationParser.ts                   ← UPI notification → ParsedExpense
│   │   └── smsParser.ts                            ← Bank SMS → ParsedExpense
│   ├── store/
│   │   ├── index.ts
│   │   ├── expenseSlice.ts
│   │   ├── expenseSaga.ts
│   │   └── persistConfig.ts
│   ├── db/
│   │   ├── schema.ts                               ← SQLite table definitions
│   │   └── expenseRepository.ts                    ← CRUD operations
│   ├── screens/
│   │   ├── HomeScreen.tsx                          ← Expense list
│   │   ├── AddExpenseScreen.tsx                    ← Manual entry (iOS fallback)
│   │   ├── PermissionsScreen.tsx                   ← Notification / SMS permission gate
│   │   └── AuthScreen.tsx                          ← Placeholder
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   └── types/
│       └── expense.ts                              ← ParsedExpense, RawExpense types
```

---

## Phase 1 — Project Scaffold

1. `npx @react-native-community/cli init TrackPe --template react-native-template-typescript` with New Architecture flag
2. Enable Fabric + TurboModules in `android/gradle.properties` and `ios/Podfile`
3. Install core deps: `@reduxjs/toolkit`, `redux-saga`, `redux-persist`, `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-safe-area-context`, `react-native-screens`, `op-sqlite`
4. Configure TypeScript strict mode, ESLint + Prettier

---

## Phase 2 — Android TurboModule: `NotificationListenerService`

### Goal
Intercept UPI payment notifications from GPay, PhonePe, Paytm, BHIM/Amazon Pay/CRED in real-time and push them to JS.

### Steps
1. **`NotificationListenerService.kt`** — extend `android.service.notification.NotificationListenerService`, override `onNotificationPosted`. Filter by package names:
   - `com.google.android.apps.nbu.paisa.user` (GPay)
   - `com.phonepe.app`
   - `net.one97.paytm`
   - `in.org.npci.upiapp` (BHIM)
   - `com.amazon.mShop.android.shopping` (Amazon Pay)
   - `com.dreamplug.androidapp` (CRED)
2. **`NotificationListenerModule.kt`** — TurboModule (implements `NativeNotificationListenerSpec`). Exposes:
   - `startListening()` — registers the service
   - `stopListening()`
   - `requestPermission()` — opens `ACTION_NOTIFICATION_LISTENER_SETTINGS`
   - `hasPermission(): Promise<Boolean>`
   - Event emitter: `onNotificationReceived` fires with `{packageName, title, body, timestamp}`
3. **JS Spec** `NativeNotificationListener.ts` — typed TurboModule spec using `TurboModuleRegistry`
4. **`AndroidManifest.xml`** — declare `<service>` with `BIND_NOTIFICATION_LISTENER_SERVICE` permission
5. **`NotificationListenerPackage.kt`** — register in `MainApplication.kt`

---

## Phase 3 — iOS NativeModule: SMS Reader

### Goal
Read bank transaction SMS messages and surface them to JS (with user permission via `MFMessageComposeViewController` / `CNContactStore` is not available; use `react-native-sms-retriever` or direct `MessageUI` — on iOS, only received messages via `UserNotifications` or manual copy-paste are accessible without private API). 

**iOS SMS constraint**: iOS does not allow reading SMS inbox programmatically without private entitlements. The practical iOS approach is:
- **Primary**: Parse SMS-style push notifications from bank apps (using `UNUserNotificationCenter` delegate) — same idea as Android but for bank apps that send push notifications
- **Fallback**: Manual entry screen

### Steps
1. **`SmsReaderModule.swift`** — NativeModule. Exposes:
   - `requestPermission()` — requests `UNUserNotificationCenter` authorization
   - `hasPermission(): Promise<Boolean>`
2. In `AppDelegate.swift` — implement `UNUserNotificationCenterDelegate` to forward incoming notifications to JS via event emitter for known bank sender IDs
3. JS spec `NativeSmsReader.ts` — typed spec
4. **Manual Entry screen** (`AddExpenseScreen.tsx`) always available as fallback

---

## Phase 4 — Parser Layer

### `notificationParser.ts`

Input: `{ packageName, title, body, timestamp }`  
Output: `ParsedExpense | null`

Per-app regex patterns to extract:
- `amount: number` — rupee amount
- `merchant: string` — payee name / VPA
- `transactionType: 'debit' | 'credit'`
- `upiId: string | null`
- `bankRefId: string | null`
- `timestamp: number`
- `sourceApp: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'amazon_pay' | 'cred' | 'unknown'`

### `smsParser.ts`

Input: raw SMS string + sender  
Same output shape. Bank-specific regex patterns (HDFC, SBI, ICICI, Axis, Kotak common patterns).

---

## Phase 5 — Storage Layer

### Schema (`db/schema.ts`)
```ts
expenses: {
  id: string (uuid)
  amount: number
  merchant: string
  transaction_type: 'debit' | 'credit'
  upi_id: string | null
  bank_ref_id: string | null
  source_app: string
  raw_payload: string (JSON)
  category: string | null
  note: string | null
  timestamp: number
  created_at: number
}
```

Use `op-sqlite` with a repository pattern in `expenseRepository.ts`:
- `insertExpense(e: ParsedExpense): Promise<void>`
- `getAllExpenses(): Promise<Expense[]>`
- `getExpenseById(id: string): Promise<Expense | null>`
- `updateExpense(id, patch): Promise<void>`
- `deleteExpense(id): Promise<void>`

---

## Phase 6 — Redux Store

- **`expenseSlice.ts`**: state `{ expenses: Expense[], loading: boolean, error: string | null }`. Actions: `loadExpenses`, `addExpense`, `updateExpense`, `deleteExpense`.
- **`expenseSaga.ts`**: watches for `addExpense` action, calls `expenseRepository.insertExpense`, dispatches success/failure.
- **`persistConfig.ts`**: Redux Persist with MMKV storage adapter (fast, synchronous) for non-SQLite state (e.g., settings, auth token placeholder).
- Saga middleware wired in `store/index.ts`.

---

## Phase 7 — Navigation & Screens

```
RootNavigator
├── PermissionsScreen   ← shown once on first launch (Android: notification access; iOS: push permission)
├── AuthScreen          ← placeholder, always navigates forward
└── MainStack
    ├── HomeScreen      ← FlatList of expenses, sorted by timestamp desc
    └── AddExpenseScreen ← manual entry form (always accessible; primary on iOS)
```

- `HomeScreen` dispatches `loadExpenses` on mount, subscribes to Redux state.
- `AddExpenseScreen` dispatches `addExpense` with `source_app: 'manual'`.
- Both screens handle empty states.

---

## Phase 8 — Notification/SMS → Store Pipeline

### Android flow
```
NotificationListenerService.onNotificationPosted
  → NotificationListenerModule (TurboModule) emits event
    → JS: notificationParser.ts parses payload
      → Redux Saga: persists to SQLite + updates store
        → HomeScreen re-renders
```

### iOS flow
```
UNUserNotificationCenter delegate (AppDelegate)
  → SmsReaderModule emits event to JS
    → smsParser.ts (or notificationParser.ts for bank push)
      → same Redux Saga pipeline
```

---

## Critical Files to Create

| File | Purpose |
|---|---|
| `android/.../NotificationListenerService.kt` | Core Android service |
| `android/.../NotificationListenerModule.kt` | TurboModule implementation |
| `src/native/NativeNotificationListener.ts` | TurboModule JS spec |
| `src/parsers/notificationParser.ts` | Per-app regex parsing |
| `src/parsers/smsParser.ts` | Bank SMS regex parsing |
| `src/db/schema.ts` + `expenseRepository.ts` | SQLite layer |
| `src/store/expenseSlice.ts` + `expenseSaga.ts` | Redux state + side effects |
| `src/screens/HomeScreen.tsx` | Main expense list |
| `src/screens/AddExpenseScreen.tsx` | Manual entry |
| `src/screens/PermissionsScreen.tsx` | Permission gate |

---

## Verification

1. **Android**: Install app → grant Notification Listener permission → send a payment via GPay → expense appears in HomeScreen automatically.
2. **iOS**: Grant push notification permission → receive a bank transaction push → expense captured. Fallback: tap "+" → manual entry → expense saved.
3. **Parser unit tests**: Feed fixture notification strings for each UPI app → assert structured output matches expected `ParsedExpense`.
4. **Redux flow**: Dispatch `addExpense` in isolation → confirm saga writes to SQLite → confirm `loadExpenses` reads it back.
5. Run `yarn typecheck` and `yarn lint` clean before declaring done.

---

## Out of Scope (v1)

- Budget tracking, charts, analytics
- Cloud sync / backend
- Auth implementation (placeholder screen only)
- Multi-user / family sharing
- Duplicate detection / deduplication logic
