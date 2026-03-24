---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: OTP Storage & Verification

## Objective
Replace the hardcoded `'123456'` OTP verification with a real DB-backed flow: generate a code, store it with an expiry, verify it on submission, and mark it used. This makes login actually functional.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- prisma/schema.prisma
- src/features/auth/api/actions.ts
- src/features/auth/ui/LoginForm.tsx
- src/shared/api/db.ts

## Tasks

<task type="auto">
  <name>Add OtpCode model to Prisma schema and migrate</name>
  <files>prisma/schema.prisma</files>
  <action>
    Add the following model to prisma/schema.prisma:

    ```prisma
    model OtpCode {
      id        String   @id @default(uuid())
      email     String
      code      String
      expiresAt DateTime
      used      Boolean  @default(false)
      createdAt DateTime @default(now())
    }
    ```

    Then run: `npx prisma migrate dev --name add-otp-codes`

    This stores OTP codes with expiry (10 minutes) so they can be verified and invalidated after use.
  </action>
  <verify>npx prisma validate && npx prisma generate</verify>
  <done>
    - `prisma/schema.prisma` contains the `OtpCode` model
    - Migration file exists under `prisma/migrations/`
    - `@prisma/client` regenerated with `OtpCode` type
  </done>
</task>

<task type="auto">
  <name>Update auth server actions to store and verify OTP from DB</name>
  <files>src/features/auth/api/actions.ts</files>
  <action>
    Replace the placeholder logic in `requestOtp` and `verifyOtp`:

    **`requestOtp`:**
    1. Keep the existing email validation via `LoginSchema`.
    2. Keep the household existence check (it gates who can log in).
    3. After generating `code`, create an `OtpCode` record:
       ```ts
       await db.otpCode.create({
           data: {
               email,
               code,
               expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
           }
       });
       ```
    4. Keep the `SEND_OTP` Job creation — the queue sends the actual email.
    5. Return `{ success: true, email }` as before.

    **`verifyOtp`:**
    Replace the hardcoded check entirely:
    ```ts
    const otpRecord = await db.otpCode.findFirst({
        where: {
            email,
            code,
            used: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
        return { error: 'Invalid or expired code.' };
    }

    await db.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
    });
    ```
    Then proceed to set the session cookie and redirect as before.

    Do NOT change the session cookie format in this task — that is Plan 1.2.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>
    - `requestOtp` creates an `OtpCode` row in the database
    - `verifyOtp` queries the DB, rejects expired/used codes, marks code as used on success
    - Hardcoded `'123456'` check is gone
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Remove dev hint from LoginForm</name>
  <files>src/features/auth/ui/LoginForm.tsx</files>
  <action>
    Remove the line:
    ```tsx
    <p className="text-xs text-center text-white/30 pt-2">Dev Hint: Use 123456</p>
    ```
    This hint only made sense with the hardcoded code. Now that real OTP is in place, it's misleading.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>
    - The "Dev Hint: Use 123456" paragraph is removed from LoginForm.tsx
    - No other changes to the component
  </done>
</task>

## Success Criteria
- [ ] `OtpCode` table exists in the database after migration
- [ ] Requesting OTP creates a row in `OtpCode` with a 10-minute expiry
- [ ] Submitting the correct code within 10 minutes logs the user in
- [ ] Submitting an incorrect, expired, or already-used code returns an error
- [ ] `npx tsc --noEmit` passes
