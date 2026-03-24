---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Organizer View + Deadline Enforcement

## Objective
Give event creators visibility into who has joined their events, and enforce the registration deadline so households can't join after it has passed.

## Context
- src/app/admin/page.tsx
- src/features/register-household/api/actions.ts

## Tasks

<task type="auto">
  <name>Add organizer participant view to admin page</name>
  <files>
    src/app/admin/page.tsx
  </files>
  <action>
    Add a new section below the Events List section that shows participating households for events the logged-in user created.

    1. In the `AdminPage` data fetch block, add a query for participations on the user's events:
       ```ts
       const myEventIds = events
           .filter(e => e.createdByEmail === email)
           .map(e => e.id);

       const myParticipations = myEventIds.length > 0
           ? await db.participation.findMany({
               where: { eventId: { in: myEventIds } },
               include: { household: true, event: true },
               orderBy: { event: { name: 'asc' } },
           })
           : [];
       ```
       Place this after the existing `events` query.

    2. Add a new `<section>` after the Events List section:
       ```tsx
       {myParticipations.length > 0 && (
           <section className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg mb-8">
               <h2 className="text-xl font-serif text-white/90 mb-4">Participants in Your Events</h2>
               <div className="space-y-2">
                   {myParticipations.map(p => {
                       const kidIds: string[] = JSON.parse(p.participatingKidIds);
                       return (
                           <div key={p.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl px-4 py-3">
                               <div>
                                   <p className="text-white/90 font-medium">{p.household.name}</p>
                                   <p className="text-xs text-white/40">{p.event.name} · {kidIds.length} kid{kidIds.length !== 1 ? 's' : ''}</p>
                               </div>
                           </div>
                       );
                   })}
               </div>
           </section>
       )}
       ```

    Do NOT add a full separate page — inline in admin is sufficient for now.
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -20</verify>
  <done>No TypeScript errors; admin page renders participant list for events the user owns.</done>
</task>

<task type="auto">
  <name>Enforce registration deadline in joinEvent</name>
  <files>
    src/features/register-household/api/actions.ts
  </files>
  <action>
    In the `joinEvent` server action, add a deadline check after loading the event.

    1. After the `requireSession()` call, load the event:
       ```ts
       const event = await db.event.findUnique({ where: { id: eventId } });
       if (!event) return { error: 'Event not found.' };
       ```

    2. Add deadline enforcement immediately after:
       ```ts
       if (new Date() > new Date(event.regDeadline)) {
           return { error: 'Registration deadline has passed.' };
       }
       ```

    3. Do NOT re-query the event later in the function — use the `event` object already loaded.

    Read the current `joinEvent` implementation first to understand where `eventId` is parsed and where the participation record is created, so the new check slots in naturally.

    Check: `joinEvent` is in `src/features/register-household/api/actions.ts`. Read it before editing.
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -5</verify>
  <done>Build passes; joinEvent returns error when called after regDeadline; no type errors.</done>
</task>

## Success Criteria
- [ ] Admin page shows a "Participants in Your Events" section listing household names and kid counts
- [ ] Section only appears when the user has created events that have participants
- [ ] `joinEvent` rejects submissions after `regDeadline` with a clear error message
- [ ] `npm run build` passes with no type errors
