'use client';
import Navbar from './Navbar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const supabase = createClientComponentClient();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setLoggedIn(!!session);
        };
        checkSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoggedIn(!!session);
        });

        return () => listener.subscription.unsubscribe();
    }, [supabase]);

    return (
        <>
            {pathname !== '/login' && loggedIn && <Navbar />}
            <main className="pt-20 px-4 sm:px-8 max-w-5xl mx-auto">{children}</main>
        </>
    );
}
