'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Language = 'en' | 'fr';

export default function LanguageToggle() {
  const [language, setLanguage] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false); // kept for UI state, but no network calls

  useEffect(() => {
    // Load saved language preference from localStorage
    const saved = localStorage.getItem('dailypsicho-language') as Language | null;
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLanguage(saved);
      // Just sync the lang attribute; actual translation is handled by the browser
      document.documentElement.lang = saved;
    }
  }, []);

  /**
   * Instead of calling any external translation API (which runs into CORS,
   * rate limits, and privacy questions), we:
   *
   * - Toggle the <html lang="..."> attribute between 'en' and 'fr'
   * - Let the browser / user's device handle translation (e.g. Chrome's
   *   built-in “Translate this page” feature)
   *
   * This way, no text is ever sent to a third‑party translation API from
   * our code, and we avoid all CORS issues.
   */
  const applyLanguage = (lang: Language) => {
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  const handleToggle = async () => {
    const newLang = language === 'en' ? 'fr' : 'en';
    setLanguage(newLang);
    localStorage.setItem('dailypsicho-language', newLang);
    applyLanguage(newLang);
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isTranslating}
      className="flex items-center gap-2 px-3 py-1.5 border border-foreground/20 hover:border-foreground/40 transition-colors text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={{ scale: isTranslating ? 1 : 1.05 }}
      whileTap={{ scale: isTranslating ? 1 : 0.95 }}
      aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
    >
      {isTranslating ? (
        <span className="text-sm">...</span>
      ) : language === 'en' ? (
        <>
          <span className="text-lg">🇫🇷</span>
          <span>FR</span>
        </>
      ) : (
        <>
          <span className="text-lg">🇬🇧</span>
          <span>EN</span>
        </>
      )}
    </motion.button>
  );
}

