---
milestone: giftr-launch
version: 3.0.0
updated: 2026-03-23
---

# Roadmap — Giftr Launch

> **Milestone Goal:** Ship a fully branded, production-ready app. Fix the invite login bug, give organizers invite visibility and reminders, add Secret Santa as a second matching strategy, and harden the container for deployment.
> **Current Phase:** — Not started
> **Status:** ⬜ Planning

## Must-Haves

- [ ] App is named "Giftr" everywhere (pages, emails, metadata, container)
- [ ] New invited users (no household yet) can request and receive an OTP and log in
- [ ] OTP email is styled to match the app brand
- [ ] Organizer can see invite status (PENDING / ACCEPTED / DECLINED) per event
- [ ] Organizer can send a reminder to PENDING invites
- [ ] Invited user can decline an invite
- [ ] Household receives a confirmation email when they accept an invite
- [ ] Organizer page titled "My Events", global stat cards removed
- [ ] Form errors shown inline (no browser alert() dialogs)
- [ ] Secret Santa algorithm implemented and usable
- [ ] Event creator selects matching strategy at creation time
- [ ] Reveal page contextualised for the active strategy
- [ ] `/api/health` route exists (fixes docker-compose healthcheck)
- [ ] `.env.example` documents all required environment variables
- [ ] `SESSION_SECRET` and `NEXT_PUBLIC_BASE_URL` enforced at startup

## Nice-to-Haves

- [ ] Event history / archived events view
- [ ] Multiple households per person
- [ ] Age-group matching strategy

---

## Phases

### Phase 1: Rebrand + Critical Bug Fix
**Status:** ✅ Complete
**Objective:** Rename the app to Giftr across all surfaces and fix the blocking invite login bug that prevents new users from ever receiving an OTP.

**Deliverables:**
- Update all "Family Gift Exchange" / "Cousin Exchange" app name references to "Giftr" — `layout.tsx`, `page.tsx` (landing), `login/page.tsx`, `docker-compose.yml`, `package.json`, email templates in `process-queue.ts`
- Fix `requestOtp`: when an email has no household, check for a PENDING invite — if found, create OTP and enqueue `SEND_OTP` job (currently returns fake-success with no code sent)
- Style OTP email HTML to match the branded dark aesthetic used in invite and match emails

---

### Phase 2: Invite Status + Actions
**Status:** ✅ Complete
**Objective:** Give organizers visibility into who has accepted, declined, or not yet responded to invites. Allow re-sending reminders. Add decline flow for invitees. Send confirmation email on accept.
**Depends on:** Phase 1

**Deliverables:**
- Invite list per event on organizer page: shows email, status badge (PENDING/ACCEPTED/DECLINED), and "Remind" button for PENDING invites
- `remindInvite` server action: re-enqueues a `SEND_INVITE` job for a PENDING invite
- `DeclineInviteButton` component + `declineInvite` action wired to `/invite/[token]` page
- `SEND_JOIN_CONFIRMATION` job type + email handler: sent when a household accepts an invite

---

### Phase 3: Organizer Page Polish + Error Feedback
**Status:** ✅ Complete
**Objective:** Clean up the organizer page and replace all browser alert() dialogs with inline error messages.

**Deliverables:**
- Rename "Admin Operations" heading → "My Events"; remove global stat cards (household count, all events count, pending jobs)
- Replace `alert(res.error)` calls in all client components with inline error state (red text below the relevant form/button)
- Components affected: `HouseholdRegistrationForm`, `AcceptInviteButton`, any others using alert()

---

### Phase 4: Secret Santa + Algo Picker
**Status:** ✅ Complete
**Objective:** Implement Secret Santa as a second matching strategy and let the event creator choose which algorithm to use.

**Deliverables:**
- `SecretSantaStrategy` class: each household assigned to buy for all kids of exactly one other household (random derangement — no household draws itself)
- Strategy selector added to `CreateEventForm` (dropdown: "Cousin Exchange" / "Secret Santa")
- `runMatching` server action updated to instantiate the correct strategy based on `event.strategy`
- Reveal page shows strategy-appropriate context (Secret Santa: emphasises the one assigned family; Cousin Exchange: current multi-recipient layout)

---

### Phase 5: Production Hardening
**Status:** ✅ Complete
**Objective:** Ensure the app deploys cleanly in Docker with no missing configuration surprises.

**Deliverables:**
- `GET /api/health` route returning `{ status: 'ok' }` (fixes docker-compose healthcheck which currently 404s)
- `.env.example` with all required vars documented: `DATABASE_URL`, `RESEND_API_KEY`, `SESSION_SECRET`, `NEXT_PUBLIC_BASE_URL`, `EMAIL_FROM`, `CRON_SECRET`
- `SESSION_SECRET` added to startup env validation (currently falls back silently to `'dev-secret-change-me'`)
- `NEXT_PUBLIC_BASE_URL` added to startup env validation (currently falls back to `http://localhost:3000` in prod)

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ✅ | 2/2 | 2026-03-23 |
| 2 | ✅ | 2/2 | 2026-03-23 |
| 3 | ✅ | 2/2 | 2026-03-23 |
| 4 | ✅ | 2/2 | 2026-03-23 |
| 5 | ✅ | 1/1 | 2026-03-23 |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1 | — | — | — |
| 2 | — | — | — |
| 3 | — | — | — |
| 4 | — | — | — |
| 5 | — | — | — |

---

## Completed Milestones

| Milestone | Version | Completed |
|-----------|---------|-----------|
| Complete Implementation | v1.0 | 2026-03-23 |
| Invites & Households | v2.0 | 2026-03-23 |
