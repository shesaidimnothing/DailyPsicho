'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import AuthModal from './AuthModal';
import { useAuth } from './AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <nav className="py-6 relative">
        {/* Greek pattern top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--gold-accent)] to-transparent opacity-60" />
        
        <div className="max-w-4xl mx-auto px-6">
          {/* Logo and main nav */}
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              {/* Greek column icon */}
              <span className="text-[var(--gold-accent)] text-2xl">🏛</span>
              <Link href="/" className="group">
                <span className="text-2xl font-heading font-bold tracking-wide" data-translate>
                  Daily Psicho
                </span>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] font-heading">
                  Wisdom for the Mind
                </span>
              </Link>
            </motion.div>

            <motion.div
              className="flex gap-2 md:gap-4 items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ul className="flex gap-4 md:gap-6 items-center">
                <li>
                  <Link
                    href="/"
                    className={`relative text-sm uppercase tracking-wider transition-colors hover:text-[var(--gold-accent)] ${
                      pathname === '/' ? 'font-semibold text-[var(--gold-accent)]' : 'text-[var(--text-muted)]'
                    }`}
                    data-translate
                  >
                    Today
                    {pathname === '/' && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--gold-accent)]"
                      />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/archive"
                    className={`relative text-sm uppercase tracking-wider transition-colors hover:text-[var(--gold-accent)] ${
                      pathname === '/archive' ? 'font-semibold text-[var(--gold-accent)]' : 'text-[var(--text-muted)]'
                    }`}
                    data-translate
                  >
                    Archive
                    {pathname === '/archive' && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--gold-accent)]"
                      />
                    )}
                  </Link>
                </li>
              </ul>

              {/* Vertical divider */}
              <span className="hidden md:block w-px h-6 bg-[var(--border-color)]" />

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
                
                {!loading && (
                  user ? (
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-xs text-[var(--text-muted)] hidden lg:block max-w-[120px] truncate">
                        {user.email}
                      </span>
                      <button
                        onClick={logout}
                        className="text-xs uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--gold-accent)] transition-colors px-3 py-1.5 border border-[var(--border-color)] hover:border-[var(--gold-accent)]"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-xs uppercase tracking-wider px-4 py-2 bg-[var(--gold-accent)] text-black font-semibold hover:bg-[var(--gold-dark)] transition-colors"
                    >
                      Sign In
                    </button>
                  )
                )}
              </div>
            </motion.div>
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
