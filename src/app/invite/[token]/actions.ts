'use server';

import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { redirect } from 'next/navigation';

export async function acceptInvite(token: string) {
    const { email } = await requireSession();

    const invite = await db.invite.findUnique({
        where: { token },
        include: { event: true },
    });

    if (!invite || invite.status !== 'PENDING') {
        return { error: 'This invite is no longer valid.' };
    }

    const household = await db.household.findFirst({
        where: { emails: { contains: email } },
        include: { kids: true },
    });

    if (!household) {
        return { error: 'You need to set up your household first.' };
    }

    // Create participation — include all household kids by default
    const existing = await db.participation.findUnique({
        where: { eventId_householdId: { eventId: invite.eventId, householdId: household.id } },
    });

    if (!existing) {
        await db.participation.create({
            data: {
                eventId: invite.eventId,
                householdId: household.id,
                participatingKidIds: JSON.stringify(household.kids.map(k => k.id)),
            },
        });
    }

    await db.invite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
    });

    // Send join confirmation to all household emails
    const emails: string[] = JSON.parse(household.emails);
    for (const addr of emails) {
        await db.job.create({
            data: {
                type: 'SEND_JOIN_CONFIRMATION',
                payload: JSON.stringify({
                    email: addr,
                    eventName: invite.event.name,
                    householdName: household.name,
                }),
            },
        });
    }

    redirect('/dashboard');
}

export async function declineInvite(token: string) {
    await requireSession();

    const invite = await db.invite.findUnique({ where: { token } });
    if (!invite || invite.status !== 'PENDING') {
        return { error: 'This invite is no longer valid.' };
    }

    await db.invite.update({
        where: { id: invite.id },
        data: { status: 'DECLINED' },
    });

    redirect('/dashboard');
}
