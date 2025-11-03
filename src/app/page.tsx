'use client';

import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { es as t } from '@/strings';

export default function Home() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-bg)]">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-[var(--color-border)]">
          <h1 className="text-2xl font-semibold mb-4 text-[var(--color-primary-dark)]">
            {t.signIn}
          </h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
          <p className="text-sm mt-4 text-gray-600">{t.useEmailMsg}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 space-y-6 bg-[var(--color-bg)]">
      <h1 className="text-3xl font-semibold text-[var(--color-primary-dark)]">
        {t.appTitle}
      </h1>

      <div className="flex flex-wrap gap-3">
        {/* Primary pink button */}
        <Link
          href="/today"
          className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white font-medium shadow-sm hover:bg-[var(--color-primary-dark)] transition-all"
        >
          {t.today}
        </Link>

        {/* Outline buttons */}
        <Link
          href="/change"
          className="px-5 py-2 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary)] hover:text-white transition-all"
        >
          {t.addChange}
        </Link>

        <Link
          href="/children"
          className="px-5 py-2 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary)] hover:text-white transition-all"
        >
          {t.children}
        </Link>

        <button
          onClick={signOut}
          className="px-5 py-2 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary)] hover:text-white transition-all"
        >
          {t.signOut}
        </button>
      </div>
    </main>
  );
}
