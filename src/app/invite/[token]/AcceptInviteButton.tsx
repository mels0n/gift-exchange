'use client';

import { acceptInvite } from './actions';

export function AcceptInviteButton({ token }: { token: string }) {
    async function handleAccept() {
        const res = await acceptInvite(token);
        if (res?.error) alert(res.error);
    }

    return (
        <button
            onClick={handleAccept}
            className="bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-900/40 transition-all text-base"
        >
            Accept Invitation →
        </button>
    );
}
