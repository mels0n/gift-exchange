---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Signed Session Cookie + Admin Auth Guard

## Objective
Harden the session cookie by signing it with HMAC-SHA256 (using `SESSION_SECRET` env var) so it can't be forged. Add an auth guard to the admin page so it's not publicly accessible.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/features/auth/api/actions.ts
- src/app/dashboard/page.tsx
- src/app/reveal/page.tsx
- src/app/admin/page.tsx
- src/shared/api/db.ts

## Tasks

<task type="auto">
  <name>Create session helper with HMAC signing</name>
  <files>src/shared/lib/session.ts</files>
  <action>
    Create a new file `src/shared/lib/session.ts` with two functions:

    ```ts
    import { createHmac } from 'crypto';
    import { cookies } from 'next/headers';
    import { redirect } from 'next/navigation';

    const SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-me';
    const COOKIE = 'session_id';

    function sign(payload: string): string {
        const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
        return `${payload}.${sig}`;
    }

    function unsign(value: string): string | null {
        const lastDot = value.lastIndexOf('.');
        if (lastDot === -1) return null;
        const payload = value.slice(0, lastDot);
        const expected = sign(payload);
        // Constant-time comparison via length + every char
        if (value.length !== expected.length) return null;
        let diff = 0;
        for (let i = 0; i < value.length; i++) {
            diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
        }
        return diff === 0 ? payload : null;
    }

    export async function setSession(email: string) {
        const payload = JSON.stringify({ email });
        const signed = sign(payload);
        const cookieStore = await cookies();
        cookieStore.set(COOKIE, signed, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: 'lax',
        });
    }

    export async function getSession(): Promise<{ email: string } | null> {
        const cookieStore = await cookies();
        const raw = cookieStore.get(COOKIE)?.value;
        if (!raw) return null;
        const payload = unsign(raw);
        if (!payload) return null;
        try {
            return JSON.parse(payload) as { email: string };
        } catch {
            return null;
        }
    }

    export async function requireSession(redirectTo = '/login'): Promise<{ email: string }> {
        const session = await getSession();
        if (!session) redirect(redirectTo);
        return session;
    }
    ```

    Notes:
    - Uses Node's built-in `crypto` — no new dependencies
    - The constant-time comparison prevents timing attacks
    - `SESSION_SECRET` falls back to a dev default so local dev still works without `.env`
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>
    - `src/shared/lib/session.ts` exists with `setSession`, `getSession`, `requireSession` exports
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Update auth actions and pages to use session helper</name>
  <files>
    src/features/auth/api/actions.ts,
    src/app/dashboard/page.tsx,
    src/app/reveal/page.tsx,
    src/app/admin/page.tsx
  </files>
  <action>
    **`src/features/auth/api/actions.ts`** — in `verifyOtp`, replace the manual `cookieStore.set(...)` call with:
    ```ts
    import { setSession } from '@/shared/lib/session';
    // ...
    await setSession(email);
    redirect('/dashboard');
    ```
    Remove the direct `cookies()` import if it's no longer used elsewhere in this file.

    **`src/app/dashboard/page.tsx`** — replace the manual cookie read:
    ```ts
    // Remove:
    const cookieStore = await cookies();
    const session = cookieStore.get('session_id');
    if (!session) redirect('/login');
    const { email } = JSON.parse(session.value);

    // Replace with:
    import { requireSession } from '@/shared/lib/session';
    const { email } = await requireSession();
    ```

    **`src/app/reveal/page.tsx`** — same replacement pattern as dashboard.

    **`src/app/admin/page.tsx`** — add an auth guard at the top using the `ADMIN_EMAILS` env var:
    ```ts
    import { getSession } from '@/shared/lib/session';
    import { redirect } from 'next/navigation';

    // At the top of AdminPage():
    const session = await getSession();
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
    if (!session || (adminEmails.length > 0 && !adminEmails.includes(session.email))) {
        redirect('/login');
    }
    ```
    When `ADMIN_EMAILS` is empty (local dev), all logged-in users can access admin. In production, set `ADMIN_EMAILS=you@example.com` to restrict.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>
    - `verifyOtp` uses `setSession()` — no manual cookie writes
    - `dashboard/page.tsx` uses `requireSession()` — no manual cookie reads
    - `reveal/page.tsx` uses `requireSession()` — no manual cookie reads
    - `admin/page.tsx` redirects unauthenticated/unauthorized users to `/login`
    - TypeScript compiles cleanly
    - `npm run build` succeeds
  </done>
</task>

## Success Criteria
- [ ] Session cookie is signed with HMAC-SHA256; tampering with the cookie value causes rejection
- [ ] All pages use `requireSession()` / `getSession()` from the shared helper — no inline `cookies()` session reads
- [ ] Admin page redirects to `/login` when accessed without a valid session
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
