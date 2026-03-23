'use server';

import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { redirect } from 'next/navigation';

export async function registerHousehold(formData: FormData) {
    const { email: creatorEmail } = await requireSession();

    const name = formData.get('name') as string;
    const parentEmail = (formData.get('parentEmail') as string | null) ?? '';
    const kidNames = formData.getAll('kidName') as string[];

    if (!name) return { error: 'Missing required fields' };

    const emails = [creatorEmail, parentEmail]
        .map(e => e.trim())
        .filter((e, i, a) => e.length > 0 && a.indexOf(e) === i);

    try {
        await db.household.create({
            data: {
                name,
                emails: JSON.stringify(emails),
                kids: {
                    create: kidNames.filter(k => k.trim()).map(k => ({ name: k.trim() })),
                },
            },
        });
    } catch (e) {
        console.error(e);
        return { error: 'Failed to create household' };
    }

    redirect('/dashboard?registered=true');
}

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

    const existing = await db.participation.findUnique({
        where: { eventId_householdId: { eventId: event.id, householdId: household.id } },
    });
    if (existing) return { error: 'Already joined this event.' };

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
