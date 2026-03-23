import { LoginForm } from '@/features/auth/ui/LoginForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
    const { redirect: redirectTo } = await searchParams;
    return (
        <main className="min-h-screen flex flex-col justify-center items-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#2a1b1b] to-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

            <div className="w-full max-w-md z-10 space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-block animate-bounce-slow text-6xl mb-4 filter drop-shadow-glow">🎅</div>
                    <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-rose-100 to-red-200 drop-shadow-sm tracking-tight">
                        Cousin Exchange
                    </h1>
                    <p className="text-red-200/80 text-lg font-light tracking-wide">
                        The thoughtful way to give.
                    </p>
                </div>
                <LoginForm redirectTo={redirectTo} />
            </div>
        </main>
    );
}
