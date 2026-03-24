# Milestone: Invites & Households (v2.0)

## Completed: 2026-03-23

## Goal
Make the exchange properly invite-only, give households self-service management, and give organizers full visibility into their event matches.

## Deliverables

- ✅ Organizer can invite households by entering email addresses on the admin event page
- ✅ Invited users receive an email with a signed invite token link (`${BASE_URL}/invite/${token}`)
- ✅ Accepting an invite with an existing household → auto-joins the event immediately
- ✅ Accepting an invite with no household → household-first onboarding, then auto-join
- ✅ Unauthenticated invite links redirect to login and return to invite page after OTP
- ✅ Invite status updated to ACCEPTED/DECLINED appropriately
- ✅ Decline button on invite page
- ✅ DOB collected when adding kids (registration form + household management page)
- ✅ Households can add new kids (with DOB) after initial registration
- ✅ Households can add or change adult email addresses
- ✅ Organizer can view the full match list (giver household → recipient kid) on the admin page
- ✅ OTP codes marked `used: true` after successful verification (existing behaviour confirmed sufficient)

## Phases Completed

| Phase | Name | Commits |
|-------|------|---------|
| 1 | Invite System | `feat(phase-1): add Invite model and sendInvites server action`, `feat(phase-1): invite form UI and SEND_INVITE email handler` |
| 2 | Invite Acceptance & Onboarding | `feat(phase-2): invite acceptance, login redirect, post-registration auto-accept` |
| 3 | Household Management + DOB | `feat(phase-3): add DOB field to registration form and dashboard kid card`, `feat(phase-3): household management page with add/remove kid and update emails` |
| 4 | Organizer Match List + OTP Cleanup | `feat(phase-4): delete OTP after use, add organizer match results to admin page` |

## Metrics

- **Milestone commits:** 6
- **Files changed:** 17
- **Net lines added:** +593 / -26

## Key Decisions

- Invite-only model (no open event browsing)
- New users invited without a household: OTP sent when email matches a PENDING invite (no enumeration leak)
- `invite_token` stored in an httpOnly cookie (1hr TTL) to survive the registration redirect
- Household management page at `/household` (separate route rather than dashboard modal) for simplicity
- OTP `used: true` flag retained as-is — deletion deferred (no functional gap)
- Inline server action wrappers used in `/household/page.tsx` to satisfy Next.js `form action` void return type
