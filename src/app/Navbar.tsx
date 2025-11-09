'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const linkClass = (path: string) =>
        `block py-2 sm:py-0 transition-colors border-b-2 sm:border-none ${pathname === path
            ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
            : 'border-transparent text-gray-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]'
        }`;

    return (
        <header className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm z-50">
            <div className="max-w-6xl mx-auto px-6 sm:px-12 h-14 flex items-center justify-between">
                {/* Logo + Title */}
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

                {/* Desktop nav */}
                <nav className="hidden sm:flex items-center gap-8 text-sm font-medium">
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

                {/* Hamburger icon (mobile only) */}
                <button
                    className="sm:hidden flex flex-col justify-center items-center w-8 h-8"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Toggle menu"
                >
                    <span
                        className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''
                            }`}
                    ></span>
                    <span
                        className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''
                            }`}
                    ></span>
                    <span
                        className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''
                            }`}
                    ></span>
                </button>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="sm:hidden bg-white border-t border-[var(--color-border)] shadow-md px-6 py-3 flex flex-col gap-3 text-sm font-medium"
                    >
                        <a href="/" className={linkClass('/')} onClick={() => setMenuOpen(false)}>
                            Inicio
                        </a>
                        <a href="/today" className={linkClass('/today')} onClick={() => setMenuOpen(false)}>
                            Hoy
                        </a>
                        <a href="/change" className={linkClass('/change')} onClick={() => setMenuOpen(false)}>
                            Registrar cambio
                        </a>
                        <a href="/children" className={linkClass('/children')} onClick={() => setMenuOpen(false)}>
                            Alumn@s
                        </a>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
