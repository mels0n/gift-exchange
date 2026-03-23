'use server';

import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function registerHousehold(formData: FormData) {
    const { email: creatorEmail } = await requireSession();

    const name = formData.get('name') as string;
    const parentEmail = (formData.get('parentEmail') as string | null) ?? '';
    const kidNames = formData.getAll('kidName') as string[];
    const kidDobs = formData.getAll('kidDob') as string[];

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
                    create: kidNames
                    .map((name, i) => ({ name: name.trim(), dob: kidDobs[i] ? new Date(kidDobs[i]) : null }))
                    .filter(k => k.name.length > 0),
                },
            },
        });
    } catch (e) {
        console.error(e);
        return { error: 'Failed to create household' };
    }

    // Auto-accept pending invite if one was stored before registration
    const cookieStore = await cookies();
    const pendingToken = cookieStore.get('invite_token')?.value;
    if (pendingToken) {
        const invite = await db.invite.findUnique({
            where: { token: pendingToken },
        });
        if (invite && invite.status === 'PENDING') {
            // Get the newly created household with kids
            const newHousehold = await db.household.findFirst({
                where: { emails: { contains: creatorEmail } },
                include: { kids: true },
            });
            if (newHousehold) {
                const alreadyJoined = await db.participation.findUnique({
                    where: { eventId_householdId: { eventId: invite.eventId, householdId: newHousehold.id } },
                });
                if (!alreadyJoined) {
                    await db.participation.create({
                        data: {
                            eventId: invite.eventId,
                            householdId: newHousehold.id,
                            participatingKidIds: JSON.stringify(newHousehold.kids.map(k => k.id)),
                        },
                    });
                }
                await db.invite.update({
                    where: { id: invite.id },
                    data: { status: 'ACCEPTED' },
                });
            }
        }
        cookieStore.delete('invite_token');
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

    const eventId = formData.get('eventId') as string | null;
    if (!eventId) return { error: 'Missing event ID.' };

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event || event.status !== 'OPEN') return { error: 'Event not found or no longer open.' };
    if (new Date() > new Date(event.regDeadline)) {
        return { error: 'Registration deadline has passed.' };
    }

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

export async function addKid(formData: FormData) {
    const { email } = await requireSession();
    const household = await db.household.findFirst({
        where: { emails: { contains: email } },
    });
    if (!household) return { error: 'Household not found.' };

    const name = (formData.get('kidName') as string | null)?.trim();
    if (!name) return { error: 'Name is required.' };

    const dobStr = formData.get('kidDob') as string | null;
    await db.kid.create({
        data: {
            name,
            dob: dobStr ? new Date(dobStr) : null,
            householdId: household.id,
        },
    });

    redirect('/household');
}

export async function removeKid(formData: FormData) {
    const { email } = await requireSession();
    const household = await db.household.findFirst({
        where: { emails: { contains: email } },
        include: { kids: true },
    });
    if (!household) return { error: 'Household not found.' };

    const kidId = formData.get('kidId') as string | null;
    if (!kidId) return { error: 'Missing kid ID.' };

    const owned = household.kids.some(k => k.id === kidId);
    if (!owned) return { error: 'Not your kid.' };

    await db.kid.delete({ where: { id: kidId } });
    redirect('/household');
}

export async function updateEmails(formData: FormData) {
    const { email: sessionEmail } = await requireSession();
    const household = await db.household.findFirst({
        where: { emails: { contains: sessionEmail } },
    });
    if (!household) return { error: 'Household not found.' };

    const rawEmails = formData.getAll('email') as string[];
    const emails = rawEmails.map(e => e.trim()).filter(e => e.length > 0);

    // Always keep the session email in the list
    if (!emails.includes(sessionEmail)) {
        emails.unshift(sessionEmail);
    }

    if (emails.length === 0) return { error: 'At least one email is required.' };

    await db.household.update({
        where: { id: household.id },
        data: { emails: JSON.stringify(emails) },
    });

    redirect('/household');
}
