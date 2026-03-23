import { db } from '@/shared/api/db';
import { getSession } from '@/shared/lib/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { AcceptInviteButton } from './AcceptInviteButton';
import { DeclineInviteButton } from './DeclineInviteButton';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const invite = await db.invite.findUnique({
        where: { token },
        include: { event: true },
    });

    if (!invite || invite.status !== 'PENDING') {
        return (
            <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-xl text-white/70 mb-6">This invite link is no longer valid.</p>
                    <Link href="/dashboard" className="text-red-300 hover:text-red-200 underline">Go to Dashboard</Link>
                </div>
            </main>
        );
    }

    const session = await getSession();
    if (!session) {
        redirect(`/login?redirect=/invite/${token}`);
    }

    const household = await db.household.findFirst({
        where: { emails: { contains: session.email } },
    });

    if (!household) {
        // No household yet — store token in cookie, send to dashboard to register
        const cookieStore = await cookies();
        cookieStore.set('invite_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
        });
        redirect('/dashboard');
    }

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white flex items-center justify-center p-8">
            <div className="max-w-md w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl text-center">
                <p className="text-4xl mb-4">🎄</p>
                <h1 className="text-2xl font-serif font-bold text-white/90 mb-2">You&apos;re invited!</h1>
                <p className="text-white/60 mb-8">
                    Join <strong className="text-white/90">{invite.event.name}</strong> as <span className="text-white/80">{household.name}</span>.
                </p>
                <AcceptInviteButton token={token} />
                <DeclineInviteButton token={token} />
            </div>
        </main>
    );
}
