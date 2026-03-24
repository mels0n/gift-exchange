---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Event Ownership

## Objective
Track who created each event and restrict the "Run Matching" button to the event creator. Right now any logged-in user can trigger matching on anyone's event — this closes that gap.

## Context
- prisma/schema.prisma
- src/app/admin/actions.ts
- src/app/admin/page.tsx
- src/app/admin/RunMatchingButton.tsx

## Tasks

<task type="auto">
  <name>Add createdByEmail to Event schema and wire into actions</name>
  <files>
    prisma/schema.prisma
    src/app/admin/actions.ts
  </files>
  <action>
    1. In `prisma/schema.prisma`, add to the Event model:
       ```
       createdByEmail String @default("")
       ```
       Place it after the `status` field.

    2. Run the migration:
       ```
       npx prisma migrate dev --name add_event_ownership
       ```

    3. In `src/app/admin/actions.ts`, update `createEvent`:
       - `requireSession()` already returns `{ email }` — capture it: `const { email } = await requireSession();`
       - Add `createdByEmail: email` to the `db.event.create` data object.

    4. In `src/app/admin/actions.ts`, update `runMatching`:
       - Capture `{ email }` from `requireSession()` (currently discarded).
       - After loading the event, add ownership check:
         ```ts
         if (event.createdByEmail !== email) {
             return { error: 'Only the event creator can run matching.' };
         }
         ```
       - Add this check right after the existing `if (!event || event.status !== 'OPEN')` guard.

    Do NOT change the `runMatching` signature or its return type.
  </action>
  <verify>npx prisma migrate status 2>&1 | grep -i "Database schema is up to date"</verify>
  <done>Migration applied cleanly; `Event` table has `createdByEmail` column; createEvent stores email; runMatching rejects non-owners.</done>
</task>

<task type="auto">
  <name>Gate RunMatchingButton to event owner in admin page</name>
  <files>
    src/app/admin/page.tsx
  </files>
  <action>
    1. In `AdminPage`, capture the session email:
       ```ts
       const { email } = await requireSession();
       ```
       (currently: `await requireSession();` — the return value is discarded)

    2. In the events list, replace the current RunMatchingButton render:
       ```tsx
       {event.status === 'OPEN' && <RunMatchingButton eventId={event.id} />}
       ```
       with:
       ```tsx
       {event.status === 'OPEN' && event.createdByEmail === email && (
           <RunMatchingButton eventId={event.id} />
       )}
       ```

    3. In the event list item, add a small "by {email}" line below the stats line so the organizer knows who owns each event:
       ```tsx
       <p className="text-xs text-white/30 mt-0.5">by {event.createdByEmail || 'unknown'}</p>
       ```
       Place it after the existing `<p className="text-xs text-white/40 ...">` stats line.

    Do NOT restructure the page — minimal targeted edits only.
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -5</verify>
  <done>Build passes; admin page compiles; RunMatchingButton only renders for the event creator.</done>
</task>

## Success Criteria
- [ ] `Event` table has `createdByEmail` column (verify: `npx prisma studio` or `sqlite3` query)
- [ ] Creating an event stores the logged-in user's email
- [ ] `runMatching` returns an error for non-owners (server-side enforcement)
- [ ] Admin UI hides "Run Matching" button for events the user didn't create
- [ ] `npm run build` passes with no type errors
