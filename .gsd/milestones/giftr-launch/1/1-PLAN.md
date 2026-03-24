---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Rename to Giftr + Fix OTP Bug

## Objective
Two tightly related changes: (1) rename the app from "Family Gift Exchange" / "Cousin Exchange" to "Giftr" across all user-facing surfaces, and (2) fix the critical bug where invited-but-unregistered users never receive an OTP and can never log in.

Note: The algorithm name "Cousin Exchange" and its file/class names (`cousin-exchange.ts`, `CousinExchangeStrategy`) are NOT changed — those describe the strategy, not the app.

## Context
- src/app/layout.tsx — metadata title/description
- src/app/page.tsx — landing page heading
- src/app/login/page.tsx — "Cousin Exchange" app name heading
- docker-compose.yml — container_name: cousin-exchange
- package.json — "name": "temp_app"
- src/features/auth/api/actions.ts — requestOtp bug (lines 28-31)
- src/features/admin-scheduler/api/process-queue.ts — EMAIL_FROM default fallback

## Tasks

<task type="auto">
  <name>Rename app to Giftr across all surfaces</name>
  <files>
    src/app/layout.tsx
    src/app/page.tsx
    src/app/login/page.tsx
    docker-compose.yml
    package.json
    src/features/admin-scheduler/api/process-queue.ts
  </files>
  <action>
    Make the following targeted changes:

    **`src/app/layout.tsx`:**
    - `title: 'Family Gift Exchange'` → `title: 'Giftr'`
    - `description: 'A private gift exchange organiser for families...'` → `'Giftr — a private gift exchange organiser for families. Create events, invite households, and let the algorithm handle the matching.'`

    **`src/app/page.tsx`:**
    - `🎄 Family Gift Exchange` heading → `🎄 Giftr`

    **`src/app/login/page.tsx`:**
    - `Cousin Exchange` heading (the large h1) → `Giftr`
    - `The thoughtful way to give.` tagline — keep as-is (it works for Giftr)

    **`docker-compose.yml`:**
    - `container_name: cousin-exchange` → `container_name: giftr`

    **`package.json`:**
    - `"name": "temp_app"` → `"name": "giftr"`

    **`src/features/admin-scheduler/api/process-queue.ts`:**
    - `const from = process.env.EMAIL_FROM ?? 'Gift Exchange <no-reply@resend.dev>';`
    - → `const from = process.env.EMAIL_FROM ?? 'Giftr <no-reply@resend.dev>';`

    Do NOT rename any of the following — they are algorithm identifiers, not app name:
    - `CousinExchangeStrategy` class
    - `cousin-exchange.ts` file
    - `COUSIN_EXCHANGE` strategy constant
    - Any text in `docs/` directory
  </action>
  <verify>
    grep -rn "Family Gift Exchange\|\"name\": \"temp_app\"\|container_name: cousin-exchange" --include="*.tsx" --include="*.ts" --include="*.json" --include="*.yml" src/ package.json docker-compose.yml
  </verify>
  <done>
    - grep returns no matches (all app-name references updated)
    - `npm run build` passes with no type errors
  </done>
</task>

<task type="auto">
  <name>Fix requestOtp for invited-but-unregistered users</name>
  <files>src/features/auth/api/actions.ts</files>
  <action>
    In `requestOtp`, the current early-return block at lines 28-31 is:

    ```ts
    if (!household) {
        // Return success anyway to avoid email enumeration
        return { success: true, email };
    }
    ```

    Replace it with:

    ```ts
    if (!household) {
        // Allow OTP for invited users who haven't registered yet
        const pendingInvite = await db.invite.findFirst({
            where: { email, status: 'PENDING' },
        });
        if (!pendingInvite) {
            // No household, no invite — return fake success to avoid email enumeration
            return { success: true, email };
        }
        // Has a pending invite — fall through to send OTP
    }
    ```

    The OTP creation + job enqueue code that follows (lines 34-51) already runs unconditionally after this block, so no further changes are needed. The fix works by only keeping the early return when there is genuinely nothing to do.

    Do NOT change the OTP generation logic, the job enqueue, or the return value shape.
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>
    - No TypeScript errors
    - `requestOtp` creates OtpCode + Job for emails with PENDING invites but no household
    - `requestOtp` still returns fake success for emails with neither household nor invite
  </done>
</task>

## Success Criteria
- [ ] Browser tab shows "Giftr" (not "Family Gift Exchange")
- [ ] Login page heading shows "Giftr" (not "Cousin Exchange")
- [ ] Landing page heading shows "Giftr"
- [ ] docker-compose container_name is "giftr"
- [ ] package.json name is "giftr"
- [ ] EMAIL_FROM default says "Giftr"
- [ ] `requestOtp` sends OTP when email matches a PENDING invite
- [ ] `npm run build` passes
