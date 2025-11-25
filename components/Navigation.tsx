'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import LanguageToggle from './LanguageToggle';
import AuthModal from './AuthModal';
import { useAuth } from './AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <nav className="border-b border-foreground/10 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-2xl font-heading font-bold tracking-wide" data-translate>
              Daily Psicho
            </Link>
          </motion.div>

          <motion.div
            className="flex gap-4 md:gap-8 items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ul className="flex gap-4 md:gap-8 items-center">
              <li>
                <Link
                  href="/"
                  className={`text-sm uppercase tracking-wider transition-colors hover:text-foreground/70 ${
                    pathname === '/' ? 'font-semibold' : 'text-foreground/60'
                  }`}
                  data-translate
                >
                  Today
                </Link>
              </li>
              <li>
                <Link
                  href="/archive"
                  className={`text-sm uppercase tracking-wider transition-colors hover:text-foreground/70 ${
                    pathname === '/archive' ? 'font-semibold' : 'text-foreground/60'
                  }`}
                  data-translate
                >
                  Archive
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-4">
              <LanguageToggle />
              
              {!loading && (
                user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground/60 hidden md:block">
                      {user.email}
                    </span>
                    <button
                      onClick={logout}
                      className="text-sm uppercase tracking-wider text-foreground/60 hover:text-foreground transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-sm uppercase tracking-wider px-4 py-2 border border-foreground/20 hover:border-foreground/40 transition-colors"
                  >
                    Sign In
                  </button>
                )
              )}
            </div>
          </motion.div>
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
