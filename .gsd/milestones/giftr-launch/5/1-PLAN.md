---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Production Hardening

## Objective
Three small but deployment-critical fixes: a `/api/health` route so docker-compose healthchecks stop 404-ing, a `.env.example` so anyone cloning the repo knows what to set, and enforcement of `SESSION_SECRET` + `NEXT_PUBLIC_BASE_URL` at startup (currently they silently fall back to insecure/wrong defaults in production).

## Context
- src/instrumentation.ts
- src/app/api/ (route pattern reference)

## Tasks

<task type="auto">
  <name>Create /api/health route + .env.example</name>
  <files>
    src/app/api/health/route.ts
    .env.example
  </files>
  <action>
    **1. Create `src/app/api/health/route.ts`:**

    ```ts
    import { NextResponse } from 'next/server';

    export function GET() {
        return NextResponse.json({ status: 'ok' });
    }
    ```

    **2. Create `.env.example`** at the project root:

    ```
    # Database
    # Absolute path to the SQLite file (or a PostgreSQL URL if migrating)
    DATABASE_URL="file:./dev.db"

    # Authentication
    # Random 32+ character secret used to sign session cookies
    # Generate with: openssl rand -hex 32
    SESSION_SECRET="change-me-to-a-random-secret"

    # Email (Resend)
    # Get a key at https://resend.com — omit or use a non-re_ value to mock emails
    RESEND_API_KEY="re_your_key_here"
    EMAIL_FROM="Giftr <no-reply@yourdomain.com>"

    # App URL (used in email links)
    # No trailing slash
    NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

    # Cron security
    # Random secret sent as Authorization header by the cron caller
    # Leave unset to disable auth (dev only)
    CRON_SECRET="change-me-to-a-random-secret"
    ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; src/app/api/health/route.ts exists; .env.example exists at project root.</done>
</task>

<task type="auto">
  <name>Enforce SESSION_SECRET + NEXT_PUBLIC_BASE_URL at startup</name>
  <files>
    src/instrumentation.ts
  </files>
  <action>
    Replace the current validation block so `SESSION_SECRET` and `NEXT_PUBLIC_BASE_URL` are required (throw on missing) instead of just warned:

    Replace the entire `register` function body with:

    ```ts
    export async function register() {
        if (process.env.NEXT_RUNTIME === 'nodejs') {
            // Validate required env vars at startup
            const missing: string[] = [];

            if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
            if (!process.env.SESSION_SECRET) missing.push('SESSION_SECRET');
            if (!process.env.NEXT_PUBLIC_BASE_URL) missing.push('NEXT_PUBLIC_BASE_URL');

            if (!process.env.RESEND_API_KEY) {
                console.warn('[Startup] RESEND_API_KEY is not set — emails will be mocked (logged to console only).');
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

    Note: `RESEND_API_KEY` stays as a warning (not required) because the app functions fine with mocked emails during local dev. `SESSION_SECRET` and `NEXT_PUBLIC_BASE_URL` are now required because their defaults (`'dev-secret-change-me'` and `'http://localhost:3000'`) are actively dangerous or broken in production.
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -6</verify>
  <done>Build passes; instrumentation.ts throws on missing SESSION_SECRET or NEXT_PUBLIC_BASE_URL; RESEND_API_KEY is still warn-only.</done>
</task>

## Success Criteria
- [ ] `GET /api/health` returns `{ status: 'ok' }` (fixes docker-compose healthcheck 404)
- [ ] `.env.example` exists at project root with all 6 vars documented
- [ ] `SESSION_SECRET` missing → startup throws (not warns)
- [ ] `NEXT_PUBLIC_BASE_URL` missing → startup throws (not warns)
- [ ] `RESEND_API_KEY` missing → still just a console.warn (mocked emails allowed)
- [ ] `npm run build` passes
