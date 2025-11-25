'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import LanguageToggle from './LanguageToggle';

export default function Navigation() {
  const pathname = usePathname();

  return (
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
          className="flex gap-8 items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ul className="flex gap-8 items-center">
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
          <LanguageToggle />
        </motion.div>
      </div>
    </nav>
  );
}

