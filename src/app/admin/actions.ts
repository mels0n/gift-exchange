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
    regDeadline: z.string().min(1),
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

    // Persist matches + update event status in a transaction
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
                        eventId: event.id,
                        eventName: event.name,
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
