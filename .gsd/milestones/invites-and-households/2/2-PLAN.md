---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Login Redirect + Post-Registration Auto-Accept

## Objective
Two independent improvements: (1) the login flow preserves a `?redirect=` URL param so users coming from an invite email land back on the invite page after logging in; (2) `registerHousehold` checks for a pending `invite_token` cookie and auto-accepts the invite immediately after creating the household.

## Context
- src/app/login/page.tsx
- src/features/auth/ui/LoginForm.tsx
- src/features/auth/api/actions.ts
- src/features/register-household/api/actions.ts

## Tasks

<task type="auto">
  <name>Add login redirect support</name>
  <files>
    src/app/login/page.tsx
    src/features/auth/ui/LoginForm.tsx
    src/features/auth/api/actions.ts
  </files>
  <action>
    **1. `src/app/login/page.tsx`** — make it async and read `searchParams`:

    ```tsx
    import { LoginForm } from '@/features/auth/ui/LoginForm';

    export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
        const { redirect: redirectTo } = await searchParams;
        return (
            <main className="min-h-screen flex flex-col justify-center items-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
                <div className="w-full max-w-md z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-block animate-bounce-slow text-6xl mb-4 filter drop-shadow-glow">🎅</div>
                        <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-rose-100 to-red-200 drop-shadow-sm tracking-tight">
                            Cousin Exchange
                        </h1>
                        <p className="text-red-200/80 text-lg font-light tracking-wide">
                            The thoughtful way to give.
                        </p>
                    </div>
                    <LoginForm redirectTo={redirectTo} />
                </div>
            </main>
        );
    }
    ```

    **2. `src/features/auth/ui/LoginForm.tsx`** — accept and thread the `redirectTo` prop:

    - Change the function signature: `export function LoginForm({ redirectTo }: { redirectTo?: string })`
    - Change `handleOtp`: `await verifyOtp(email, code, redirectTo);`

    **3. `src/features/auth/api/actions.ts`** — accept optional `redirectTo` param in `verifyOtp`:

    - Change the signature: `export async function verifyOtp(email: string, code: string, redirectTo = '/dashboard')`
    - Change the redirect at the end: `redirect(redirectTo);`

    Do NOT validate or sanitize `redirectTo` beyond using it as-is — it comes from our own invite URLs, not user input in a text box.
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; verifyOtp accepts redirectTo; LoginForm passes it through; login page reads searchParams.</done>
</task>

<task type="auto">
  <name>Auto-accept invite after household registration</name>
  <files>
    src/features/register-household/api/actions.ts
  </files>
  <action>
    In `registerHousehold`, after the household is created and before the final redirect, check for an `invite_token` cookie. If present, find the invite and create a Participation automatically.

    Add this block after the `db.household.create(...)` call and before `redirect('/dashboard?registered=true')`:

    ```ts
    // Auto-accept pending invite if one was stored before registration
    const cookieStore = await cookies();
    const pendingToken = cookieStore.get('invite_token')?.value;
    if (pendingToken) {
        const invite = await db.invite.findUnique({
            where: { token: pendingToken },
        });
        if (invite && invite.status === 'PENDING') {
            // Get the newly created household with kids
            const newHousehold = await db.household.findFirst({
                where: { emails: { contains: creatorEmail } },
                include: { kids: true },
            });
            if (newHousehold) {
                const alreadyJoined = await db.participation.findUnique({
                    where: { eventId_householdId: { eventId: invite.eventId, householdId: newHousehold.id } },
                });
                if (!alreadyJoined) {
                    await db.participation.create({
                        data: {
                            eventId: invite.eventId,
                            householdId: newHousehold.id,
                            participatingKidIds: JSON.stringify(newHousehold.kids.map(k => k.id)),
                        },
                    });
                }
                await db.invite.update({
                    where: { id: invite.id },
                    data: { status: 'ACCEPTED' },
                });
            }
        }
        cookieStore.delete('invite_token');
    }
    ```

    Also add the import at the top of the file (next to existing imports):
    ```ts
    import { cookies } from 'next/headers';
    ```

    Note: `creatorEmail` is already available in scope (it's set near the top of `registerHousehold` as `const { email: creatorEmail } = await requireSession()`).

    The `redirect('/dashboard?registered=true')` line stays exactly where it is — this block goes before it.
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -8</verify>
  <done>Build passes; registerHousehold reads invite_token cookie and creates Participation if a valid pending invite exists.</done>
</task>

## Success Criteria
- [ ] Visiting `/login?redirect=/invite/some-token` → after login, lands on `/invite/some-token` (not `/dashboard`)
- [ ] `verifyOtp` signature accepts optional `redirectTo` param
- [ ] After `registerHousehold`, if `invite_token` cookie is set: Participation created, invite marked ACCEPTED, cookie cleared
- [ ] Cookie is cleared whether or not the invite was valid (prevent stale cookies)
- [ ] `npm run build` passes with no type errors
