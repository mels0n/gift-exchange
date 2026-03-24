---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Organizer Match List + OTP Cleanup

## Objective
Two improvements: (1) delete OTP records from the DB after successful verification instead of only marking them `used: true` — keeps the table clean; (2) add a "Match Results" section to the admin page so organizers can see the full who-gives-to-whom list for events they created.

## Context
- src/features/auth/api/actions.ts
- src/app/admin/page.tsx
- prisma/schema.prisma

## Tasks

<task type="auto">
  <name>Delete OTP record after verification</name>
  <files>
    src/features/auth/api/actions.ts
  </files>
  <action>
    In `verifyOtp`, replace the `db.otpCode.update` call (which marks `used: true`) with a `db.otpCode.delete`:

    Replace:
    ```ts
    // Mark code as used
    await db.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
    });
    ```

    With:
    ```ts
    // Delete after use — no need to keep spent codes
    await db.otpCode.delete({
        where: { id: otpRecord.id },
    });
    ```

    The `used: false` filter in the `findFirst` query above it still works correctly — a deleted record simply won't be found. No schema change needed.
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; verifyOtp deletes (not updates) the OTP record.</done>
</task>

<task type="auto">
  <name>Add match list section to admin page</name>
  <files>
    src/app/admin/page.tsx
  </files>
  <action>
    **1. Add match query** in `AdminPage` after the existing `myParticipations` query:

    ```ts
    const myMatches = myEventIds.length > 0
        ? await db.match.findMany({
            where: { eventId: { in: myEventIds } },
            include: {
                giverHouse: true,
                recipientKid: { include: { household: true } },
                event: true,
            },
            orderBy: [{ event: { name: 'asc' } }, { giverHouse: { name: 'asc' } }],
          })
        : [];
    ```

    **2. Add "Match Results" section** after the "Participants in Your Events" section:

    ```tsx
    {myMatches.length > 0 && (
        <section className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-serif text-white/90 mb-4">Match Results</h2>
            <div className="space-y-6">
                {Object.entries(
                    myMatches.reduce<Record<string, typeof myMatches>>((acc, m) => {
                        const key = m.event.name;
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(m);
                        return acc;
                    }, {})
                ).map(([eventName, matches]) => (
                    <div key={eventName}>
                        <p className="text-xs uppercase tracking-wider text-white/40 font-medium mb-2">{eventName}</p>
                        <div className="space-y-1">
                            {matches.map(m => (
                                <div key={m.id} className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm">
                                    <span className="text-white/90 font-medium">{m.giverHouse.name}</span>
                                    <span className="text-white/30">→</span>
                                    <span className="text-white/70">{m.recipientKid.name}</span>
                                    <span className="text-white/30 text-xs">({m.recipientKid.household.name})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )}
    ```

    Place this block immediately after the closing `)}` of the `myParticipations` section (before the `<div className="mt-8">` that contains the RulesCard).
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -6</verify>
  <done>Build passes; admin page renders Match Results section grouped by event name.</done>
</task>

## Success Criteria
- [ ] `verifyOtp` deletes the OTP record (not marks used) after successful login
- [ ] Admin page shows "Match Results" section for events the logged-in user created
- [ ] Matches are grouped by event name
- [ ] Each row shows: giver household name → recipient kid name (recipient household name)
- [ ] Section only appears when there are matches (no empty state noise)
- [ ] `npm run build` passes with no type errors
