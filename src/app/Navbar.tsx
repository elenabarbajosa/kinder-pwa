'use client';

import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `pb-[2px] transition-colors border-b-2 ${
      pathname === path
        ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
        : 'border-transparent text-gray-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm z-50">
      <div className="w-full flex items-center justify-between px-6 sm:px-12 h-14">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <img
            src="/favicon/Untitled_Artwork copy.png"
            alt="La Cometa logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-lg text-[var(--color-primary-dark)]">
            Horarios <span className="font-bold">La Cometa</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-8 text-sm font-medium">
          <a href="/" className={linkClass('/')}>
            Inicio
          </a>
          <a href="/today" className={linkClass('/today')}>
            Hoy
          </a>
          <a href="/change" className={linkClass('/change')}>
            Registrar cambio
          </a>
          <a href="/children" className={linkClass('/children')}>
            Alumn@s
          </a>
        </nav>
      </div>
    </header>
  );
}
