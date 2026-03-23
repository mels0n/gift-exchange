'use client';

import { runMatching } from './actions';

export function RunMatchingButton({ eventId }: { eventId: string }) {
    async function handleClick() {
        const res = await runMatching(eventId);
        if (res?.error) alert(res.error);
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg transition-all"
        >
            Run Matching
        </button>
    );
}
