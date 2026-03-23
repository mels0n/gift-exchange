'use server';

import { z } from 'zod';
import { db } from '@/shared/api/db';
import { setSession } from '@/shared/lib/session';
import { redirect } from 'next/navigation';

const LoginSchema = z.object({
    email: z.string().email(),
});

/**
 * Step 1: Request OTP
 */
export async function requestOtp(formData: FormData) {
    const email = formData.get('email') as string;
    const parsed = LoginSchema.safeParse({ email });

    if (!parsed.success) {
        return { error: 'Invalid email address.' };
    }

    // Verify email belongs to a known household
    const household = await db.household.findFirst({
        where: { emails: { contains: email } }
    });

    if (!household) {
        // Return success anyway to avoid email enumeration
        return { success: true, email };
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB with 10-minute expiry
    await db.otpCode.create({
        data: {
            email,
            code,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }
    });

    // Enqueue email job
    await db.job.create({
        data: {
            type: 'SEND_OTP',
            payload: JSON.stringify({ email, code }),
        }
    });

    console.log(`[AUTH] OTP for ${email}: ${code}`);

    return { success: true, email };
}

/**
 * Step 2: Verify OTP
 */
export async function verifyOtp(email: string, code: string) {
    const otpRecord = await db.otpCode.findFirst({
        where: {
            email,
            code,
            used: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
        return { error: 'Invalid or expired code.' };
    }

    // Mark code as used
    await db.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
    });

    await setSession(email);
    redirect('/dashboard');
}
