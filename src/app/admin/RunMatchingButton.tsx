'use client';

import { useState } from 'react';
import { runMatching } from './actions';

export function RunMatchingButton({ eventId }: { eventId: string }) {
    const [error, setError] = useState<string | null>(null);

    async function handleClick() {
        setError(null);
        const res = await runMatching(eventId);
        if (res?.error) setError(res.error);
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={handleClick}
                className="bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-lg transition-all"
            >
                Run Matching
            </button>
            {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
}
