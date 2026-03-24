---
phase: 5
plan: 2
status: complete
completed: 2026-03-23
---

# Summary: Plan 5.2 — Env Validation + Cron Auth

## What Was Done

### Task 1: Env validation at startup
- Replaced `src/instrumentation.ts` with a version that validates env vars before starting the scheduler
- `DATABASE_URL` missing → throws with clear message listing missing vars
- `RESEND_API_KEY` missing → warns (mock mode is intentional for local dev)
- `SESSION_SECRET` missing → warns (falls back to dev default)

### Task 2: Enforce cron auth
- Uncommented the `return new NextResponse('Unauthorized', { status: 401 })` in `src/app/api/cron/route.ts`
- When `CRON_SECRET` is set, requests without the correct `Authorization: Bearer <secret>` header are rejected
- When `CRON_SECRET` is not set, endpoint remains open (local dev unchanged)

## Verification
- `npx tsc --noEmit` — passed
- `npm run build` — passed
- `grep -n "Unauthorized" src/app/api/cron/route.ts | grep -v "//"` shows active line 7

## Commit
`feat(phase-5): env validation at startup and enforce cron auth`
