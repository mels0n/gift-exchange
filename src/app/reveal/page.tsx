import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { RevealCard } from '@/features/match-reveal/ui/RevealCard';

export default async function RevealPage() {
    const { email } = await requireSession();

    // Get Household
    const household = await db.household.findFirst({
        where: { emails: { contains: email } },
        include: {
            givenMatches: {
                include: { recipientKid: true, event: true } // Need event for config
            }
        }
    });

    if (!household || household.givenMatches.length === 0) {
        return (
            <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black flex items-center justify-center p-4">
                <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <h1 className="text-2xl font-serif font-bold text-red-100">No Matches Yet</h1>
                    <p className="text-white/60 mt-2">Check back later! The elves are still working.</p>
                </div>
            </main>
        );
    }

    // Assuming single event for MVP, but loop if multiple
    const matches = household.givenMatches;
    const event = matches[0].event;

    const revealData = {
        totalKids: matches.length,
        recipients: matches.map((m: any) => ({
            id: m.recipientKid.id,
            name: m.recipientKid.name,
            age: 0 // DOB calculation omitted for brevity
        })),
        config: {
            budget: event.budget,
            items: event.items
        }
    };

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white py-10 px-4">
            <div className="text-center mb-12">
                <div className="text-6xl mb-4 animate-bounce-slow filter drop-shadow-glow">🎄</div>
                <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">The Reveal</h1>
                <p className="text-red-200/60 mt-2 font-medium tracking-wide">Assignments for {household.name}</p>
            </div>

            <RevealCard data={revealData} />
        </main>
    );
}
