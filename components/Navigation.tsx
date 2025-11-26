'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import AuthModal from './AuthModal';
import { useAuth } from './AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <nav className="py-3 md:py-4 relative">
        {/* Greek pattern top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--gold-accent)] to-transparent opacity-60" />
        
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Logo and main nav */}
          <div className="flex items-center justify-between gap-2">
            {/* Logo - simplified on mobile */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-[var(--gold-accent)] text-xl md:text-2xl">🏛</span>
              <div>
                <span className="text-lg md:text-xl font-heading font-bold tracking-wide" data-translate>
                  Daily Psicho
                </span>
                <span className="hidden sm:block text-[9px] tracking-[0.15em] uppercase text-[var(--text-muted)] font-heading">
                  Wisdom for the Mind
                </span>
              </div>
            </Link>

            {/* Right side controls */}
            <div className="flex items-center gap-1.5 md:gap-3">
              {/* Nav links */}
              <Link
                href="/"
                className={`text-xs md:text-sm uppercase tracking-wider px-2 py-1 ${
                  pathname === '/' 
                    ? 'font-semibold text-[var(--gold-accent)] border-b-2 border-[var(--gold-accent)]' 
                    : 'text-[var(--text-muted)]'
                }`}
                data-translate
              >
                Today
              </Link>
              <Link
                href="/archive"
                className={`text-xs md:text-sm uppercase tracking-wider px-2 py-1 ${
                  pathname === '/archive' 
                    ? 'font-semibold text-[var(--gold-accent)] border-b-2 border-[var(--gold-accent)]' 
                    : 'text-[var(--text-muted)]'
                }`}
                data-translate
              >
                Archive
              </Link>

              {/* Divider - desktop only */}
              <span className="hidden md:block w-px h-5 bg-[var(--border-color)] mx-1" />

              {/* Theme toggle */}
              <ThemeToggle />
              
              {/* Auth button */}
              {!loading && (
                user ? (
                  <button
                    onClick={logout}
                    className="text-[10px] md:text-xs uppercase tracking-wider text-[var(--text-muted)] px-2 py-1 border border-[var(--border-color)]"
                  >
                    Out
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-[10px] md:text-xs uppercase tracking-wider px-2 md:px-3 py-1.5 bg-[var(--gold-accent)] text-black font-semibold"
                  >
                    Sign In
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Greek pattern bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--gold-accent)] to-transparent opacity-40" />
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
