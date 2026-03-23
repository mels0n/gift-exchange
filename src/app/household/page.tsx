import { db } from '@/shared/api/db';
import { requireSession } from '@/shared/lib/session';
import { redirect } from 'next/navigation';
import { addKid, removeKid, updateEmails } from '@/features/register-household/api/actions';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default async function HouseholdPage() {
    const { email } = await requireSession();
    const household = await db.household.findFirst({
        where: { emails: { contains: email } },
        include: { kids: true },
    });

    if (!household) redirect('/dashboard');

    async function handleAddKid(formData: FormData) {
        'use server';
        await addKid(formData);
    }

    async function handleRemoveKid(formData: FormData) {
        'use server';
        await removeKid(formData);
    }

    async function handleUpdateEmails(formData: FormData) {
        'use server';
        await updateEmails(formData);
    }

    const emails: string[] = JSON.parse(household.emails);

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
            <div className="container mx-auto p-6 relative z-10 max-w-2xl">
                <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-rose-100">
                        {household.name}
                    </h1>
                    <Link href="/dashboard" className="text-sm text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider font-semibold">
                        ← Dashboard
                    </Link>
                </header>

                {/* Kids section */}
                <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl mb-8">
                    <h2 className="text-xl font-serif text-white/90 mb-6">Children</h2>

                    <div className="space-y-3 mb-8">
                        {household.kids.map(kid => (
                            <div key={kid.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl p-4">
                                <div>
                                    <span className="text-white/90 font-medium">{kid.name}</span>
                                    {kid.dob && (
                                        <span className="text-xs text-white/40 ml-3">
                                            b. {new Date(kid.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                                <form action={handleRemoveKid}>
                                    <input type="hidden" name="kidId" value={kid.id} />
                                    <button type="submit" className="text-red-400 hover:text-red-300 p-1 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>

                    <form action={handleAddKid} className="flex gap-3 items-center border-t border-white/10 pt-6">
                        <input
                            name="kidName"
                            placeholder="New child's name"
                            required
                            className="flex-1 p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                        <input
                            name="kidDob"
                            type="date"
                            className="p-3 bg-black/20 border border-white/10 rounded-xl text-white/70 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all w-40"
                        />
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-5 py-3 rounded-xl transition-all text-sm whitespace-nowrap"
                        >
                            Add Child
                        </button>
                    </form>
                </section>

                {/* Emails section */}
                <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                    <h2 className="text-xl font-serif text-white/90 mb-2">Parent Emails</h2>
                    <p className="text-sm text-white/40 mb-6">All listed emails can log in and manage this household.</p>

                    <form action={handleUpdateEmails} className="space-y-3">
                        {emails.map((e, i) => (
                            <input
                                key={i}
                                name="email"
                                type="email"
                                defaultValue={e}
                                className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                            />
                        ))}
                        <input
                            name="email"
                            type="email"
                            placeholder="Add another email (optional)"
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-sm mt-2"
                        >
                            Save Emails
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
