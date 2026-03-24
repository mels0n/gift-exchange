# Summary: Plan 2.2 — Login Redirect + Post-Registration Auto-Accept

## What Was Done

**Login redirect:**
- `src/app/login/page.tsx` — Made async, reads `searchParams.redirect`, passes as `redirectTo` prop to `<LoginForm>`.
- `src/features/auth/ui/LoginForm.tsx` — Accepts `{ redirectTo?: string }` prop; passes it to `verifyOtp(email, code, redirectTo)`.
- `src/features/auth/api/actions.ts` — `verifyOtp` signature changed to `(email, code, redirectTo = '/dashboard')`; redirects to `redirectTo` instead of hardcoded `/dashboard`.

**Post-registration auto-accept:**
- `src/features/register-household/api/actions.ts` — After household creation, reads `invite_token` cookie. If present and invite is PENDING: fetches new household with kids, creates Participation (all kids), marks invite ACCEPTED. Clears cookie regardless of whether invite was valid.
- Added `import { cookies } from 'next/headers'`.

## Verification

`npx tsc --noEmit && npm run build` — passed, `/invite/[token]` and `/login` both listed as dynamic routes.
