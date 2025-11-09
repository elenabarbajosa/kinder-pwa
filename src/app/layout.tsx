import './globals.css';
import type { Metadata } from 'next';
import { es as t } from '@/strings';
import SWRegister from './sw-register';
import ClientLayout from './ClientLayout'; // 👈 new client wrapper

export const metadata: Metadata = {
  title: t.appTitle,
  description: 'Gestión de cambios de horario',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* ✅ PWA essentials */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff6fa8" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* ✅ iOS fixes for viewport & input controls */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />

        {/* ✅ Favicons */}
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="La Cometa Horarios" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>

      <body className="bg-[var(--color-bg)] text-black min-h-screen overflow-x-hidden touch-manipulation">
        <SWRegister />
        {/* ✅ Client-only layout logic */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
