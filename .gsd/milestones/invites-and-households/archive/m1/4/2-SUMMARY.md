---
phase: 4
plan: 2
status: complete
completed: 2026-03-23
---

# Summary: Plan 4.2 — Organizer View + Deadline Enforcement

## What Was Done

### Task 1: Organizer participant view
- Added `myEventIds` / `myParticipations` queries to `AdminPage` — fetches participations for events the current user created, including household and event relations
- Added "Participants in Your Events" section to admin page, listing household name, event name, and kid count — only shown when there are participants

### Task 2: Deadline enforcement
- Added deadline check to `joinEvent` in `src/features/register-household/api/actions.ts`
- Returns `{ error: 'Registration deadline has passed.' }` if `new Date() > event.regDeadline`
- Check is placed after the existing event validity guard, using the already-loaded `event` object

## Verification
- `npx tsc --noEmit` — passed
- `npm run build` — passed

## Commit
`feat(phase-4): organizer participant view and deadline enforcement`
