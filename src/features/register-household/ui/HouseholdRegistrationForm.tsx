'use client';

import { useState } from 'react';
import { registerHousehold } from '../api/actions';
import { Plus, Trash2 } from 'lucide-react';

export function HouseholdRegistrationForm() {
    const [kids, setKids] = useState([0]); // Array of IDs

    const addKid = () => setKids([...kids, kids.length]);
    const removeKid = (idx: number) => setKids(kids.filter((_, i) => i !== idx));

    async function handleSubmit(formData: FormData) {
        const res = await registerHousehold(formData);
        if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl ring-1 ring-black/5">
            <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-serif text-red-100/90 tracking-wide">Household Details</h2>
                <p className="text-sm text-white/50">Who are the parents managing this?</p>
            </div>

            <div>
                <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium ml-1">Family Name</label>
                <input
                    name="name"
                    placeholder="The Smith Family"
                    className="w-full mt-1 p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    required
                />
            </div>

            <div>
                <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium ml-1">Secondary Parent Email (Optional)</label>
                <input
                    name="parentEmail"
                    type="email"
                    placeholder="dad@example.com"
                    className="w-full mt-1 p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
            </div>

            <div className="border-t border-white/10 pt-6">
                <h2 className="text-xl font-serif text-red-100/90 tracking-wide mb-2">Children</h2>
                <p className="text-sm text-white/50 mb-6">Add all eligible children (even if not participating this year).</p>

                <div className="space-y-4">
                    {kids.map((k, i) => (
                        <div key={k} className="flex gap-3 items-center">
                            <input
                                name="kidName"
                                placeholder={`Child ${i + 1} Name`}
                                className="flex-1 p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                                required
                            />
                            <input
                                name="kidDob"
                                type="date"
                                className="p-3 bg-black/20 border border-white/10 rounded-xl text-white/70 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all w-40"
                            />
                            {kids.length > 1 && (
                                <button type="button" onClick={() => removeKid(i)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addKid} className="mt-4 flex items-center gap-2 text-red-200 hover:text-white font-medium transition-colors text-sm">
                    <Plus size={18} /> Add Another Child
                </button>
            </div>

            <div className="border-t border-white/10 pt-6">
                <button type="submit" className="w-full bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-red-900/40 transform transition hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide">
                    Complete Registration
                </button>
            </div>
        </form>
    );
}
