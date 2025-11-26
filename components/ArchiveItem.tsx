'use client';

import Link from 'next/link';
import ArticleBadges from './ArticleBadges';
import type { DailyTopic } from '@/types/topic';

interface ArchiveItemProps {
  topic: DailyTopic;
  index: number;
}

export default function ArchiveItem({ topic }: ArchiveItemProps) {
  return (
    <article className="border-b border-[var(--border-color)] pb-6 md:pb-8 last:border-0">
      <Link
        href={`/topic/${topic.date}`}
        className="block"
      >
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
          <h2 className="font-title text-xl md:text-2xl lg:text-3xl font-semibold" data-translate>
            {topic.title}
          </h2>
          <ArticleBadges articleId={topic.id} />
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-[var(--text-muted)] uppercase tracking-wider mb-3 md:mb-4">
          <span>
            {new Date(topic.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="text-[var(--gold-accent)]">•</span>
          <span>{topic.readingTime} min read</span>
          <span className="text-[var(--gold-accent)]">•</span>
          <span className="capitalize">{topic.category}</span>
        </div>
        <p className="text-sm md:text-base text-[var(--text-secondary)] line-clamp-3" data-translate>
          {topic.content.substring(0, 200)}...
        </p>
      </Link>
    </article>
  );
}
