---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Reveal Page Strategy Context

## Objective
The reveal page shows strategy-appropriate context. For Secret Santa, emphasise the one assigned family by name above the kid list. For Cousin Exchange, keep the current layout unchanged.

## Context
- src/app/reveal/[eventId]/page.tsx
- src/features/match-reveal/ui/RevealCard.tsx (read-only reference — no changes)

## Tasks

<task type="auto">
  <name>Add strategy context to reveal page</name>
  <files>
    src/app/reveal/[eventId]/page.tsx
  </files>
  <action>
    **1. Update the matches query** to include the recipient kid's household (needed for Secret Santa family name):

    Change:
    ```ts
    const matches = await db.match.findMany({
        where: { eventId, giverHouseId: household.id },
        include: { recipientKid: true },
    });
    ```

    To:
    ```ts
    const matches = await db.match.findMany({
        where: { eventId, giverHouseId: household.id },
        include: { recipientKid: { include: { household: true } } },
    });
    ```

    **2. Derive the recipient family name** (only meaningful for Secret Santa — all kids are from the same household):
    ```ts
    const recipientFamilyName = matches[0]?.recipientKid.household.name ?? null;
    ```
    Add this after the `matches` query, before the early-return `if (matches.length === 0)` check.

    **3. Update the page heading section** — replace the current static heading block:
    ```tsx
    <div className="text-center mb-12">
        <div className="text-6xl mb-4">🎄</div>
        <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">
            The Reveal
        </h1>
        <p className="text-red-200/60 mt-2 font-medium tracking-wide">
            {event.name} — {household.name}
        </p>
    </div>
    ```

    With:
    ```tsx
    <div className="text-center mb-12">
        <div className="text-6xl mb-4">🎄</div>
        <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">
            The Reveal
        </h1>
        <p className="text-red-200/60 mt-2 font-medium tracking-wide">
            {event.name} — {household.name}
        </p>
        {event.strategy === 'SECRET_SANTA' && recipientFamilyName && (
            <p className="text-white/50 mt-3 text-sm">
                You&apos;re buying for <strong className="text-white/80">{recipientFamilyName}</strong> this year.
            </p>
        )}
    </div>
    ```
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -6</verify>
  <done>Build passes; reveal page shows recipient family name for SECRET_SANTA events; Cousin Exchange layout unchanged.</done>
</task>

## Success Criteria
- [ ] Secret Santa reveal shows "You're buying for [Family Name] this year." below the event name
- [ ] Cousin Exchange reveal is visually unchanged
- [ ] `npm run build` passes with no TypeScript errors
