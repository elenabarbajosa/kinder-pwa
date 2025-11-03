import './globals.css';
import type { Metadata } from 'next';
import { es as t } from '@/strings';
import SWRegister from './sw-register'; // 👈 we’ll create this file below

export const metadata: Metadata = {
  title: t.appTitle,
  description: 'Gestión de cambios de horario',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* PWA essentials */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>

      <body className="min-h-screen bg-white text-black">
        {/* Register service worker */}
        <SWRegister />

        <div className="max-w-4xl mx-auto p-4">
          <header className="flex items-center justify-between mb-4">
            <nav className="flex gap-3 text-sm">
              <a className="px-3 py-2 rounded-xl border" href="/">{t.home}</a>
              <a className="px-3 py-2 rounded-xl border" href="/today">{t.today}</a>
              <a className="px-3 py-2 rounded-xl border" href="/change">{t.addChange}</a>
              <a className="px-3 py-2 rounded-xl border" href="/children">{t.children}</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
