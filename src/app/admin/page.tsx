import { db } from '@/shared/api/db';
import { getSession } from '@/shared/lib/session';
import { redirect } from 'next/navigation';
import { RulesCard } from '@/features/matching/ui/RulesCard';

export default async function AdminPage() {
    const session = await getSession();
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
    if (!session || (adminEmails.length > 0 && !adminEmails.includes(session.email))) {
        redirect('/login');
    }

    // Stats
    const houseCount = await db.household.count();
    const eventCount = await db.event.count();
    const jobsPending = await db.job.count({ where: { status: 'PENDING' } });

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white p-8 overflow-hidden">
            <h1 className="text-3xl font-serif font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">Admin Operations</h1>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <StatCard title="Households" value={houseCount} />
                <StatCard title="Events" value={eventCount} />
                <StatCard title="Pending Jobs" value={jobsPending} color="blue" />
            </div>

            <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-serif text-white/90 mb-4">Manual Triggers</h2>
                <div className="flex gap-4">
                    <form action={async () => { 'use server'; /* Import scheduler logic here or call API route */ }}>
                        <button disabled className="bg-white/10 text-white/30 px-4 py-2 rounded-lg cursor-not-allowed border border-white/5">
                            Trigger Daily Cron (Disabled)
                        </button>
                    </form>
                    <a href="/api/cron" className="bg-gradient-to-r from-red-700 to-rose-800 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-900/40 transition-all">
                        Force Run Scheduler
                    </a>
                </div>
                <p className="text-sm text-white/40 mt-4 italic">
                    Note: In production, the scheduler runs automatically at midnight.
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-serif text-white/90 mb-4">Current Strategy</h2>
                <RulesCard />
            </div>
        </main>
    );
}

function StatCard({ title, value, color = 'green' }: { title: string, value: number, color?: string }) {
    return (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-xl">
            <h3 className="text-white/60 font-medium uppercase tracking-wider text-xs">{title}</h3>
            <p className="text-4xl font-bold text-white mt-1">{value}</p>
        </div>
    );
}
