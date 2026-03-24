# SPEC.md — Gift Exchange Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision

A private web app for organizing family gift exchanges using the "Cousin Exchange" strategy. Households register their kids, parents receive email OTP codes to log in, an admin runs the matching algorithm to assign each household a list of other kids to buy for, and households see their assignments on a reveal page. The system handles all coordination — registration, matching, and email notifications — so no family member sees anyone else's assignment.

## Goals

1. **Working Auth** — Passwordless OTP login that actually stores and verifies codes; signed session cookies safe for production.
2. **Event Lifecycle** — Admin can create events, households register participation, admin triggers matching, status gates each step.
3. **Match Notifications** — Matched households receive an email with their assignments; the reveal page shows kids + budget math.
4. **Production Ready** — Deployable via Docker with real email, env validation, and a proper landing page.

## Non-Goals (Out of Scope)

- Multi-event support in the participant UI (MVP assumes one active event)
- White Elephant or Secret Santa strategies (documented as future work)
- Real-time updates (polling/websockets)
- Mobile app
- Payment processing or gift list management

## Constraints

- SQLite only — no migration to Postgres for MVP
- Resend for email — no other email provider
- Self-hosted or Vercel deployment via existing Dockerfile / docker-compose
- No external auth provider (Auth.js, Clerk, etc.) — keep OTP-based auth

## Success Criteria

- [ ] A new user can visit `/login`, enter their email, receive a real OTP email, enter the code, and land on `/dashboard`
- [ ] A registered household can see their kids and event status on `/dashboard`
- [ ] Admin can trigger matching from `/admin` and all households receive match notification emails
- [ ] Household visits `/reveal` and sees their assigned kids plus correct budget/item totals
- [ ] App builds cleanly (`npm run build`) with no type errors
- [ ] All critical env vars are validated at startup

## User Stories

### As a household parent
- I want to log in with my email (no password) so that I don't need to manage credentials
- I want to register my household and kids so that we can participate in the exchange
- I want to receive an email showing which kids I'm buying for so that I know my assignment

### As the event admin
- I want to create and configure a gift exchange event so that families can register
- I want to trigger the matching algorithm when registration closes so that assignments are made
- I want to manually trigger email processing so that I can control when notifications go out

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| OTP stored in DB and verified | Must-have | Currently hardcoded to '123456' |
| Session cookie signed/encrypted | Must-have | Currently plain JSON |
| Admin page requires auth | Must-have | Currently publicly accessible |
| `SEND_MATCH` email job implemented | Must-have | Currently empty stub |
| Admin: create Event + trigger matching | Must-have | No UI exists |
| Dashboard: Event Participation Card | Should-have | TODO comment in code |
| Kid age calculated from DOB | Should-have | Currently hardcoded to 0 |
| Landing page (`/`) | Should-have | Still default Next.js template |
| Env var validation at startup | Should-have | No validation exists |

---

*Last updated: 2026-03-23*
