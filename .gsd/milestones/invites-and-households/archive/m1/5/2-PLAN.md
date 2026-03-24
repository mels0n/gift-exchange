---
phase: 5
plan: 2
wave: 1
---

# Plan 5.2: Env Validation + Cron Auth

## Objective
Make startup failures obvious and protect the cron endpoint. Right now missing `RESEND_API_KEY` silently falls back to mock mode, and the cron auth check is commented out so any caller can trigger email processing.

## Context
- src/instrumentation.ts
- src/app/api/cron/route.ts

## Tasks

<task type="auto">
  <name>Add env var validation at startup</name>
  <files>
    src/instrumentation.ts
  </files>
  <action>
    Replace the current `src/instrumentation.ts` with a version that validates required env vars before starting the scheduler:

    ```ts
    export async function register() {
        if (process.env.NEXT_RUNTIME === 'nodejs') {
            // Validate required env vars at startup
            const missing: string[] = [];

            if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
            if (!process.env.RESEND_API_KEY) {
                console.warn('[Startup] RESEND_API_KEY is not set — emails will be mocked (logged to console only).');
            }
            if (!process.env.SESSION_SECRET) {
                console.warn('[Startup] SESSION_SECRET is not set — using insecure development default. Set this in production.');
            }

            if (missing.length > 0) {
                throw new Error(
                    `[Startup] Missing required environment variables: ${missing.join(', ')}. ` +
                    `Check your .env file or deployment configuration.`
                );
            }

            await import('./shared/lib/scheduler').then((m) => m.startScheduler());
        }
    }
    ```

    Note:
    - `DATABASE_URL` is required — throw if missing (Prisma will fail anyway, better to be explicit early)
    - `RESEND_API_KEY` — warn but don't throw (mock mode is intentional for local dev)
    - `SESSION_SECRET` — warn but don't throw (falls back to dev default, which is safe for local dev only)
    - Do NOT add validation for `CRON_SECRET` here — the cron route handles that itself
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -5</verify>
  <done>No TypeScript errors; instrumentation.ts throws on missing DATABASE_URL and warns on missing RESEND_API_KEY/SESSION_SECRET.</done>
</task>

<task type="auto">
  <name>Enforce cron endpoint authorization</name>
  <files>
    src/app/api/cron/route.ts
  </files>
  <action>
    In `src/app/api/cron/route.ts`, uncomment the `return` statement inside the auth check so it actually enforces the check when `CRON_SECRET` is set.

    Current broken state:
    ```ts
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Basic protection (optional for self-hosted inner loop)
        // return new NextResponse('Unauthorized', { status: 401 });
    }
    ```

    Replace the entire auth block with:
    ```ts
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    ```

    Also remove the stale comment. When `CRON_SECRET` is not set (local dev), the endpoint remains open — this is intentional.
  </action>
  <verify>grep -n "Unauthorized" src/app/api/cron/route.ts | grep -v "//"</verify>
  <done>The return statement is uncommented; grep shows an active (not commented-out) Unauthorized line.</done>
</task>

## Success Criteria
- [ ] `instrumentation.ts` throws with a clear message if `DATABASE_URL` is missing
- [ ] `instrumentation.ts` warns (does not throw) if `RESEND_API_KEY` or `SESSION_SECRET` is missing
- [ ] `/api/cron` returns 401 when `CRON_SECRET` is set and the request omits the correct Bearer token
- [ ] `/api/cron` remains open when `CRON_SECRET` is not set (local dev stays unchanged)
- [ ] `npm run build` passes
