'use client';

import { useState } from 'react';
import { requestOtp, verifyOtp } from '../api/actions';

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const [email, setEmail] = useState('');

    async function handleEmail(formData: FormData) {
        const res = await requestOtp(formData);
        if (res?.success) {
            setEmail(res.email as string);
            setStep('OTP');
        }
    }

    async function handleOtp(formData: FormData) {
        const code = formData.get('code') as string;
        await verifyOtp(email, code, redirectTo);
    }

    return (
        <div className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl ring-1 ring-black/5">
            <h2 className="text-xl font-medium mb-6 text-center text-red-100/90 tracking-wide font-serif">Family Authorization</h2>

            {step === 'EMAIL' ? (
                <form action={handleEmail} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium ml-1">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                            placeholder="mom@example.com"
                        />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-600 hover:to-rose-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-red-900/40 transform transition hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide">
                        Send Login Code
                    </button>
                </form>
            ) : (
                <form action={handleOtp} className="space-y-6">
                    <p className="text-sm text-red-200/70 text-center bg-red-900/20 py-2 rounded-lg border border-red-500/10">Code sent to <span className="text-white font-medium">{email}</span></p>
                    <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider text-red-200/60 font-medium ml-1 text-center">Security Code</label>
                        <input
                            name="code"
                            type="text"
                            required
                            className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-center tracking-[1em] text-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all font-mono"
                            placeholder="••••••"
                            maxLength={6}
                        />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-emerald-700 to-green-800 hover:from-emerald-600 hover:to-green-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-900/40 transform transition hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide">
                        Enter Exchange
                    </button>
                </form>
            )}
        </div>
    );
}
