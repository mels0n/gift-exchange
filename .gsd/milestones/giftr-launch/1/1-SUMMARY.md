# Plan 1.1 Summary — Rename to Giftr + Fix OTP Bug

## Status: Complete

## What Was Done
- `layout.tsx` — title → "Giftr", description updated
- `page.tsx` — landing heading → "🎄 Giftr"
- `login/page.tsx` — h1 → "Giftr"
- `docker-compose.yml` — container_name → "giftr"
- `package.json` — name → "giftr"
- `process-queue.ts` — EMAIL_FROM default → "Giftr <no-reply@resend.dev>"
- `auth/api/actions.ts` — `requestOtp` now checks for PENDING invite before fake-success return; invited-but-unregistered users now receive an OTP

## Verification
- grep confirms no old app-name references remain in source files
- `npx tsc --noEmit` — passed
- Committed: `feat(phase-1): rename app to Giftr and fix OTP for invited users`
