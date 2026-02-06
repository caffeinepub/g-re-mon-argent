# Specification

## Summary
**Goal:** Build “Gère Mon Argent”, a mobile-first single-user cashbook web app for Guinea (GNF) with Internet Identity login, simple visual UI, offline-first entry, and automatic syncing.

**Planned changes:**
- Implement a single Motoko backend actor with per-Principal data storage for user profile, sales, expenses, and monthly goals (integer GNF amounts), including CRUD and summary/computed query endpoints for dashboard, daily summary, and goal progress.
- Create a mobile-first frontend with 7 screens and a low-literacy navigation flow: Welcome (language selection), Profile Setup (first name + activity type icons), Dashboard (greeting + today cash + primary actions), Add Sale, Add Expense, Daily Summary, Monthly Goal (set goal + progress + remaining).
- Add offline-first behavior on the frontend: queue writes locally (persist across refresh), optimistic UI updates, automatic sync on reconnect, and clear offline/online + “Sync pending” indicators.
- Wire frontend to backend using Internet Identity; require profile creation before accessing main dashboard actions; isolate all reads/writes to the authenticated user.
- Implement consistent automatic calculations (available cash, daily profit, monthly goal progress with safe handling for missing/0 goals) and format all displayed amounts with thousands separators and “GNF”.
- Apply the requested visual design system (blue/green/orange, large buttons and icons, simple typography) and include minimal performance visuals (goal progress bar + simple profit status cue).

**User-visible outcome:** Users can sign in, set up their profile, record sales and expenses (even offline), see today’s cash and daily profit, set a monthly goal with a progress bar, and have offline entries automatically synced when connectivity returns.
