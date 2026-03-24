'use client';

import { useState } from 'react';
import { remindInvite } from './actions';

export function RemindButton({ inviteId }: { inviteId: string }) {
    const [error, setError] = useState<string | null>(null);

    async function handleRemind() {
        setError(null);
        const res = await remindInvite(inviteId);
        if (res?.error) setError(res.error);
    }

    return (
        <div className="flex flex-col items-end gap-0.5">
            <button
                onClick={handleRemind}
                className="text-xs text-yellow-400/70 hover:text-yellow-300 underline transition-colors"
            >
                Remind
            </button>
            {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
}
