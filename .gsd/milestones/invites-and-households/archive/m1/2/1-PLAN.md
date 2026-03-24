---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Admin Event Management

## Objective
Give the admin the ability to create a gift exchange event and trigger the matching algorithm against it. Without these actions, no event lifecycle can begin — households have nothing to join and the matching algorithm is unreachable.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- prisma/schema.prisma
- src/app/admin/page.tsx
- src/features/matching/algo/cousin-exchange.ts
- src/features/matching/algo/strategies.ts
- src/shared/api/db.ts
- src/shared/lib/session.ts

## Tasks

<task type="auto">
  <name>Create admin server actions (createEvent + runMatching)</name>
  <files>src/app/admin/actions.ts</files>
  <action>
    Create a new file `src/app/admin/actions.ts` with two server actions:

    ```ts
    'use server';

    import { z } from 'zod';
    import { db } from '@/shared/api/db';
    import { requireSession } from '@/shared/lib/session';
    import { CousinExchangeStrategy } from '@/features/matching/algo/cousin-exchange';
    import { revalidatePath } from 'next/cache';

    const CreateEventSchema = z.object({
        name: z.string().min(2),
        budget: z.coerce.number().int().positive(),
        items: z.coerce.number().int().positive(),
        regDeadline: z.string().datetime({ local: true }),
    });

    export async function createEvent(formData: FormData) {
        await requireSession();

        const parsed = CreateEventSchema.safeParse({
            name: formData.get('name'),
            budget: formData.get('budget'),
            items: formData.get('items'),
            regDeadline: formData.get('regDeadline'),
        });

        if (!parsed.success) {
            return { error: parsed.error.issues[0].message };
        }

        const { name, budget, items, regDeadline } = parsed.data;
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        try {
            await db.event.create({
                data: {
                    name,
                    slug,
                    budget,
                    items,
                    regDeadline: new Date(regDeadline),
                    status: 'OPEN',
                },
            });
        } catch {
            return { error: 'Failed to create event. Slug may already exist.' };
        }

        revalidatePath('/admin');
        return { success: true };
    }

    export async function runMatching(eventId: string) {
        await requireSession();

        const event = await db.event.findUnique({ where: { id: eventId } });
        if (!event || event.status !== 'OPEN') {
            return { error: 'Event not found or not in OPEN status.' };
        }

        // Load participating households with only their participating kids
        const participations = await db.participation.findMany({
            where: { eventId },
            include: { household: { include: { kids: true } } },
        });

        if (participations.length < 2) {
            return { error: 'Need at least 2 participating households to run matching.' };
        }

        const households = participations.map(p => {
            const kidIds: string[] = JSON.parse(p.participatingKidIds);
            return {
                ...p.household,
                kids: p.household.kids.filter(k => kidIds.includes(k.id)),
            };
        });

        // Run algorithm
        let matches;
        try {
            const strategy = new CousinExchangeStrategy();
            matches = strategy.match(households);
        } catch (err) {
            return { error: String(err) };
        }

        // Persist matches + update event status
        await db.$transaction([
            db.match.createMany({
                data: matches.map(m => ({
                    eventId,
                    giverHouseId: m.giverHouseId,
                    recipientKidId: m.recipientKidId,
                })),
            }),
            db.event.update({
                where: { id: eventId },
                data: { status: 'MATCHED' },
            }),
        ]);

        // Enqueue SEND_MATCH jobs (one per email address per household)
        for (const p of participations) {
            const houseMatches = matches.filter(m => m.giverHouseId === p.householdId);
            const recipientKids = await db.kid.findMany({
                where: { id: { in: houseMatches.map(m => m.recipientKidId) } },
            });
            const emails: string[] = JSON.parse(p.household.emails);
            for (const email of emails) {
                await db.job.create({
                    data: {
                        type: 'SEND_MATCH',
                        payload: JSON.stringify({
                            email,
                            householdName: p.household.name,
                            recipients: recipientKids.map(k => ({ id: k.id, name: k.name })),
                            budget: event.budget,
                            items: event.items,
                        }),
                    },
                });
            }
        }

        revalidatePath('/admin');
        return { success: true, matchCount: matches.length };
    }
    ```
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>
    - `src/app/admin/actions.ts` exists with `createEvent` and `runMatching` exports
    - `createEvent` validates inputs, generates slug, creates Event with status OPEN
    - `runMatching` filters kids by participatingKidIds, runs algorithm, saves Matches, enqueues SEND_MATCH jobs
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Add Create Event form and Run Matching button to admin page</name>
  <files>src/app/admin/page.tsx</files>
  <action>
    Replace the current admin page content with an expanded version that includes:

    1. Fetch events with participation counts for display.
    2. Add a "Create Event" section with a form (uses `createEvent` action).
    3. Replace the existing "Manual Triggers" section with an "Events" section showing each event's status and a "Run Matching" form button for OPEN events.

    Full replacement for `src/app/admin/page.tsx`:

    ```tsx
    import { db } from '@/shared/api/db';
    import { getSession } from '@/shared/lib/session';
    import { redirect } from 'next/navigation';
    import { RulesCard } from '@/features/matching/ui/RulesCard';
    import { createEvent, runMatching } from './actions';

    export default async function AdminPage() {
        const session = await getSession();
        const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
        if (!session || (adminEmails.length > 0 && !adminEmails.includes(session.email))) {
            redirect('/login');
        }

        const houseCount = await db.household.count();
        const jobsPending = await db.job.count({ where: { status: 'PENDING' } });
        const events = await db.event.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { participations: true, matches: true } } },
        });

        return (
            <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white p-8 overflow-hidden">
                <h1 className="text-3xl font-serif font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">Admin Operations</h1>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <StatCard title="Households" value={houseCount} />
                    <StatCard title="Events" value={events.length} />
                    <StatCard title="Pending Jobs" value={jobsPending} />
                </div>

                {/* Create Event */}
                <section className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg mb-8">
                    <h2 className="text-xl font-serif text-white/90 mb-4">Create Event</h2>
                    <form action={createEvent} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Event Name</label>
                            <input name="name" required placeholder="Christmas 2025" className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Budget per Kid ($)</label>
                            <input name="budget" type="number" required min="1" placeholder="30" className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Items per Kid</label>
                            <input name="items" type="number" required min="1" placeholder="3" className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Registration Deadline</label>
                            <input name="regDeadline" type="datetime-local" required className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all" />
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <button type="submit" className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-red-900/40 transition-all font-medium text-sm">
                                Create Event
                            </button>
                        </div>
                    </form>
                </section>

                {/* Events List */}
                <section className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg mb-8">
                    <h2 className="text-xl font-serif text-white/90 mb-4">Events</h2>
                    {events.length === 0 ? (
                        <p className="text-white/40 text-sm italic">No events yet. Create one above.</p>
                    ) : (
                        <div className="space-y-4">
                            {events.map(event => (
                                <div key={event.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4">
                                    <div>
                                        <p className="font-semibold text-white/90">{event.name}</p>
                                        <p className="text-xs text-white/40 mt-0.5">
                                            {event._count.participations} households · {event._count.matches} matches · ${event.budget}/kid · {event.items} items
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={event.status} />
                                        {event.status === 'OPEN' && (
                                            <form action={runMatching.bind(null, event.id)}>
                                                <button type="submit" className="bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg transition-all">
                                                    Run Matching
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="mt-8">
                    <h2 className="text-xl font-serif text-white/90 mb-4">Current Strategy</h2>
                    <RulesCard />
                </div>
            </main>
        );
    }

    function StatCard({ title, value }: { title: string; value: number }) {
        return (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl">
                <h3 className="text-white/60 font-medium uppercase tracking-wider text-xs">{title}</h3>
                <p className="text-4xl font-bold text-white mt-1">{value}</p>
            </div>
        );
    }

    function StatusBadge({ status }: { status: string }) {
        const styles: Record<string, string> = {
            DRAFT: 'bg-zinc-700/50 text-zinc-300',
            OPEN: 'bg-blue-900/50 text-blue-300',
            LOCKED: 'bg-yellow-900/50 text-yellow-300',
            MATCHED: 'bg-emerald-900/50 text-emerald-300',
            ARCHIVED: 'bg-zinc-800/50 text-zinc-500',
        };
        return (
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${styles[status] ?? styles.DRAFT}`}>
                {status}
            </span>
        );
    }
    ```
  </action>
  <verify>npx tsc --noEmit && npm run build</verify>
  <done>
    - Admin page renders a Create Event form
    - Admin page lists existing events with status badges and household/match counts
    - OPEN events show a "Run Matching" button that calls `runMatching`
    - `npm run build` succeeds
  </done>
</task>

## Success Criteria
- [ ] Admin can submit the Create Event form and see the new event appear in the list
- [ ] Admin can click "Run Matching" on an OPEN event — event moves to MATCHED status, Match records created, SEND_MATCH jobs enqueued
- [ ] `npm run build` succeeds with no type errors
