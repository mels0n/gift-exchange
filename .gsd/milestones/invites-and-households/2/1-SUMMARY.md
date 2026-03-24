# Summary: Plan 2.1 — Invite Acceptance Page + Action

## What Was Done

Created the `/invite/[token]` route with three files:

- `src/app/invite/[token]/page.tsx` — Server component. Looks up invite by token; returns invalid message if not PENDING. Redirects unauthenticated users to `/login?redirect=/invite/${token}`. If user has no household, sets `invite_token` cookie (1hr TTL) and redirects to `/dashboard`. Otherwise shows event name + Accept button.
- `src/app/invite/[token]/AcceptInviteButton.tsx` — Client component that calls `acceptInvite(token)` and surfaces any error via alert.
- `src/app/invite/[token]/actions.ts` — `acceptInvite` server action. Validates invite is PENDING, finds user's household, creates Participation with all kids, marks invite ACCEPTED, redirects to `/dashboard`.

## Verification

`npx tsc --noEmit` — no errors.
