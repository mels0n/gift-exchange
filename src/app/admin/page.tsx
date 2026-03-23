import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { RulesCard } from '@/features/matching/ui/RulesCard';
import { CreateEventForm } from './CreateEventForm';
import { RunMatchingButton } from './RunMatchingButton';
import { InviteForm } from './InviteForm';

export default async function AdminPage() {
    const { email } = await requireSession();

    const houseCount = await db.household.count();
    const jobsPending = await db.job.count({ where: { status: 'PENDING' } });
    const events = await db.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { participations: true, matches: true } } },
    });

    const myEventIds = events.filter(e => e.createdByEmail === email).map(e => e.id);
    const myParticipations = myEventIds.length > 0
        ? await db.participation.findMany({
            where: { eventId: { in: myEventIds } },
            include: { household: true, event: true },
            orderBy: { event: { name: 'asc' } },
          })
        : [];

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white p-8 overflow-hidden">
            <h1 className="text-3xl font-serif font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">Admin Operations</h1>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <StatCard title="Households" value={houseCount} />
                <StatCard title="Events" value={events.length} />
                <StatCard title="Pending Jobs" value={jobsPending} />
            </div>

            {/* Create Event */}
            <section className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-serif text-white/90 mb-4">Create Event</h2>
                <CreateEventForm />
            </section>

            {/* Events List */}
            <section className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-serif text-white/90 mb-4">Events</h2>
                {events.length === 0 ? (
                    <p className="text-white/40 text-sm italic">No events yet. Create one above.</p>
                ) : (
                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="bg-black/20 border border-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-white/90">{event.name}</p>
                                        <p className="text-xs text-white/40 mt-0.5">
                                            {event._count.participations} households · {event._count.matches} matches · ${event.budget}/kid · {event.items} items
                                        </p>
                                        <p className="text-xs text-white/30 mt-0.5">by {event.createdByEmail || 'unknown'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={event.status} />
                                        {event.status === 'OPEN' && event.createdByEmail === email && (
                                            <RunMatchingButton eventId={event.id} />
                                        )}
                                    </div>
                                </div>
                                {event.createdByEmail === email && (
                                    <InviteForm eventId={event.id} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {myParticipations.length > 0 && (
                <section className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg mb-8">
                    <h2 className="text-xl font-serif text-white/90 mb-4">Participants in Your Events</h2>
                    <div className="space-y-2">
                        {myParticipations.map(p => {
                            const kidIds: string[] = JSON.parse(p.participatingKidIds);
                            return (
                                <div key={p.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="text-white/90 font-medium">{p.household.name}</p>
                                        <p className="text-xs text-white/40">{p.event.name} · {kidIds.length} kid{kidIds.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            <div className="mt-8">
                <h2 className="text-xl font-serif text-white/90 mb-4">Current Strategy</h2>
                <RulesCard />
            </div>
        </main>
    );
}

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl">
            <h3 className="text-white/60 font-medium uppercase tracking-wider text-xs">{title}</h3>
            <p className="text-4xl font-bold text-white mt-1">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        DRAFT: 'bg-zinc-700/50 text-zinc-300',
        OPEN: 'bg-blue-900/50 text-blue-300',
        LOCKED: 'bg-yellow-900/50 text-yellow-300',
        MATCHED: 'bg-emerald-900/50 text-emerald-300',
        ARCHIVED: 'bg-zinc-800/50 text-zinc-500',
    };
    return (
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${styles[status] ?? styles.DRAFT}`}>
            {status}
        </span>
    );
}
