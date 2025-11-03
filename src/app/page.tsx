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
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-4">{t.signIn}</h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
          <p className="text-sm mt-4 text-gray-600">{t.useEmailMsg}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{t.appTitle}</h1>
      <div className="flex gap-3">
        <Link href="/today" className="px-4 py-2 rounded-xl bg-black text-white">{t.today}</Link>
        <Link href="/change" className="px-4 py-2 rounded-xl border">{t.addChange}</Link>
        <Link href="/children" className="px-4 py-2 rounded-xl border">{t.children}</Link>
        <button onClick={signOut} className="px-4 py-2 rounded-xl border">{t.signOut}</button>
      </div>
    </main>
  );
}
