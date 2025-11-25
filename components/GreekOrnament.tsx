'use client';

import { motion } from 'framer-motion';

interface GreekOrnamentProps {
  type?: 'header' | 'divider' | 'footer';
}

export default function GreekOrnament({ type = 'divider' }: GreekOrnamentProps) {
  if (type === 'header') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-4"
      >
        <div className="inline-flex items-center gap-4 text-[var(--gold-accent)]">
          <span className="text-2xl">☽</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">✦</span>
            <span className="text-xl">⚜</span>
            <span className="text-lg">✦</span>
          </div>
          <span className="text-2xl">☾</span>
        </div>
      </motion.div>
    );
  }

  if (type === 'footer') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center py-8 mt-12"
      >
        <div className="inline-flex flex-col items-center gap-3 text-[var(--gold-accent)]">
          <div className="flex items-center gap-4">
            <span className="text-sm">━━━</span>
            <span className="text-xl">⚱</span>
            <span className="text-sm">━━━</span>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--text-muted)] font-heading">
            Γνῶθι σεαυτόν
          </p>
          <p className="text-[10px] tracking-wider text-[var(--text-muted)]">
            Know Thyself
          </p>
        </div>
      </motion.div>
    );
  }

  // Default divider
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-4 my-8 text-[var(--gold-accent)]"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--gold-accent)]" />
      <span className="text-lg">❧</span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--gold-accent)]" />
    </motion.div>
  );
}

