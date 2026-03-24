---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Secret Santa Algorithm + Strategy Selector

## Objective
Implement the Secret Santa matching strategy and let organizers choose it at event creation time. Each household is assigned to buy for all kids of exactly one other household (random derangement — no household draws itself).

## Context
- src/features/matching/algo/strategies.ts (MatchingStrategy interface + MatchResult type)
- src/features/matching/algo/cousin-exchange.ts (reference implementation)
- src/app/admin/CreateEventForm.tsx
- src/app/admin/actions.ts
- prisma/schema.prisma (Event.strategy field already exists as String @default("COUSIN_EXCHANGE"))

## Tasks

<task type="auto">
  <name>Create SecretSantaStrategy + add strategy selector to CreateEventForm + action</name>
  <files>
    src/features/matching/algo/secret-santa.ts
    src/app/admin/CreateEventForm.tsx
    src/app/admin/actions.ts
  </files>
  <action>
    **1. Create `src/features/matching/algo/secret-santa.ts`:**

    ```ts
    import { Household, Kid } from '@prisma/client';
    import { MatchingStrategy, MatchResult } from './strategies';

    export class SecretSantaStrategy implements MatchingStrategy {
        match(households: (Household & { kids: Kid[] })[]): MatchResult {
            if (households.length < 2) {
                throw new Error('Need at least 2 households for Secret Santa.');
            }

            // Sattolo algorithm — produces a single-cycle permutation (guaranteed derangement)
            // Each element ends up at a position that is NOT its original position
            const order = [...households];
            for (let i = order.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * i); // j in [0, i-1], ensures no fixed points
                [order[i], order[j]] = [order[j], order[i]];
            }

            // households[i] gives to all of order[i]'s kids
            const matches: MatchResult = [];
            for (let i = 0; i < households.length; i++) {
                const giver = households[i];
                const recipient = order[i];
                for (const kid of recipient.kids) {
                    matches.push({ giverHouseId: giver.id, recipientKidId: kid.id });
                }
            }

            return matches;
        }
    }
    ```

    **2. Add strategy field to `CreateEventSchema` in `src/app/admin/actions.ts`** — change:
    ```ts
    const CreateEventSchema = z.object({
        name: z.string().min(2),
        budget: z.coerce.number().int().positive(),
        items: z.coerce.number().int().positive(),
        regDeadline: z.string().min(1),
    });
    ```
    To:
    ```ts
    const CreateEventSchema = z.object({
        name: z.string().min(2),
        budget: z.coerce.number().int().positive(),
        items: z.coerce.number().int().positive(),
        regDeadline: z.string().min(1),
        strategy: z.enum(['COUSIN_EXCHANGE', 'SECRET_SANTA']).default('COUSIN_EXCHANGE'),
    });
    ```

    Also add `strategy` to the `createEvent` parsed data extraction and to `db.event.create`:
    ```ts
    const { name, budget, items, regDeadline, strategy } = parsed.data;
    ```
    And in `db.event.create({ data: { ... } })`, add `strategy,` to the data object.

    Also add `strategy: formData.get('strategy'),` to the `CreateEventSchema.safeParse(...)` call alongside the other fields.

    **3. Add strategy `<select>` to `src/app/admin/CreateEventForm.tsx`** — add a new field in the grid before the submit button div:

    ```tsx
    <div>
        <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Matching Strategy</label>
        <select
            name="strategy"
            defaultValue="COUSIN_EXCHANGE"
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
        >
            <option value="COUSIN_EXCHANGE">Cousin Exchange</option>
            <option value="SECRET_SANTA">Secret Santa</option>
        </select>
    </div>
    ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -10</verify>
  <done>No TypeScript errors; SecretSantaStrategy file exists; CreateEventForm has strategy select; createEvent saves strategy field.</done>
</task>

<task type="auto">
  <name>Update runMatching to switch on event.strategy</name>
  <files>
    src/app/admin/actions.ts
  </files>
  <action>
    In `runMatching` in `src/app/admin/actions.ts`:

    **1. Add import** at the top of the file (alongside the existing CousinExchangeStrategy import):
    ```ts
    import { SecretSantaStrategy } from '@/features/matching/algo/secret-santa';
    import { MatchingStrategy } from '@/features/matching/algo/strategies';
    ```

    **2. Replace** the hardcoded strategy instantiation:
    ```ts
    // Run algorithm
    let matches;
    try {
        const strategy = new CousinExchangeStrategy();
        matches = strategy.match(households);
    } catch (err) {
        return { error: String(err) };
    }
    ```

    With:
    ```ts
    // Run algorithm
    let matches;
    try {
        const strategy: MatchingStrategy = event.strategy === 'SECRET_SANTA'
            ? new SecretSantaStrategy()
            : new CousinExchangeStrategy();
        matches = strategy.match(households);
    } catch (err) {
        return { error: String(err) };
    }
    ```
  </action>
  <verify>npx tsc --noEmit && npm run build 2>&1 | tail -6</verify>
  <done>Build passes; runMatching uses SecretSantaStrategy when event.strategy === 'SECRET_SANTA', CousinExchangeStrategy otherwise.</done>
</task>

## Success Criteria
- [ ] `SecretSantaStrategy` exists and implements `MatchingStrategy`
- [ ] Sattolo derangement: no household buys for itself
- [ ] `CreateEventForm` has a strategy dropdown (Cousin Exchange / Secret Santa)
- [ ] `createEvent` saves the selected strategy
- [ ] `runMatching` instantiates correct strategy based on `event.strategy`
- [ ] `npm run build` passes
