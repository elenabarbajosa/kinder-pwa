'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Automatically redirect if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) router.push('/today');
        };
        checkSession();
    }, [router, supabase]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setError('Credenciales incorrectas');
            return;
        }

        // ✅ redirect immediately after successful login
        router.push('/today');
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-[var(--color-border)] max-w-sm w-full">
                <h1 className="text-2xl font-bold mb-6 text-center text-[var(--color-primary-dark)]">
                    Iniciar sesión
                </h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[#f6f8ff] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder="tuemail@ejemplo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 bg-[#f6f8ff] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50"
                    >
                        {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>
        </main>
    );
}
