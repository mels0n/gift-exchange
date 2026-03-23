'use client';

import type { Kid, Household } from '@prisma/client';
import { calculateBurden, formatCurrency } from '@/shared/lib/math';
import { Gift } from 'lucide-react';

type MatchData = {
    totalKids: number;
    recipients: { name: string; age: number; id: string }[];
    config: { budget: number; items: number };
};

export function RevealCard({ data }: { data: MatchData }) {
    const burden = calculateBurden(data.recipients.length, data.config);

    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden max-w-sm mx-auto shadow-2xl ring-1 ring-black/5">
            <div className="bg-gradient-to-r from-red-700 to-rose-800 p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                <h2 className="text-2xl font-serif font-bold flex items-center justify-center gap-2 text-white relative z-10 tracking-wide">
                    <Gift className="w-6 h-6" /> Your Matches
                </h2>
                <p className="text-red-100/90 text-sm mt-2 font-medium">Do not screenshot! Keep it secret.</p>
            </div>

            <div className="p-8 space-y-8">
                {/* The List used to be here, but let's highlight the MATH first per user request */}

                <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                    <h3 className="text-sm font-bold mb-4 text-center text-white/40 uppercase tracking-widest">Assignments</h3>
                    <ul className="space-y-3">
                        {data.recipients.map((kid) => (
                            <li key={kid.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium text-xl text-white/90">{kid.name}</span>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">TARGET</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-b from-red-900/20 to-black/20 p-6 rounded-xl border border-red-500/20 relative group">
                    <div className="absolute inset-0 bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition-all rounded-xl"></div>
                    <h3 className="text-center font-bold text-red-200/80 uppercase tracking-widest text-xs mb-4 relative z-10">
                        Your Total Burden
                    </h3>
                    <div className="space-y-1 relative z-10">
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-red-200/60">Total Budget:</span>
                            <span className="text-3xl font-serif font-bold text-white">{formatCurrency(burden.totalBudget)}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-red-200/60">Total Items:</span>
                            <span className="text-3xl font-serif font-bold text-white">{burden.totalItems} <span className="text-sm font-sans font-normal text-white/40">Wrapped</span></span>
                        </div>
                    </div>
                    <p className="text-xs text-center mt-4 text-white/30 italic relative z-10">
                        ({formatCurrency(data.config.budget)} & {data.config.items} items per child)
                    </p>
                </div>
            </div>
        </div>
    );
}
