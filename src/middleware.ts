import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // 🔍 Refresh session if needed (this keeps you logged in)
    await supabase.auth.getSession();

    const { pathname } = req.nextUrl;
    const sessionResponse = await supabase.auth.getSession();
    const session = sessionResponse.data.session;

    // ✅ Protect all routes except /login
    if (!session && pathname !== '/login') {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        return NextResponse.redirect(redirectUrl);
    }

    // ✅ If logged in and tries to access /login, redirect to /today
    if (session && pathname === '/login') {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/today';
        return NextResponse.redirect(redirectUrl);
    }

    return res;
}

export const config = {
    matcher: [
        /*
          Match all routes except static files and Next internal paths
        */
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|site.webmanifest).*)',
    ],
};
