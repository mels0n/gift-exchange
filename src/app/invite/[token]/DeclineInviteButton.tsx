'use client';

import { useState } from 'react';
import { declineInvite } from './actions';

export function DeclineInviteButton({ token }: { token: string }) {
    const [error, setError] = useState<string | null>(null);

    async function handleDecline() {
        setError(null);
        const res = await declineInvite(token);
        if (res?.error) setError(res.error);
    }

    return (
        <div className="flex flex-col items-center gap-1 mt-4">
            <button
                onClick={handleDecline}
                className="text-white/30 hover:text-white/60 text-sm underline transition-colors"
            >
                Decline invitation
            </button>
            {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
}
