import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { HouseholdRegistrationForm } from '@/features/register-household/ui/HouseholdRegistrationForm';
import { EventParticipationCard } from '@/features/register-household/ui/EventParticipationCard';
import { RulesCard } from '@/features/matching/ui/RulesCard';
import Link from 'next/link';

export default async function DashboardPage() {
    const { email } = await requireSession();

    const household = await db.household.findFirst({
        where: { emails: { contains: email } },
        include: { kids: true },
    });

    if (!household) {
        return (
            <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black relative overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
                <div className="w-full max-w-3xl relative z-10">
                    <h1 className="text-3xl font-serif font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100 drop-shadow-sm">
                        Welcome! Let&apos;s get you set up.
                    </h1>
                    <HouseholdRegistrationForm />
                </div>
            </main>
        );
    }

    // Fetch all active events (OPEN or MATCHED) with this household's participation status
    const activeEvents = await db.event.findMany({
        where: { status: { in: ['OPEN', 'MATCHED'] } },
        orderBy: { createdAt: 'desc' },
    });

    const participations = activeEvents.length > 0
        ? await db.participation.findMany({
            where: {
                householdId: household.id,
                eventId: { in: activeEvents.map(e => e.id) },
            },
          })
        : [];

    const eventsWithParticipation = activeEvents.map(event => ({
        event,
        participation: participations.find(p => p.eventId === event.id) ?? null,
    }));

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

            <div className="container mx-auto p-6 relative z-10">
                <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">
                            {household.name}
                        </h1>
                        <p className="text-red-200/60 font-medium">Registered with {email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-sm text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider font-semibold">
                            Organize
                        </Link>
                        <Link href="/api/auth/logout" className="text-sm text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider font-semibold">
                            Sign Out
                        </Link>
                    </div>
                </header>

                <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl mb-8">
                    <h2 className="text-xl font-serif text-white/90 mb-6">Your Household</h2>
                    <div className="p-4 bg-emerald-900/30 border border-emerald-500/20 text-emerald-200 rounded-xl flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <span className="font-medium tracking-wide">Registration Complete</span>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-4">Registered Kids</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {household.kids.map((kid) => (
                                <div key={kid.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-xs font-bold shadow-lg">
                                        {kid.name.charAt(0)}
                                    </div>
                                    <span className="text-lg font-medium text-white/90">{kid.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <h2 className="text-xl font-serif text-white/90 mb-4">Exchange Events</h2>
                    <EventParticipationCard events={eventsWithParticipation} kids={household.kids} />
                </section>

                <section className="mt-12">
                    <RulesCard />
                </section>
            </div>
        </main>
    );
}
