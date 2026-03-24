---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Invite Acceptance Page + Action

## Objective
Create the `/invite/[token]` page where invited users land from their email link. If they're logged in and have a household, they can accept immediately. If they have no household, the page stores the token in a short-lived cookie and sends them to register, so the registration flow can auto-accept on their behalf.

## Context
- prisma/schema.prisma (Invite model)
- src/shared/lib/session.ts
- src/app/dashboard/page.tsx (pattern reference)

## Tasks

<task type="auto">
  <name>Create invite acceptance page and AcceptInviteButton</name>
  <files>
    src/app/invite/[token]/page.tsx
    src/app/invite/[token]/AcceptInviteButton.tsx
  </files>
  <action>
    **Create `src/app/invite/[token]/AcceptInviteButton.tsx`** (client component needed to call server action):

    ```tsx
    'use client';

    import { acceptInvite } from './actions';

    export function AcceptInviteButton({ token }: { token: string }) {
        async function handleAccept() {
            const res = await acceptInvite(token);
            if (res?.error) alert(res.error);
        }

        return (
            <button
                onClick={handleAccept}
                className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-base"
            >
                Accept Invitation →
            </button>
        );
    }
    ```

    **Create `src/app/invite/[token]/page.tsx`** (server component):

    ```tsx
    import { db } from '@/shared/api/db';
    import { getSession } from '@/shared/lib/session';
    import { redirect } from 'next/navigation';
    import { cookies } from 'next/headers';
    import Link from 'next/link';
    import { AcceptInviteButton } from './AcceptInviteButton';

    export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
        const { token } = await params;

        const invite = await db.invite.findUnique({
            where: { token },
            include: { event: true },
        });

        if (!invite || invite.status !== 'PENDING') {
            return (
                <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white flex items-center justify-center p-8">
                    <div className="text-center">
                        <p className="text-xl text-white/70 mb-6">This invite link is no longer valid.</p>
                        <Link href="/dashboard" className="text-red-300 hover:text-red-200 underline">Go to Dashboard</Link>
                    </div>
                </main>
            );
        }

        const session = await getSession();
        if (!session) {
            redirect(`/login?redirect=/invite/${token}`);
        }

        const household = await db.household.findFirst({
            where: { emails: { contains: session.email } },
        });

        if (!household) {
            // No household yet — store token in cookie, send to dashboard to register
            const cookieStore = await cookies();
            cookieStore.set('invite_token', token, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 60 * 60, // 1 hour
            });
            redirect('/dashboard');
        }

        return (
            <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white flex items-center justify-center p-8">
                <div className="max-w-md w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
                    <p className="text-4xl mb-4">🎄</p>
                    <h1 className="text-2xl font-serif font-bold text-white/90 mb-2">You&apos;re invited!</h1>
                    <p className="text-white/60 mb-8">
                        Join <strong className="text-white/90">{invite.event.name}</strong> as <span className="text-white/80">{household.name}</span>.
                    </p>
                    <AcceptInviteButton token={token} />
                </div>
            </main>
        );
    }
    ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; invite page and AcceptInviteButton files created.</done>
</task>

<task type="auto">
  <name>Create acceptInvite server action</name>
  <files>
    src/app/invite/[token]/actions.ts
  </files>
  <action>
    Create `src/app/invite/[token]/actions.ts`:

    ```ts
    'use server';

    import { db } from '@/shared/api/db';
    import { requireSession } from '@/shared/lib/session';
    import { redirect } from 'next/navigation';

    export async function acceptInvite(token: string) {
        const { email } = await requireSession();

        const invite = await db.invite.findUnique({
            where: { token },
            include: { event: true },
        });

        if (!invite || invite.status !== 'PENDING') {
            return { error: 'This invite is no longer valid.' };
        }

        const household = await db.household.findFirst({
            where: { emails: { contains: email } },
            include: { kids: true },
        });

        if (!household) {
            return { error: 'You need to set up your household first.' };
        }

        // Create participation — include all household kids by default
        const existing = await db.participation.findUnique({
            where: { eventId_householdId: { eventId: invite.eventId, householdId: household.id } },
        });

        if (!existing) {
            await db.participation.create({
                data: {
                    eventId: invite.eventId,
                    householdId: household.id,
                    participatingKidIds: JSON.stringify(household.kids.map(k => k.id)),
                },
            });
        }

        await db.invite.update({
            where: { id: invite.id },
            data: { status: 'ACCEPTED' },
        });

        redirect('/dashboard');
    }
    ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; acceptInvite action creates Participation and marks invite ACCEPTED.</done>
</task>

## Success Criteria
- [ ] `/invite/[token]` route exists and compiles
- [ ] Invalid/non-PENDING tokens show an error message (not a crash)
- [ ] Unauthenticated users are redirected to `/login?redirect=/invite/${token}`
- [ ] Users with a household see the event name and an Accept button
- [ ] Users with no household get a cookie set and are redirected to `/dashboard`
- [ ] `acceptInvite` creates a Participation (all kids) and marks invite ACCEPTED
- [ ] `npm run build` passes
