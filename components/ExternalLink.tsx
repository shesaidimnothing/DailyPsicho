'use client';

import { motion } from 'framer-motion';
import type { ExternalLink as ExternalLinkType } from '@/types/topic';

interface ExternalLinkProps {
  link: ExternalLinkType;
  index?: number;
}

export default function ExternalLink({ link, index = 0 }: ExternalLinkProps) {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ x: 5 }}
      className="block border-l-2 border-foreground/20 pl-4 py-3 my-4 transition-colors hover:border-foreground/40 hover:bg-foreground/5"
    >
      <h4 className="font-title font-semibold mb-1" data-translate>{link.title}</h4>
      {link.description && (
        <p className="text-sm text-foreground/70" data-translate>{link.description}</p>
      )}
      <span className="text-xs text-foreground/50 mt-2 inline-block">
        {new URL(link.url).hostname} →
      </span>
    </motion.a>
  );
}

