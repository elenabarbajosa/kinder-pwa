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


        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="La Cometa Horarios" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="theme-color" content="#ff6fa8" />


        {/* iOS App Icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/favicon/AppImages/ios/57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/favicon/AppImages/ios/60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/favicon/AppImages/ios/72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/favicon/AppImages/ios/76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/favicon/AppImages/ios/114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/favicon/AppImages/ios/120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/favicon/AppImages/ios/144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicon/AppImages/ios/152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/AppImages/ios/180.png" />

        {/* Android App Icons */}
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon/AppImages/android/android-launchericon-48-48.png" />
        <link rel="icon" type="image/png" sizes="72x72" href="/favicon/AppImages/android/android-launchericon-72-72.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon/AppImages/android/android-launchericon-96-96.png" />
        <link rel="icon" type="image/png" sizes="144x144" href="/favicon/AppImages/android/android-launchericon-144-144.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/AppImages/android/android-launchericon-192-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon/AppImages/android/android-launchericon-512-512.png" />

        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/favicon/AppImages/ios/180.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/favicon/AppImages/ios/152.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/favicon/AppImages/ios/120.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />




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
