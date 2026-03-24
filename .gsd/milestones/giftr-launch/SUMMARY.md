# Milestone: Giftr Launch (v3.0)

## Completed: 2026-03-23

## Deliverables
- ✅ App named "Giftr" everywhere (layout, login, landing, package.json, docker-compose)
- ✅ New invited users (no household) can request and receive an OTP and log in
- ✅ OTP email styled to match Giftr brand (dark HTML, monospace code)
- ✅ Organizer can see invite status (PENDING / ACCEPTED / DECLINED) per event
- ✅ Organizer can send a reminder to PENDING invites
- ✅ Invited user can decline an invite
- ✅ Household receives a confirmation email when they accept an invite
- ✅ Organizer page titled "My Events", global stat cards removed
- ✅ Form errors shown inline (no browser alert() dialogs) — 8 components updated
- ✅ Secret Santa algorithm implemented (Sattolo derangement — no self-draw)
- ✅ Event creator selects matching strategy at creation time (Cousin Exchange / Secret Santa)
- ✅ Reveal page contextualised for the active strategy (Secret Santa shows recipient family)
- ✅ GET /api/health returns { status: 'ok' } (fixes docker-compose healthcheck)
- ✅ .env.example documents all required environment variables
- ✅ SESSION_SECRET and NEXT_PUBLIC_BASE_URL enforced at startup (throw, not warn)

## Phases Completed
1. Phase 1: Rebrand + Critical Bug Fix — 2026-03-23
2. Phase 2: Invite Status + Actions — 2026-03-23
3. Phase 3: Organizer Page Polish + Error Feedback — 2026-03-23
4. Phase 4: Secret Santa + Algo Picker — 2026-03-23
5. Phase 5: Production Hardening — 2026-03-23

## Metrics
- Commits (this milestone): 10
- Key files changed: ~20
- Duration: 1 session

## Key Decisions
- SecretSantaStrategy uses Sattolo cycle algorithm (not Fisher-Yates) — guarantees true derangement where no household draws itself, not just probabilistically unlikely.
- .env.example force-added to git via `git add -f` because .gitignore uses `.env*` glob — kept the glob but exception-added the example file.
- RESEND_API_KEY kept as warn-only (not required) so local dev works without email credentials; SESSION_SECRET and NEXT_PUBLIC_BASE_URL are actively dangerous/broken without values so they throw.
