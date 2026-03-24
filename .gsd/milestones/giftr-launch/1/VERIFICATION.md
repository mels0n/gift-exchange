# Phase 1 Verification — Rebrand + Critical Bug Fix

## Must-Haves

- [x] Browser tab shows "Giftr" — VERIFIED (`title: 'Giftr'` in layout.tsx)
- [x] Login page heading shows "Giftr" — VERIFIED (h1 in login/page.tsx)
- [x] Landing page heading shows "🎄 Giftr" — VERIFIED (page.tsx)
- [x] docker-compose container_name is "giftr" — VERIFIED (docker-compose.yml)
- [x] package.json name is "giftr" — VERIFIED (package.json)
- [x] EMAIL_FROM default says "Giftr" — VERIFIED (process-queue.ts line 43)
- [x] requestOtp sends OTP when email matches a PENDING invite — VERIFIED (invite check added lines 30-35 of auth/api/actions.ts)
- [x] OTP email uses branded HTML — VERIFIED (otpHtml template in process-queue.ts)
- [x] OTP email subject is "Your Giftr Login Code" — VERIFIED (process-queue.ts line 65)
- [x] `npm run build` passes — VERIFIED

## Verdict: PASS
