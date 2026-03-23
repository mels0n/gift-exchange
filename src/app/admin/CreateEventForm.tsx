'use client';

import { createEvent } from './actions';

export function CreateEventForm() {
    async function handleSubmit(formData: FormData) {
        const res = await createEvent(formData);
        if (res?.error) alert(res.error);
    }

    return (
        <form action={handleSubmit} className="grid grid-cols-2 gap-4">
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
    );
}
