'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { DailyTopic } from '@/types/topic';

interface ArchiveItemProps {
  topic: DailyTopic;
  index: number;
}

export default function ArchiveItem({ topic, index }: ArchiveItemProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-b border-foreground/10 pb-8 last:border-0"
    >
      <Link
        href={`/topic/${topic.date}`}
        className="block group hover:opacity-80 transition-opacity"
      >
        <h2 className="font-title text-2xl md:text-3xl font-semibold mb-3 group-hover:underline" data-translate>
          {topic.title}
        </h2>
        <div className="flex items-center gap-4 text-sm text-foreground/60 uppercase tracking-wider mb-4">
          <span>
            {new Date(topic.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="greek-border w-8 h-0"></span>
          <span>{topic.readingTime} min read</span>
          <span className="greek-border w-8 h-0"></span>
          <span className="capitalize">{topic.category}</span>
        </div>
        <p className="text-foreground/70 line-clamp-3" data-translate>
          {topic.content.substring(0, 200)}...
        </p>
      </Link>
    </motion.article>
  );
}

