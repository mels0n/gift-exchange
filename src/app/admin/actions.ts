'use server';

import { z } from 'zod';
import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { CousinExchangeStrategy } from '@/features/matching/algo/cousin-exchange';
import { SecretSantaStrategy } from '@/features/matching/algo/secret-santa';
import { MatchingStrategy } from '@/features/matching/algo/strategies';
import { revalidatePath } from 'next/cache';

const CreateEventSchema = z.object({
    name: z.string().min(2),
    budget: z.coerce.number().int().positive(),
    items: z.coerce.number().int().positive(),
    regDeadline: z.string().min(1),
    strategy: z.enum(['COUSIN_EXCHANGE', 'SECRET_SANTA']).default('COUSIN_EXCHANGE'),
});

export async function createEvent(formData: FormData) {
    const { email } = await requireSession();

    const parsed = CreateEventSchema.safeParse({
        name: formData.get('name'),
        budget: formData.get('budget'),
        items: formData.get('items'),
        regDeadline: formData.get('regDeadline'),
        strategy: formData.get('strategy'),
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { name, budget, items, regDeadline, strategy } = parsed.data;
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
                createdByEmail: email,
                strategy,
            },
        });
    } catch {
        return { error: 'Failed to create event. Slug may already exist.' };
    }

    revalidatePath('/admin');
    return { success: true };
}

export async function runMatching(eventId: string) {
    const { email } = await requireSession();

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event || event.status !== 'OPEN') {
        return { error: 'Event not found or not in OPEN status.' };
    }
    if (event.createdByEmail !== email) {
        return { error: 'Only the event creator can run matching.' };
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
        const strategy: MatchingStrategy = event.strategy === 'SECRET_SANTA'
            ? new SecretSantaStrategy()
            : new CousinExchangeStrategy();
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

export async function sendInvites(formData: FormData) {
    const { email: organizer } = await requireSession();

    const eventId = formData.get('eventId') as string | null;
    if (!eventId) return { error: 'Missing event ID.' };

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) return { error: 'Event not found.' };
    if (event.createdByEmail !== organizer) return { error: 'Only the event creator can send invites.' };

    const rawEmails = (formData.get('emails') as string | null) ?? '';
    const emails = rawEmails
        .split(/[\n,]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);

    if (emails.length === 0) return { error: 'Enter at least one email address.' };

    let sent = 0;
    for (const email of emails) {
        const existing = await db.invite.findUnique({
            where: { eventId_email: { eventId, email } },
        });
        if (existing) continue;

        const invite = await db.invite.create({
            data: { eventId, email },
        });

        await db.job.create({
            data: {
                type: 'SEND_INVITE',
                payload: JSON.stringify({
                    email,
                    eventId,
                    eventName: event.name,
                    inviteToken: invite.token,
                }),
            },
        });
        sent++;
    }

    revalidatePath('/admin');
    return { success: true, sent };
}

export async function remindInvite(inviteId: string) {
    const { email: organizer } = await requireSession();

    const invite = await db.invite.findUnique({
        where: { id: inviteId },
        include: { event: true },
    });

    if (!invite || invite.status !== 'PENDING') return { error: 'Invite not found or not pending.' };
    if (invite.event.createdByEmail !== organizer) return { error: 'Not authorized.' };

    await db.job.create({
        data: {
            type: 'SEND_INVITE',
            payload: JSON.stringify({
                email: invite.email,
                eventId: invite.eventId,
                eventName: invite.event.name,
                inviteToken: invite.token,
            }),
        },
    });

    revalidatePath('/admin');
    return { success: true };
}
