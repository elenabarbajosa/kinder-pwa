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
          <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-sm rounded-2xl mb-6 p-3 border border-[var(--color-border)]">
            <nav className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {[
                { label: t.home, href: '/' },
                { label: t.today, href: '/today' },
                { label: t.addChange, href: '/change' },
                { label: t.children, href: '/children' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200 shadow-sm"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
