import { db } from '@/shared/api/db';
import { getSession } from '@/shared/lib/session';
import { redirect } from 'next/navigation';
import { RulesCard } from '@/features/matching/ui/RulesCard';
import { createEvent, runMatching } from './actions';

export default async function AdminPage() {
    const session = await getSession();
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
    if (!session || (adminEmails.length > 0 && !adminEmails.includes(session.email))) {
        redirect('/login');
    }

    const houseCount = await db.household.count();
    const jobsPending = await db.job.count({ where: { status: 'PENDING' } });
    const events = await db.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { participations: true, matches: true } } },
    });

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
                <form action={createEvent} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Event Name</label>
                        <input
                            name="name"
                            required
                            placeholder="Christmas 2025"
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Budget per Kid ($)</label>
                        <input
                            name="budget"
                            type="number"
                            required
                            min="1"
                            placeholder="30"
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Items per Kid</label>
                        <input
                            name="items"
                            type="number"
                            required
                            min="1"
                            placeholder="3"
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium mb-1">Registration Deadline</label>
                        <input
                            name="regDeadline"
                            type="datetime-local"
                            required
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                    </div>
                    <div className="col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-red-900/40 transition-all font-medium text-sm"
                        >
                            Create Event
                        </button>
                    </div>
                </form>
            </section>

            {/* Events List */}
            <section className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-serif text-white/90 mb-4">Events</h2>
                {events.length === 0 ? (
                    <p className="text-white/40 text-sm italic">No events yet. Create one above.</p>
                ) : (
                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4">
                                <div>
                                    <p className="font-semibold text-white/90">{event.name}</p>
                                    <p className="text-xs text-white/40 mt-0.5">
                                        {event._count.participations} households · {event._count.matches} matches · ${event.budget}/kid · {event.items} items
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={event.status} />
                                    {event.status === 'OPEN' && (
                                        <form action={runMatching.bind(null, event.id)}>
                                            <button
                                                type="submit"
                                                className="bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg transition-all"
                                            >
                                                Run Matching
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

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
