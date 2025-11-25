'use client';

import { useAuth } from './AuthContext';

interface ArticleBadgesProps {
  date: string;
  showLabels?: boolean;
}

export default function ArticleBadges({ date, showLabels = false }: ArticleBadgesProps) {
  const { readArticles, rewrittenDates } = useAuth();

  const isRead = readArticles.includes(date);
  const isRewritten = rewrittenDates.includes(date);

  if (!isRead && !isRewritten) return null;

  return (
    <div className="flex gap-2 items-center">
      {isRead && (
        <span 
          className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs uppercase tracking-wider"
          title="You've read this article"
        >
          <span>✓</span>
          {showLabels && <span>Read</span>}
        </span>
      )}
      {isRewritten && (
        <span 
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs uppercase tracking-wider"
          title="This article has been rewritten"
        >
          <span>↻</span>
          {showLabels && <span>Rewritten</span>}
        </span>
      )}
    </div>
  );
}

