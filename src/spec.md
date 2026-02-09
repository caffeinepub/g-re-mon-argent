# Specification

## Summary
**Goal:** Make logout explicitly support switching Internet Identity accounts by signing out, clearing local/offline data, and returning to the Welcome screen from any main screen.

**Planned changes:**
- Add a clear “Switch account” / logout action that signs the user out of Internet Identity (using the existing hook `clear()` method) and returns the app to the Welcome screen.
- Show an English confirmation dialog before completing logout; if pending offline actions exist, warn they will be cleared to avoid mixing data between accounts.
- On confirm, clear the IndexedDB offline action queue, clear any optimistic/offline local sales/expenses data, and clear React Query cached data so nothing leaks to the next account.
- Expose the same switch-account/logout action consistently anywhere the TopBar appears (Dashboard, Add Sale, Add Expense, Daily Summary, Monthly Goal) with identical behavior.

**User-visible outcome:** From any main screen, the user can choose “Switch account,” confirm sign-out (with a warning if offline actions are pending), and the app returns to the Welcome screen with no prior account’s queued/offline/cached data visible before logging in again.
