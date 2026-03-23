import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { RevealCard } from '@/features/match-reveal/ui/RevealCard';
import { notFound } from 'next/navigation';

export default async function RevealPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { email } = await requireSession();
    const { eventId } = await params;

    const household = await db.household.findFirst({
        where: { emails: { contains: email } },
    });

    if (!household) notFound();

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event || event.status !== 'MATCHED') notFound();

    const matches = await db.match.findMany({
        where: { eventId, giverHouseId: household.id },
        include: { recipientKid: true },
    });

    if (matches.length === 0) {
        return (
            <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black flex items-center justify-center p-4">
                <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <h1 className="text-2xl font-serif font-bold text-red-100">No Matches Yet</h1>
                    <p className="text-white/60 mt-2">Check back later! The elves are still working.</p>
                </div>
            </main>
        );
    }

    const revealData = {
        totalKids: matches.length,
        recipients: matches.map((m) => {
            const dob = m.recipientKid.dob;
            const age = dob
                ? Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                : null;
            return { id: m.recipientKid.id, name: m.recipientKid.name, age };
        }),
        config: { budget: event.budget, items: event.items },
    };

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white py-10 px-4">
            <div className="text-center mb-12">
                <div className="text-6xl mb-4">🎄</div>
                <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">
                    The Reveal
                </h1>
                <p className="text-red-200/60 mt-2 font-medium tracking-wide">
                    {event.name} — {household.name}
                </p>
            </div>
            <RevealCard data={revealData} />
        </main>
    );
}
