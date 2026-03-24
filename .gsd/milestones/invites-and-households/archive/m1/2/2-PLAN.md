---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Dashboard Event Participation Card

## Objective
Let households join an active event from their dashboard. Replace the `{/* TODO: Add Event Participation Card */}` comment with a real component that shows event status and lets households select which of their kids participate.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- prisma/schema.prisma
- src/app/dashboard/page.tsx
- src/features/register-household/api/actions.ts
- src/shared/lib/session.ts
- src/shared/api/db.ts

## Tasks

<task type="auto">
  <name>Add joinEvent server action</name>
  <files>src/features/register-household/api/actions.ts</files>
  <action>
    Add a `joinEvent` server action to the existing file. Append after the existing `registerHousehold` function:

    ```ts
    export async function joinEvent(formData: FormData) {
        const { email } = await requireSession();

        const household = await db.household.findFirst({
            where: { emails: { contains: email } },
            include: { kids: true },
        });
        if (!household) return { error: 'Household not found.' };

        const event = await db.event.findFirst({
            where: { status: 'OPEN' },
            orderBy: { createdAt: 'desc' },
        });
        if (!event) return { error: 'No open event found.' };

        // Prevent double-joining
        const existing = await db.participation.findUnique({
            where: { eventId_householdId: { eventId: event.id, householdId: household.id } },
        });
        if (existing) return { error: 'Already joined this event.' };

        // Collect selected kid IDs from checkboxes (name="kidId")
        const kidIds = formData.getAll('kidId') as string[];
        if (kidIds.length === 0) return { error: 'Select at least one child.' };

        // Validate all selected IDs belong to this household
        const validIds = household.kids.map(k => k.id);
        if (!kidIds.every(id => validIds.includes(id))) {
            return { error: 'Invalid kid selection.' };
        }

        await db.participation.create({
            data: {
                eventId: event.id,
                householdId: household.id,
                participatingKidIds: JSON.stringify(kidIds),
            },
        });

        redirect('/dashboard');
    }
    ```

    Also add `redirect` to the imports at the top if not already present (it already is from `registerHousehold`).

    Add `requireSession` import:
    ```ts
    import { requireSession } from '@/shared/lib/session';
    ```
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>
    - `joinEvent` function exported from `src/features/register-household/api/actions.ts`
    - Validates kid IDs belong to the household (prevents tampering)
    - Creates `Participation` record with JSON kid IDs
    - Redirects to `/dashboard` on success
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Build EventParticipationCard component and wire into dashboard</name>
  <files>
    src/features/register-household/ui/EventParticipationCard.tsx,
    src/app/dashboard/page.tsx
  </files>
  <action>
    **Create `src/features/register-household/ui/EventParticipationCard.tsx`:**

    ```tsx
    'use client';

    import { joinEvent } from '../api/actions';
    import type { Event, Kid, Participation } from '@prisma/client';
    import { Calendar, CheckCircle2, Users } from 'lucide-react';
    import Link from 'next/link';

    type Props = {
        event: Event | null;
        participation: Participation | null;
        kids: Kid[];
    };

    export function EventParticipationCard({ event, participation, kids }: Props) {
        if (!event) {
            return (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-serif text-white/90 mb-3">Exchange Event</h2>
                    <p className="text-white/40 text-sm italic">No active event right now. Check back later!</p>
                </div>
            );
        }

        const deadline = new Date(event.regDeadline).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });

        if (event.status === 'MATCHED') {
            return (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-serif text-white/90 mb-4">{event.name}</h2>
                    <div className="p-4 bg-emerald-900/30 border border-emerald-500/20 text-emerald-200 rounded-xl flex items-center gap-3 mb-4">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span className="font-medium">Matching complete! Your assignments are ready.</span>
                    </div>
                    <Link href="/reveal" className="inline-block bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg transition-all">
                        View My Assignments →
                    </Link>
                </div>
            );
        }

        if (participation) {
            const kidIds: string[] = JSON.parse(participation.participatingKidIds);
            const participatingKids = kids.filter(k => kidIds.includes(k.id));
            return (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-serif text-white/90 mb-4">{event.name}</h2>
                    <div className="p-4 bg-emerald-900/30 border border-emerald-500/20 text-emerald-200 rounded-xl flex items-center gap-3 mb-4">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span className="font-medium">You're in! Waiting for the organizer to run matching.</span>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-3">Participating Kids</p>
                        <div className="flex flex-wrap gap-2">
                            {participatingKids.map(k => (
                                <span key={k.id} className="bg-black/20 border border-white/5 px-3 py-1 rounded-full text-sm text-white/80">
                                    {k.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-white/30 mt-4 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Registration closes {deadline}
                    </p>
                </div>
            );
        }

        // Not yet joined — show join form
        return (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-serif text-white/90 mb-1">{event.name}</h2>
                <p className="text-sm text-white/50 mb-6 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Registration closes {deadline} · ${event.budget}/kid · {event.items} items
                </p>
                <form action={joinEvent} className="space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-3 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> Select kids to enter
                        </p>
                        <div className="space-y-2">
                            {kids.map(k => (
                                <label key={k.id} className="flex items-center gap-3 p-3 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                    <input type="checkbox" name="kidId" value={k.id} className="w-4 h-4 accent-red-500" />
                                    <span className="text-white/90 font-medium">{k.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-sm tracking-wide">
                        Join the Exchange
                    </button>
                </form>
            </div>
        );
    }
    ```

    **Update `src/app/dashboard/page.tsx`:**
    1. Import `EventParticipationCard`.
    2. After the household query, fetch the active event and the household's participation.
    3. Replace `{/* TODO: Add Event Participation Card */}` with the component.

    Add these queries before the `return` in `DashboardPage` (after the household is confirmed to exist):
    ```ts
    const activeEvent = await db.event.findFirst({
        where: { status: { in: ['OPEN', 'MATCHED'] } },
        orderBy: { createdAt: 'desc' },
    });

    const participation = activeEvent
        ? await db.participation.findUnique({
            where: { eventId_householdId: { eventId: activeEvent.id, householdId: household.id } },
          })
        : null;
    ```

    Replace the TODO comment with:
    ```tsx
    <section className="mt-8">
        <EventParticipationCard
            event={activeEvent}
            participation={participation}
            kids={household.kids}
        />
    </section>
    ```

    Also add the import at the top:
    ```ts
    import { EventParticipationCard } from '@/features/register-household/ui/EventParticipationCard';
    ```
  </action>
  <verify>npx tsc --noEmit && npm run build</verify>
  <done>
    - `EventParticipationCard` renders correctly for all 4 states: no event, joined+waiting, MATCHED, not-yet-joined
    - Dashboard shows the card below the "Your Status" section
    - Submitting the join form creates a `Participation` record and reloads the page showing "You're in!"
    - `npm run build` succeeds
  </done>
</task>

## Success Criteria
- [ ] Household with no participation sees the join form on dashboard when an OPEN event exists
- [ ] Submitting the join form with selected kids creates a `Participation` record
- [ ] Household that has joined sees "You're in!" with their kids listed
- [ ] Household sees "View My Assignments →" link to `/reveal` once event status is MATCHED
- [ ] `npm run build` succeeds with no type errors
