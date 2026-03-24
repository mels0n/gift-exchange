'use client';

import { useState } from 'react';
import { acceptInvite } from './actions';

export function AcceptInviteButton({ token }: { token: string }) {
    const [error, setError] = useState<string | null>(null);

    async function handleAccept() {
        setError(null);
        const res = await acceptInvite(token);
        if (res?.error) setError(res.error);
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleAccept}
                className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-base"
            >
                Accept Invitation →
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
    );
}
