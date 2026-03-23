'use server';

import { z } from 'zod';
import { db } from '@/shared/api/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const KidSchema = z.object({
    name: z.string().min(1),
    dob: z.string().optional(), // ISO Date string
});

const HouseholdSchema = z.object({
    name: z.string().min(2),
    parentEmails: z.string().email().array().min(1),
    kids: z.array(KidSchema),
});

export async function registerHousehold(formData: FormData) {
    // 1. Get Session
    const cookieStore = await cookies();
    const session = cookieStore.get('session_id');
    if (!session) return { error: 'Unauthorized' };

    const creatorEmail = JSON.parse(session.value).email; // Insecure for prod, fine for MVP if key signed

    // 2. Parse Data
    // (In real app, we'd loop over form entries, here assuming strict naming or using a library like conform)
    // implementing manual extraction for demo
    const name = formData.get('name') as string;
    const parentEmail = formData.get('parentEmail') as string; // Primary email
    const kidNames = formData.getAll('kidName') as string[];

    if (!name || !parentEmail) return { error: 'Missing required fields' };

    // 3. Save to DB
    try {
        const household = await db.household.create({
            data: {
                name,
                emails: JSON.stringify([creatorEmail, parentEmail].filter((e, i, a) => a.indexOf(e) === i)), // Dedupe
                kids: {
                    create: kidNames.map(k => ({ name: k }))
                }
            }
        });

        // Auto-link invite if exists
        // ...

    } catch (e) {
        console.error(e);
        return { error: 'Failed to create household' };
    }

    redirect('/dashboard?registered=true');
}
