---
phase: 1
plan: 1
status: complete
completed: 2026-03-23
---

# Summary: Plan 1.1 — Invite DB Model + Server Action

## What Was Done

### Task 1: Invite schema
- Added `invites Invite[]` relation to `Event` model
- Added `Invite` model with: id, eventId (FK → Event), email, token (unique UUID), status (PENDING/ACCEPTED/DECLINED), createdAt
- Compound unique on `[eventId, email]` prevents duplicate invites
- Migration `20260323203740_add_invite` applied

### Task 2: sendInvites server action
- Added `sendInvites(formData)` to `src/app/admin/actions.ts`
- Validates organizer ownership before proceeding
- Splits emails on newlines and commas, trims + lowercases
- Skips duplicates silently using `findUnique` on the compound key
- Creates `Invite` record + enqueues `SEND_INVITE` job per new invite
- Returns `{ success: true, sent: N }`

## Verification
- `npx prisma migrate status` — up to date
- `npx tsc --noEmit` — passed

## Commit
`feat(phase-1): add Invite model and sendInvites server action`
